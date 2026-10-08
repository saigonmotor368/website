import { NextRequest, NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/staff-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const service = url.searchParams.get("service");
  const source = url.searchParams.get("source");
  const assignedTo = url.searchParams.get("assigned_to");

  const admin = getSupabaseAdmin();

  let query = admin
    .from("leads")
    .select(
      "id, created_at, updated_at, name, phone, service, vehicle_type, processing_location, message, source_path, utm_source, utm_medium, utm_campaign, gclid, status, assigned_to, contacted_at, qualified_at, file_received_at, completed_at, lost_reason, email_status, email_last_attempt_at"
    )
    .order("created_at", { ascending: false })
    .limit(300);

  if (status) query = query.eq("status", status);
  if (service) query = query.eq("service", service);
  if (source) query = query.eq("utm_source", source);
  if (assignedTo === "unassigned") {
    query = query.is("assigned_to", null);
  } else if (assignedTo) {
    query = query.eq("assigned_to", assignedTo);
  }

  const [leadsRes, staffRes] = await Promise.all([
    query,
    admin
      .from("staff_profiles")
      .select("user_id, full_name, role")
      .eq("is_active", true),
  ]);

  if (leadsRes.error) {
    if (leadsRes.error.code === "PGRST205" || leadsRes.error.message?.includes("schema cache")) {
      return NextResponse.json({ leads: [], staff: staffRes.data || [] });
    }
    console.error("Lead list failed", leadsRes.error);
    return NextResponse.json({ error: "Không thể tải danh sách khách hàng" }, { status: 500 });
  }

  return NextResponse.json({
    leads: leadsRes.data || [],
    staff: staffRes.data || [],
  });
}
