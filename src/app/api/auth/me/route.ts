import { NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/staff-auth";

export async function GET() {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: staff.user.id,
      email: staff.user.email,
    },
    profile: {
      userId: staff.profile.user_id,
      role: staff.profile.role,
      fullName: staff.profile.full_name,
    },
  });
}
