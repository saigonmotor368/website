"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { trackEvent, trackGoogleAdsLeadConversion } from "@/lib/tracking";
import styles from "../tu-van-ho-so-xe/page.module.css";

const PAGE_PATH = "/ca-so-khung-so-may-tphcm";
const SERVICE_SLUG = "ca-so-khung-so-may";

export default function FrameNumberLeadForm() {
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
    const vehicleType = String(form.get("vehicleType") || "");
    const processingLocation = String(form.get("processingLocation") || "").trim();
    const vehicleInfo = String(form.get("vehicleInfo") || "").trim();
    const preferredTime = String(form.get("preferredTime") || "");
    const note = String(form.get("note") || "").trim();
    const consent = form.get("consent") === "on";
    const website = String(form.get("website") || "");

    if (name.length < 2) {
      setError("Anh/chị vui lòng nhập họ tên hoặc tên Zalo.");
      setLoading(false);
      return;
    }
    if (!/^(0[35789])[0-9]{8}$/.test(phone)) {
      setError("Số điện thoại chưa đúng định dạng, ví dụ 0704104104.");
      setLoading(false);
      return;
    }
    if (!vehicleType) {
      setError("Anh/chị vui lòng chọn loại phương tiện.");
      setLoading(false);
      return;
    }
    if (processingLocation.length < 2) {
      setError("Anh/chị vui lòng cho biết khu vực đang để phương tiện.");
      setLoading(false);
      return;
    }
    if (vehicleInfo.length < 2) {
      setError("Anh/chị vui lòng cho biết dòng xe hoặc mô tả ngắn về phương tiện.");
      setLoading(false);
      return;
    }
    if (!consent) {
      setError("Anh/chị vui lòng xác nhận đồng ý để SGM liên hệ báo phí và sắp xếp lịch hẹn.");
      setLoading(false);
      return;
    }

    const message = [
      `Thông tin xe: ${vehicleInfo}`,
      preferredTime ? `Thời gian thuận tiện: ${preferredTime}` : "",
      note ? `Ghi chú: ${note}` : "",
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
          processingLocation,
          message,
          customerType: "Cá nhân hoặc doanh nghiệp",
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
        throw new Error(result?.error || "SGM chưa nhận được thông tin. Anh/chị vui lòng thử lại.");
      }

      trackEvent("lead_submit_success", {
        lead_id: result.leadId,
        service_slug: SERVICE_SLUG,
        service_group: "technical",
        vehicle_type: vehicleType,
        page_path: PAGE_PATH,
        placement: "frame_number_lead_form",
      });
      trackGoogleAdsLeadConversion(result.leadId);
      router.push(`/thank-you?lead=${encodeURIComponent(result.leadId)}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Đã có lỗi xảy ra. Anh/chị vui lòng gọi 0704 104 104 để được hỗ trợ.",
      );
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.formHeader}>
        <span>Đặt lịch thực hiện</span>
        <h2>Gửi thông tin phương tiện để SGM báo phí</h2>
        <p>SGM sẽ kiểm tra loại xe, vị trí đóng số và khu vực đang để phương tiện trước khi xác nhận lịch hẹn.</p>
      </div>

      <div className={styles.formGrid}>
        <label>
          <span>Họ tên hoặc tên Zalo</span>
          <input name="name" autoComplete="name" maxLength={80} placeholder="Ví dụ: Anh Minh" required />
        </label>
        <label>
          <span>Số điện thoại</span>
          <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="0704 104 104" required />
        </label>
        <label>
          <span>Loại phương tiện</span>
          <select name="vehicleType" defaultValue="" required>
            <option value="" disabled>Chọn loại phương tiện</option>
            <option value="oto">Ô tô</option>
            <option value="xe-may">Xe máy</option>
            <option value="khac">Xe tải hoặc loại khác</option>
          </select>
        </label>
        <label>
          <span>Khu vực đang để phương tiện</span>
          <input name="processingLocation" maxLength={120} placeholder="Ví dụ: TP. Thủ Đức" required />
        </label>
        <label className={styles.fullField}>
          <span>Dòng xe hoặc mô tả phương tiện</span>
          <input name="vehicleInfo" maxLength={160} placeholder="Ví dụ: Ford Ranger 2020 hoặc Honda Vision" required />
        </label>
        <label className={styles.fullField}>
          <span>Thời gian thuận tiện để SGM liên hệ</span>
          <select name="preferredTime" defaultValue="">
            <option value="">Bất kỳ lúc nào trong giờ làm việc</option>
            <option value="08:00-11:30">08:00-11:30</option>
            <option value="13:30-17:30">13:30-17:30</option>
            <option value="17:30-20:00">17:30-20:00</option>
          </select>
        </label>
        <label className={styles.fullField}>
          <span>Ghi chú thêm</span>
          <textarea name="note" maxLength={700} rows={4} placeholder="Ví dụ: Xe đang để trong hầm, số khung khó tiếp cận hoặc cần thực hiện trước thời gian cụ thể." />
        </label>
        <div aria-hidden="true" className={styles.honeypot}>
          <label htmlFor="frame-number-website">Website</label>
          <input id="frame-number-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
      </div>

      <label className={styles.consent}>
        <input name="consent" type="checkbox" required />
        <span>
          Tôi đồng ý để Công ty TNHH Ô tô Xe máy 368 sử dụng thông tin tôi cung cấp nhằm liên hệ, báo phí và sắp xếp lịch thực hiện, phù hợp với{" "}
          <Link href="/chinh-sach-bao-mat">Chính sách bảo mật</Link>. Tôi có thể rút lại sự đồng ý bất cứ lúc nào.
        </span>
      </label>

      {error ? <p className={styles.formError} role="alert">{error}</p> : null}

      <button className={styles.submitButton} type="submit" disabled={loading}>
        {loading ? "Đang gửi yêu cầu..." : "Gửi thông tin để SGM báo phí"}
      </button>
      <p className={styles.formNote}>SGM chỉ dùng thông tin để phản hồi yêu cầu này, không đưa số điện thoại của anh/chị vào danh sách nhận quảng cáo.</p>
    </form>
  );
}
