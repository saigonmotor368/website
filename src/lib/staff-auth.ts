import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const ACCESS_COOKIE = "sgm_staff_access";
export const REFRESH_COOKIE = "sgm_staff_refresh";

function publicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase public credentials are not configured");
  return { url, key };
}

export async function signInStaff(email: string, password: string) {
  const { url, key } = publicConfig();
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) throw new Error("Email hoặc mật khẩu không đúng.");
  const admin = getSupabaseAdmin();
  const { data: profile } = await admin
    .from("staff_profiles")
    .select("user_id,role,full_name,is_active")
    .eq("user_id", data.user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (profile) {
    return { session: data.session, profile };
  }
  throw new Error("Tài khoản chưa được cấp quyền truy cập hệ thống nội bộ.");
}

export async function getCurrentStaff() {
  const jar = await cookies();
  const token = jar.get(ACCESS_COOKIE)?.value;
  if (!token) return null;
  try {
    const { url, key } = publicConfig();
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) return null;
    const admin = getSupabaseAdmin();
    const { data: profile } = await admin
      .from("staff_profiles")
      .select("user_id,role,full_name,is_active")
      .eq("user_id", data.user.id)
      .eq("is_active", true)
      .maybeSingle();
    if (profile) return { user: data.user, profile };
    return null;
  } catch {
    return null;
  }
}

export async function requestPasswordReset(email: string) {
  const { url, key } = publicConfig();
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://saigonmotor.vn";
  const { error } = await client.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${siteUrl}/dang-nhap-noi-bo?mode=reset`,
  });
  if (error) throw new Error(error.message || "Không thể gửi email đặt lại mật khẩu.");
  return true;
}

export async function updateStaffPassword(password: string, customToken?: string) {
  const { url, key } = publicConfig();
  let token = customToken;
  if (!token) {
    const jar = await cookies();
    token = jar.get(ACCESS_COOKIE)?.value;
  }
  if (!token) throw new Error("Phiên làm việc đã hết hạn hoặc mã khôi phục không hợp lệ.");
  const response = await fetch(`${url}/auth/v1/user`, {
    method: "PUT",
    headers: {
      apikey: key,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });
  const result = (await response.json().catch(() => null)) as
    | { message?: string; error_description?: string }
    | null;
  if (!response.ok) {
    throw new Error(
      result?.message || result?.error_description || "Không thể cập nhật mật khẩu."
    );
  }
  return result;
}
