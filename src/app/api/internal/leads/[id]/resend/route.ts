import { NextRequest, NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/staff-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { sendLeadNotificationEmail } from "@/lib/lead-notify";

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const { id } = await context.params;
  const admin = getSupabaseAdmin();

  const { data: lead, error: fetchError } = await admin
    .from("leads")
    .select("id, name, phone, service, vehicle_type, processing_location, message, email_status")
    .eq("id", id)
    .single();

  if (fetchError || !lead) {
    return NextResponse.json({ error: "Không tìm thấy khách hàng" }, { status: 404 });
  }

  const result = await sendLeadNotificationEmail(lead);
  const now = new Date().toISOString();

  await admin
    .from("leads")
    .update({
      email_status: result.sent ? "sent" : "failed",
      email_last_attempt_at: now,
      updated_at: now,
    })
    .eq("id", id);

  await admin.from("lead_events").insert({
    lead_id: id,
    event_name: "email_resent",
    actor_id: staff.user.id,
    metadata: {
      success: result.sent,
      simulated: !!result.simulated,
      error: result.error || null,
    },
  });

  return NextResponse.json({
    ok: true,
    sent: result.sent,
    simulated: !!result.simulated,
    email_status: result.sent ? "sent" : "failed",
  });
}
