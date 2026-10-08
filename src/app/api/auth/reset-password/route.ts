import { NextRequest, NextResponse } from "next/server";
import { updateStaffPassword } from "@/lib/staff-auth";

export async function POST(request: NextRequest) {
  let body: { password?: string; token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const password = body.password || "";
  if (!password || password.length < 8) {
    return NextResponse.json({ error: "Mật khẩu mới phải có tối thiểu 8 ký tự." }, { status: 400 });
  }

  try {
    await updateStaffPassword(password, body.token);
    return NextResponse.json({ ok: true, message: "Mật khẩu đã được cập nhật thành công." });
  } catch (error) {
    console.error("Password update failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Không thể đặt lại mật khẩu." },
      { status: 400 }
    );
  }
}
