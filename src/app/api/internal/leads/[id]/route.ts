import { NextRequest, NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/staff-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const statuses = new Set(["new", "contacted", "qualified", "file_received", "completed", "lost"]);

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const { id } = await context.params;
  const admin = getSupabaseAdmin();

  const [leadRes, eventsRes, staffRes] = await Promise.all([
    admin.from("leads").select("*").eq("id", id).single(),
    admin.from("lead_events").select("*").eq("lead_id", id).order("occurred_at", { ascending: false }),
    admin.from("staff_profiles").select("user_id, full_name, role"),
  ]);

  if (leadRes.error || !leadRes.data) {
    return NextResponse.json({ error: "Không tìm thấy khách hàng" }, { status: 404 });
  }

  const staffMap: Record<string, string> = {};
  for (const s of staffRes.data || []) {
    staffMap[s.user_id] = s.full_name;
  }

  const eventsWithActors = (eventsRes.data || []).map((e) => ({
    ...e,
    actor_name: e.actor_id ? staffMap[e.actor_id] || "Hệ thống" : "Hệ thống",
  }));

  return NextResponse.json({
    lead: leadRes.data,
    events: eventsWithActors,
  });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const { id } = await context.params;
  let body: {
    status?: string;
    lostReason?: string;
    assignedTo?: string | null;
    contactedAt?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const now = new Date().toISOString();
  const update: Record<string, unknown> = {
    updated_at: now,
  };

  const eventsToInsert: Array<{
    lead_id: string;
    event_name: string;
    actor_id: string;
    occurred_at: string;
    metadata: Record<string, unknown>;
  }> = [];

  // Update status if present
  if (body.status !== undefined) {
    if (!statuses.has(body.status)) {
      return NextResponse.json({ error: "Trạng thái không hợp lệ" }, { status: 400 });
    }
    update.status = body.status;

    if (body.status === "contacted") update.contacted_at = now;
    if (body.status === "qualified") update.qualified_at = now;
    if (body.status === "file_received") update.file_received_at = now;
    if (body.status === "completed") update.completed_at = now;
    if (body.status === "lost") {
      update.lost_reason = (body.lostReason || "").trim().slice(0, 500) || "Không ghi rõ";
    }

    eventsToInsert.push({
      lead_id: id,
      event_name: body.status,
      actor_id: staff.user.id,
      occurred_at: now,
      metadata: body.status === "lost" ? { reason: update.lost_reason } : {},
    });
  }

  // Update assigned_to if present
  if (body.assignedTo !== undefined) {
    update.assigned_to = body.assignedTo;
    eventsToInsert.push({
      lead_id: id,
      event_name: "assigned",
      actor_id: staff.user.id,
      occurred_at: now,
      metadata: { assigned_to: body.assignedTo },
    });
  }

  // Update contactedAt if explicitly provided
  if (body.contactedAt !== undefined) {
    update.contacted_at = body.contactedAt;
  }

  const { data, error } = await admin
    .from("leads")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Lead update failed", error);
    return NextResponse.json({ error: "Không thể cập nhật khách hàng" }, { status: 500 });
  }

  if (eventsToInsert.length > 0) {
    await admin.from("lead_events").insert(eventsToInsert);
  }

  return NextResponse.json({ ok: true, data });
}
