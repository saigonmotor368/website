"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { trackEvent, trackGoogleAdsLeadConversion } from "@/lib/tracking";
import styles from "../tu-van-ho-so-xe/page.module.css";

const PAGE_PATH = "/tra-cuu-xu-ly-phat-nguoi-tphcm";
const SERVICE_SLUG = "xu-ly-phat-nguoi";

export default function PhatNguoiLeadForm() {
  const router = useRouter();
  const formStartedAt = useRef(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    formStartedAt.current = Date.now();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const search = new URLSearchParams(window.location.search);
    const name = String(form.get("name") || "").trim();
    const phone = String(form.get("phone") || "").replace(/[\s.()-]/g, "");
    const customerType = String(form.get("customerType") || "");
    const vehicleType = String(form.get("vehicleType") || "");
    const plate = String(form.get("plate") || "").trim();
    const situation = String(form.get("situation") || "").trim();
    const preferredTime = String(form.get("preferredTime") || "");
    const consent = form.get("consent") === "on";
    const website = String(form.get("website") || "");

    if (name.length < 2) {
      setError("Quý khách vui lòng nhập họ tên hoặc tên Zalo.");
      setLoading(false);
      return;
    }
    if (!/^(0[35789])[0-9]{8}$/.test(phone)) {
      setError("Số điện thoại chưa đúng định dạng. Quý khách vui lòng nhập đủ 10 chữ số, ví dụ 0704104104.");
      setLoading(false);
      return;
    }
    if (!customerType || !vehicleType) {
      setError("Quý khách vui lòng chọn loại khách hàng và loại xe.");
      setLoading(false);
      return;
    }
    if (plate.length < 4) {
      setError("Quý khách vui lòng nhập biển số xe cần kiểm tra.");
      setLoading(false);
      return;
    }
    if (!consent) {
      setError("Quý khách vui lòng đánh dấu vào ô đồng ý để SGM liên hệ về yêu cầu kiểm tra phạt nguội.");
      setLoading(false);
      return;
    }

    const message = [
      `Biển số: ${plate}`,
      situation ? `Tình trạng: ${situation}` : "",
      preferredTime ? `Thời gian thuận tiện: ${preferredTime}` : "",
    ].filter(Boolean).join("\n");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          service: SERVICE_SLUG,
          vehicleType,
          processingLocation: "TP. Hồ Chí Minh",
          message,
          customerType,
          contactPreference: "Điện thoại hoặc Zalo",
          preferredTime,
          consent,
          website,
          formStartedAt: formStartedAt.current,
          sourcePath: PAGE_PATH,
          referrer: document.referrer,
          utmSource: search.get("utm_source") || "",
          utmMedium: search.get("utm_medium") || "",
          utmCampaign: search.get("utm_campaign") || "",
          utmContent: search.get("utm_content") || "",
          utmTerm: search.get("utm_term") || "",
          gclid: search.get("gclid") || "",
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok || !result.leadId) {
        throw new Error(result?.error || "SGM chưa nhận được thông tin. Quý khách vui lòng thử lại.");
      }

      trackEvent("lead_submit_success", {
        lead_id: result.leadId,
        service_slug: SERVICE_SLUG,
        service_group: "violations",
        vehicle_type: vehicleType,
        page_path: PAGE_PATH,
        placement: "phat_nguoi_form",
      });
      trackGoogleAdsLeadConversion(result.leadId);
      router.push(`/thank-you?lead=${encodeURIComponent(result.leadId)}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Thông tin chưa gửi được. Quý khách vui lòng gọi 0704 104 104 để SGM hỗ trợ trực tiếp.");
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.formHeader}>
        <span>Kiểm tra phạt nguội</span>
        <h2>Gửi biển số để SGM kiểm tra giúp quý khách</h2>
        <p>Chúng tôi tra cứu dữ liệu công khai của CSGT, sau đó liên hệ để giải thích kết quả và báo phí trước khi tiếp nhận bất kỳ phần việc nào.</p>
      </div>
      <div className={styles.formGrid}>
        <label><span>Họ tên hoặc tên Zalo</span><input name="name" autoComplete="name" maxLength={80} placeholder="Ví dụ: Anh Minh" required /></label>
        <label><span>Số điện thoại</span><input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0704 104 104" required /></label>
        <label><span>Loại khách hàng</span><select name="customerType" defaultValue="" required><option value="" disabled>Chọn loại khách hàng</option><option value="Cá nhân">Cá nhân</option><option value="Doanh nghiệp">Doanh nghiệp</option></select></label>
        <label><span>Loại xe</span><select name="vehicleType" defaultValue="" required><option value="" disabled>Chọn loại xe</option><option value="oto">Ô tô</option><option value="xe-may">Xe máy</option><option value="khac">Nhiều xe hoặc loại khác</option></select></label>
        <label><span>Biển số xe</span><input name="plate" maxLength={40} placeholder="Ví dụ: 51K-123.45" required /></label>
        <label><span>Thời gian thuận tiện để SGM liên hệ</span><select name="preferredTime" defaultValue=""><option value="">Bất kỳ lúc nào trong giờ làm việc</option><option value="08:00-11:30">08:00-11:30</option><option value="13:30-17:30">13:30-17:30</option><option value="17:30-20:00">17:30-20:00</option></select></label>
        <label className={styles.fullField}><span>Tình trạng hiện tại (không bắt buộc)</span><textarea name="situation" maxLength={1000} rows={4} placeholder="Ví dụ: Đã nhận thông báo vi phạm qua bưu điện, xe đã bán nhưng chưa sang tên, cần kiểm tra trước khi đăng kiểm..." /></label>
        <div aria-hidden="true" className={styles.honeypot}><label htmlFor="phat-nguoi-website">Website</label><input id="phat-nguoi-website" name="website" tabIndex={-1} autoComplete="off" /></div>
      </div>
      <label className={styles.consent}>
        <input name="consent" type="checkbox" required />
        <span>Tôi đồng ý để Công ty TNHH Ô tô Xe máy 368 (Saigon Motor) sử dụng thông tin tôi cung cấp để liên hệ tư vấn và kiểm tra hồ sơ theo yêu cầu này, theo <Link href="/chinh-sach-bao-mat">Chính sách bảo mật</Link>. Tôi có thể rút lại sự đồng ý bất cứ lúc nào.</span>
      </label>
      {error ? <p className={styles.formError} role="alert">{error}</p> : null}
      <button className={styles.submitButton} type="submit" disabled={loading}>{loading ? "Đang gửi yêu cầu..." : "Gửi yêu cầu kiểm tra phạt nguội"}</button>
      <p className={styles.formNote}>SGM chỉ sử dụng thông tin này để phản hồi yêu cầu của quý khách và không đưa số điện thoại vào danh sách gửi quảng cáo.</p>
    </form>
  );
}
