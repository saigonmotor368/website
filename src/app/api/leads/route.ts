import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { sendLeadNotificationEmail } from "@/lib/lead-notify";

const allowedServices = new Set(["sang-ten", "thu-hoi", "dang-ky", "khac"]);
const allowedVehicles = new Set(["oto", "xe-may", "khac"]);

const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().normalize("NFC").slice(0, max) : "";

function hashIp(ip: string): string {
  const secret = process.env.INTERNAL_AUTH_SECRET || process.env.RATE_LIMIT_SALT || "sgm_salt_2026_leads";
  return crypto.createHmac("sha256", secret).update(ip).digest("hex").slice(0, 32);
}

async function isRateLimited(supabase: ReturnType<typeof getSupabaseAdmin>, ipHash: string): Promise<boolean> {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  try {
    const { count, error } = await supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", fifteenMinutesAgo);

    if (error) {
      console.warn("Rate limit check error:", error.message);
      return false;
    }
    return (count ?? 0) >= 5;
  } catch (err) {
    console.warn("Rate limit check exception:", err);
    return false;
  }
}

export async function POST(request: NextRequest) {
  let raw: Record<string, unknown>;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  // Honeypot check
  if (clean(raw.website, 100)) {
    return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 400 });
  }

  // Submission timing check (reject forms filled under 1.5 seconds)
  const started = Number(raw.formStartedAt);
  if (!Number.isFinite(started) || Date.now() - started < 1500) {
    return NextResponse.json({ error: "Anh/chị vui lòng kiểm tra lại thông tin trước khi gửi." }, { status: 400 });
  }

  const name = clean(raw.name, 80);
  const phone = clean(raw.phone, 30).replace(/[\s.()-]/g, "");
  const service = clean(raw.service, 30);
  const vehicleType = clean(raw.vehicleType, 30);
  const processingLocation = clean(raw.processingLocation, 120);
  const message = clean(raw.message, 1000);

  if (
    name.length < 2 ||
    !/^(0[35789])[0-9]{8}$/.test(phone) ||
    !allowedServices.has(service) ||
    !allowedVehicles.has(vehicleType) ||
    processingLocation.length < 2 ||
    raw.consent !== true
  ) {
    return NextResponse.json(
      { error: "Anh/chị vui lòng điền đủ thông tin, kiểm tra số điện thoại và xác nhận đồng ý trước khi gửi." },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const rawIp = (request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown")
      .split(",")[0]
      .trim();
    const ipHash = hashIp(rawIp);

    // Rate limit check in Supabase
    if (await isRateLimited(supabase, ipHash)) {
      return NextResponse.json(
        { error: "Anh/chị đã gửi nhiều yêu cầu trong thời gian ngắn. Vui lòng gọi 0704 104 104 nếu cần hỗ trợ ngay." },
        { status: 429 }
      );
    }

    // Duplicate check within 5 minutes
    const recentSince = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from("leads")
      .select("id")
      .eq("phone", phone)
      .gte("created_at", recentSince)
      .limit(1)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "SGM đã nhận yêu cầu gần đây của anh/chị. Chúng tôi sẽ liên hệ sớm." },
        { status: 429 }
      );
    }

    const row = {
      name,
      phone,
      service,
      vehicle_type: vehicleType,
      processing_location: processingLocation,
      message,
      source_path: clean(raw.sourcePath, 250) || "/",
      referrer: clean(raw.referrer, 500),
      utm_source: clean(raw.utmSource, 100),
      utm_medium: clean(raw.utmMedium, 100),
      utm_campaign: clean(raw.utmCampaign, 160),
      utm_content: clean(raw.utmContent, 160),
      utm_term: clean(raw.utmTerm, 160),
      gclid: clean(raw.gclid, 250),
      consent_at: new Date().toISOString(),
      ip_hash: ipHash,
      status: "new",
    };

    // Lead must be inserted first
    const { data, error } = await supabase
      .from("leads")
      .insert(row)
      .select("id, name, phone, service, vehicle_type, processing_location, message")
      .single();

    if (error) {
      throw error;
    }

    // Log lead_created event
    await supabase.from("lead_events").insert({
      lead_id: data.id,
      event_name: "lead_created",
      metadata: {
        source_path: row.source_path,
        utm_source: row.utm_source,
        utm_campaign: row.utm_campaign,
        gclid: row.gclid,
      },
    });

    // Notify via email - failure does NOT fail the lead response
    let emailed = false;
    try {
      const notifyRes = await sendLeadNotificationEmail(data);
      emailed = notifyRes.sent;
    } catch (err) {
      console.error("Lead email notification failed:", err);
    }

    await supabase
      .from("leads")
      .update({
        email_status: emailed ? "sent" : (process.env.NODE_ENV === "production" ? "failed" : "pending"),
        email_last_attempt_at: new Date().toISOString(),
      })
      .eq("id", data.id);

    return NextResponse.json({ ok: true, leadId: data.id }, { status: 201 });
  } catch (error) {
    console.error("Lead creation failed:", error);
    return NextResponse.json(
      { error: "SGM chưa nhận được thông tin. Anh/chị vui lòng gọi 0704 104 104 để được hỗ trợ." },
      { status: 500 }
    );
  }
}
