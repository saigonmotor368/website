import { NextRequest, NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/staff-auth";
import { SupabaseEntities, withRetry } from "@/lib/supabase-entities";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const caseItem = await SupabaseEntities.getCaseById(id);
    if (!caseItem) {
      return NextResponse.json({ error: "Không tìm thấy hồ sơ" }, { status: 404 });
    }
    return NextResponse.json(caseItem);
  } catch {
    return NextResponse.json({ error: "Lỗi truy vấn hồ sơ từ Supabase" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const { id } = await params;
  let body: {
    action?: "update_status" | "adjust_items" | "update_documents" | "toggle_lock" | "add_cost" | "approve_cost" | "update_vehicle";
    status?: "new" | "processing" | "completed";
    notes?: string;
    items?: Array<{
      id: string;
      adjusted_price: number;
      quantity?: number;
      adjustment_reason?: string;
    }>;
    documents?: Array<{
      id: string;
      status: "required" | "received" | "missing";
      note?: string;
    }>;
    cost?: {
      cost_group: string;
      description: string;
      amount: number;
      incurred_date?: string;
    };
    cost_id?: string;
    approve_status?: "approved" | "rejected";
    vehicle?: {
      license_plate?: string;
      owner_name?: string;
      brand?: string;
      model?: string;
      engine_number?: string;
      chassis_number?: string;
      address?: string;
    };
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu JSON không hợp lệ" }, { status: 400 });
  }

  const existing = await SupabaseEntities.getCaseById(id);
  if (!existing) {
    return NextResponse.json({ error: "Không tìm thấy hồ sơ" }, { status: 404 });
  }

  const now = new Date().toISOString();
  const actorName = staff.profile.full_name || staff.user.email;
  const isOwner = staff.profile.role === "owner";
  const admin = getSupabaseAdmin();

  // Check if locked and trying to modify
  if (existing.is_locked && body.action !== "toggle_lock") {
    return NextResponse.json(
      { error: "Hồ sơ đã bị khóa số liệu nghiệm thu. Chỉ chủ hệ thống mới có thể mở khóa để chỉnh sửa." },
      { status: 403 }
    );
  }

  try {
    // 1. Update status
    if (body.action === "update_status" && body.status) {
      const oldStatus = existing.status;
      const completedAt = body.status === "completed" ? now : null;

      await withRetry(async () => {
        const { error } = await admin
          .from("cases")
          .update({
            status: body.status,
            notes: body.notes !== undefined ? body.notes : existing.notes,
            completed_at: completedAt,
            updated_at: now,
          })
          .eq("id", id);
        if (error) throw error;
      });

      await SupabaseEntities.logAudit({
        action: "change_status",
        entityType: "case",
        entityId: id,
        actorName,
        details: `Chuyển trạng thái từ '${oldStatus}' sang '${body.status}'`,
      });
    }

    // 2. Adjust items (Quản lý giá - Bắt buộc lý do nếu khác giá báo ban đầu)
    else if (body.action === "adjust_items" && body.items) {
      let finalAmountSum = 0;

      for (const update of body.items) {
        const item = existing.items.find((i) => i.id === update.id);
        if (!item) continue;

        if (update.adjusted_price !== item.quoted_price && !update.adjustment_reason?.trim()) {
          return NextResponse.json(
            { error: `Bắt buộc phải nhập lý do điều chỉnh giá cho dịch vụ: ${item.service_name}` },
            { status: 400 }
          );
        }

        const qty = update.quantity || item.quantity || 1;
        const finalPrice = update.adjusted_price * qty;

        await withRetry(async () => {
          const { error } = await admin
            .from("case_items")
            .update({
              adjusted_price: update.adjusted_price,
              quantity: qty,
              adjustment_reason: update.adjustment_reason?.trim() || null,
              final_price: finalPrice,
            })
            .eq("id", update.id);
          if (error) throw error;
        });

        await SupabaseEntities.logAudit({
          action: "adjust_price",
          entityType: "case",
          entityId: id,
          actorName,
          details: `Điều chỉnh dịch vụ "${item.service_name}": ${item.quoted_price.toLocaleString("vi-VN")}đ -> ${update.adjusted_price.toLocaleString("vi-VN")}đ. Lý do: ${update.adjustment_reason || "Không đổi"}`,
        });
      }

      // Recalculate total case final_amount
      const { data: allItems } = await admin.from("case_items").select("final_price").eq("case_id", id);
      finalAmountSum = (allItems || []).reduce((sum, it) => sum + Number(it.final_price || 0), 0);

      await withRetry(async () => {
        await admin.from("cases").update({ final_amount: finalAmountSum, updated_at: now }).eq("id", id);
      });
    }

    // 3. Update document checklist
    else if (body.action === "update_documents" && body.documents) {
      for (const docUpdate of body.documents) {
        const doc = existing.documents.find((d) => d.id === docUpdate.id);
        if (!doc) continue;

        const verifiedAt = docUpdate.status === "received" ? now : null;
        const verifiedBy = docUpdate.status === "received" ? staff.user.id : null;

        await withRetry(async () => {
          const { error } = await admin
            .from("case_documents")
            .update({
              status: docUpdate.status,
              note: docUpdate.note !== undefined ? docUpdate.note : doc.note,
              verified_at: verifiedAt,
              verified_by: verifiedBy,
            })
            .eq("id", docUpdate.id);
          if (error) throw error;
        });

        if (doc.status !== docUpdate.status) {
          await SupabaseEntities.logAudit({
            action: "update_document",
            entityType: "case",
            entityId: id,
            actorId: staff.user.id,
            actorName,
            details: `Cập nhật giấy tờ "${doc.document_name}": ${docUpdate.status}`,
          });
        }
      }
    }

    // 4. Update Vehicle from OCR or manual input
    else if (body.action === "update_vehicle" && body.vehicle) {
      const vData = body.vehicle;
      let targetVehId = existing.vehicles[0]?.vehicle_id;

      if (!targetVehId) {
        const newVeh = await SupabaseEntities.saveVehicle({
          customer_id: existing.customer_id,
          license_plate: vData.license_plate,
          owner_name: vData.owner_name,
          brand: vData.brand,
          model: vData.model,
          engine_number: vData.engine_number,
          chassis_number: vData.chassis_number,
        });
        targetVehId = newVeh.id;

        await admin.from("case_vehicles").insert({
          id: crypto.randomUUID(),
          case_id: id,
          vehicle_id: targetVehId,
          vehicle_count: 1,
        });
      } else {
        await SupabaseEntities.saveVehicle({
          id: targetVehId,
          customer_id: existing.customer_id,
          license_plate: vData.license_plate,
          owner_name: vData.owner_name,
          brand: vData.brand,
          model: vData.model,
          engine_number: vData.engine_number,
          chassis_number: vData.chassis_number,
        });
      }

      await SupabaseEntities.logAudit({
        action: "update_vehicle",
        entityType: "case",
        entityId: id,
        actorId: staff.user.id,
        actorName,
        details: `Cập nhật thông tin phương tiện: Biển số ${vData.license_plate || ""}`,
      });
    }

    // 5. Add Cost (Staff: draft; Owner: approved)
    else if (body.action === "add_cost" && body.cost) {
      const costAmount = Math.round(Number(body.cost.amount) || 0);
      const costStatus = isOwner ? "approved" : "draft";

      await withRetry(async () => {
        const { error } = await admin.from("case_costs").insert({
          id: crypto.randomUUID(),
          case_id: id,
          cost_group: body.cost?.cost_group || "Chi phí dịch vụ",
          description: body.cost?.description || "",
          amount: costAmount,
          incurred_date: body.cost?.incurred_date || now.slice(0, 10),
          status: costStatus,
          submitted_by: staff.user.id,
          approved_by: isOwner ? staff.user.id : null,
          approved_at: isOwner ? now : null,
          receipt_url: JSON.stringify({ submitted_by: actorName, approved_by: isOwner ? actorName : undefined }),
        });
        if (error) throw error;
      });

      await SupabaseEntities.logAudit({
        action: "add_cost",
        entityType: "case",
        entityId: id,
        actorId: staff.user.id,
        actorName,
        details: `Nhập chi phí "${body.cost.description}": ${costAmount.toLocaleString("vi-VN")}đ (${costStatus === "approved" ? "Đã duyệt" : "Bản nháp"})`,
      });
    }

    // 6. Approve Cost (Strictly Owner)
    else if (body.action === "approve_cost" && body.cost_id) {
      if (!isOwner) {
        return NextResponse.json(
          { error: "Chỉ chủ hệ thống (Owner - Phạm Xuân Định) mới có quyền duyệt hoặc từ chối chi phí." },
          { status: 403 }
        );
      }

      const costItem = existing.costs.find((c) => c.id === body.cost_id);
      if (costItem) {
        const newStatus = body.approve_status || "approved";

        await withRetry(async () => {
          if (newStatus === "approved") {
            await SupabaseEntities.approveCaseCost(body.cost_id!, staff.user.id, actorName);
          } else {
            const { error } = await admin
              .from("case_costs")
              .update({
                status: newStatus,
                approved_by: staff.user.id,
                approved_at: now,
                receipt_url: JSON.stringify({ submitted_by: costItem.submitted_by, approved_by: actorName }),
              })
              .eq("id", body.cost_id);
            if (error) throw error;

            await SupabaseEntities.logAudit({
              action: "reject_cost",
              entityType: "case",
              entityId: id,
              actorId: staff.user.id,
              actorName,
              details: `Từ chối chi phí "${costItem.description}": ${costItem.amount.toLocaleString("vi-VN")}đ`,
            });
          }
        });
      }
    }

    // 7. Lock / Unlock Case (Strictly Owner)
    else if (body.action === "toggle_lock") {
      if (!isOwner) {
        return NextResponse.json(
          { error: "Chỉ chủ hệ thống (Owner - Phạm Xuân Định) mới có quyền khóa hoặc mở khóa nghiệm thu hồ sơ." },
          { status: 403 }
        );
      }

      const newLockState = !existing.is_locked;

      await withRetry(async () => {
        const { error } = await admin
          .from("cases")
          .update({
            is_locked: newLockState,
            locked_at: newLockState ? now : null,
            updated_at: now,
          })
          .eq("id", id);
        if (error) throw error;
      });

      await SupabaseEntities.logAudit({
        action: newLockState ? "lock_case" : "unlock_case",
        entityType: "case",
        entityId: id,
        actorId: staff.user.id,
        actorName,
        details: newLockState
          ? "Khóa hồ sơ và chốt toàn bộ số liệu doanh thu / chi phí nghiệm thu."
          : "Mở khóa hồ sơ để điều chỉnh bổ sung.",
      });
    }

    const reloaded = await SupabaseEntities.getCaseById(id);
    return NextResponse.json({ ok: true, case: reloaded });
  } catch (err) {
    console.error("Lỗi cập nhật hồ sơ vào Supabase:", err);
    return NextResponse.json({ error: "Không thể cập nhật hồ sơ vào Supabase" }, { status: 500 });
  }
}
