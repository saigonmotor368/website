import { NextRequest, NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/staff-auth";

export async function POST(request: NextRequest) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Vui lòng nhập địa chỉ email hợp lệ." }, { status: 400 });
  }

  try {
    await requestPasswordReset(email);
    return NextResponse.json({
      ok: true,
      message: "Nếu email tồn tại trong hệ thống, hướng dẫn khôi phục mật khẩu đã được gửi.",
    });
  } catch (error) {
    console.error("Forgot password request failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Không thể gửi yêu cầu đặt lại mật khẩu." },
      { status: 500 }
    );
  }
}
