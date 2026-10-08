import { NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/staff-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  // System settings is restricted strictly to system owner
  if (staff.profile.role !== "owner") {
    return NextResponse.json(
      { error: "Chỉ chủ hệ thống (Owner) mới có quyền truy cập cấu hình hệ thống" },
      { status: 403 }
    );
  }

  // Check Supabase connectivity
  let supabaseStatus: "connected" | "error" = "connected";
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.from("quotes").select("id").limit(1);
    if (error) {
      supabaseStatus = "error";
    }
  } catch {
    supabaseStatus = "error";
  }

  // Check Gemini API Key (server-only check, NEVER expose the secret value)
  const geminiConfigured = Boolean(
    process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 10
  );

  // Check Resend API Key
  const resendConfigured = Boolean(
    process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim().length > 10
  );

  return NextResponse.json({
    supabase: {
      status: supabaseStatus,
      label: supabaseStatus === "connected" ? "Đã kết nối" : "Lỗi kết nối",
    },
    gemini: {
      status: geminiConfigured ? "configured" : "not_configured",
      label: geminiConfigured ? "Đã cấu hình" : "Chưa cấu hình",
    },
    resend: {
      status: resendConfigured ? "configured" : "not_configured",
      label: resendConfigured ? "Đã cấu hình" : "Chưa cấu hình",
    },
    serverTime: new Date().toISOString(),
    ownerName: staff.profile.full_name,
  });
}
