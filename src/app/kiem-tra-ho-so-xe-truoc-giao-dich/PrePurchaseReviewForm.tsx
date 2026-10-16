"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { PRE_PURCHASE_REVIEW_SERVICE_SLUG } from "@/data/public-service-index";
import { trackEvent, trackGoogleAdsLeadConversion } from "@/lib/tracking";
import styles from "../tu-van-ho-so-xe/page.module.css";

const PAGE_PATH = "/kiem-tra-ho-so-xe-truoc-giao-dich";

export default function PrePurchaseReviewForm() {
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
    const processingLocation = String(form.get("processingLocation") || "").trim();
    const vehicleInfo = String(form.get("vehicleInfo") || "").trim();
    const documents = String(form.get("documents") || "").trim();
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
    if (processingLocation.length < 2 || vehicleInfo.length < 2) {
      setError("Quý khách vui lòng cho biết khu vực giao dịch và thông tin cơ bản của xe.");
      setLoading(false);
      return;
    }
    if (documents.length < 10) {
      setError("Quý khách vui lòng liệt kê những giấy tờ bên bán đã cung cấp.");
      setLoading(false);
      return;
    }
    if (!consent) {
      setError("Quý khách vui lòng đánh dấu vào ô đồng ý để SGM liên hệ về yêu cầu kiểm tra hồ sơ.");
      setLoading(false);
      return;
    }

    const message = [
      `Thông tin xe: ${vehicleInfo}`,
      `Giấy tờ đang có: ${documents}`,
      preferredTime ? `Thời gian thuận tiện: ${preferredTime}` : "",
    ].filter(Boolean).join("\n");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          service: PRE_PURCHASE_REVIEW_SERVICE_SLUG,
          vehicleType,
          processingLocation,
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
        service_slug: PRE_PURCHASE_REVIEW_SERVICE_SLUG,
        service_group: "consultation",
        vehicle_type: vehicleType,
        page_path: PAGE_PATH,
        placement: "pre_purchase_review_form",
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
        <span>Đăng ký kiểm tra hồ sơ</span>
        <h2>Gửi thông tin xe và giấy tờ đang có</h2>
        <p>SGM sẽ liên hệ để thống nhất phạm vi kiểm tra và hướng dẫn quý khách gửi bản chụp giấy tờ qua kênh thuận tiện cho hai bên. Quý khách chưa cần tải giấy tờ lên website.</p>
      </div>
      <div className={styles.formGrid}>
        <label><span>Họ tên hoặc tên Zalo</span><input name="name" autoComplete="name" maxLength={80} placeholder="Ví dụ: Anh Minh" required /></label>
        <label><span>Số điện thoại</span><input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0704 104 104" required /></label>
        <label><span>Loại khách hàng</span><select name="customerType" defaultValue="" required><option value="" disabled>Chọn loại khách hàng</option><option value="Cá nhân">Cá nhân</option><option value="Doanh nghiệp">Doanh nghiệp</option></select></label>
        <label><span>Loại xe</span><select name="vehicleType" defaultValue="" required><option value="" disabled>Chọn loại xe</option><option value="oto">Ô tô</option><option value="xe-may">Xe máy</option><option value="khac">Nhiều xe hoặc loại khác</option></select></label>
        <label><span>Khu vực giao dịch</span><input name="processingLocation" maxLength={120} placeholder="Ví dụ: TP. Hồ Chí Minh" required /></label>
        <label><span>Thời gian thuận tiện để SGM liên hệ</span><select name="preferredTime" defaultValue=""><option value="">Bất kỳ lúc nào trong giờ làm việc</option><option value="08:00-11:30">08:00-11:30</option><option value="13:30-17:30">13:30-17:30</option><option value="17:30-20:00">17:30-20:00</option></select></label>
        <label className={styles.fullField}><span>Thông tin xe</span><input name="vehicleInfo" maxLength={180} placeholder="Ví dụ: Ford Ranger 2020, biển số 51C..." required /></label>
        <label className={styles.fullField}><span>Bên bán đã cung cấp những giấy tờ nào?</span><textarea name="documents" maxLength={1000} rows={5} placeholder="Ví dụ: Giấy đăng ký xe, đăng kiểm, hợp đồng mua bán cũ và giấy tờ của công ty đứng tên xe." required /></label>
        <div aria-hidden="true" className={styles.honeypot}><label htmlFor="pre-purchase-website">Website</label><input id="pre-purchase-website" name="website" tabIndex={-1} autoComplete="off" /></div>
      </div>
      <label className={styles.consent}>
        <input name="consent" type="checkbox" required />
        <span>Tôi đồng ý để Công ty TNHH Ô tô Xe máy 368 (Saigon Motor) sử dụng thông tin tôi cung cấp để liên hệ tư vấn và kiểm tra hồ sơ theo yêu cầu này, theo <Link href="/chinh-sach-bao-mat">Chính sách bảo mật</Link>. Tôi có thể rút lại sự đồng ý bất cứ lúc nào.</span>
      </label>
      {error ? <p className={styles.formError} role="alert">{error}</p> : null}
      <button className={styles.submitButton} type="submit" disabled={loading}>{loading ? "Đang gửi yêu cầu..." : "Đăng ký kiểm tra hồ sơ — 500.000 đồng"}</button>
      <p className={styles.formNote}>SGM chỉ sử dụng thông tin này để phản hồi yêu cầu của quý khách và không đưa số điện thoại vào danh sách gửi quảng cáo.</p>
    </form>
  );
}
