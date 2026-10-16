"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { CONSULTATION_SERVICE_SLUG } from "@/data/public-service-index";
import { trackEvent, trackGoogleAdsLeadConversion } from "@/lib/tracking";
import styles from "./page.module.css";

const PAGE_PATH = "/tu-van-ho-so-xe";

export default function ConsultationLeadForm() {
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

    const startedAt = formStartedAt.current;
    const form = new FormData(event.currentTarget);
    const search = new URLSearchParams(window.location.search);
    const name = String(form.get("name") || "").trim();
    const phone = String(form.get("phone") || "").replace(/[\s.()-]/g, "");
    const vehicleType = String(form.get("vehicleType") || "");
    const processingLocation = String(form.get("processingLocation") || "").trim();
    const message = String(form.get("message") || "").trim();
    const customerType = String(form.get("customerType") || "");
    const contactPreference = String(form.get("contactPreference") || "");
    const preferredTime = String(form.get("preferredTime") || "");
    const consent = form.get("consent") === "on";
    const website = String(form.get("website") || "");

    if (name.length < 2) {
      setError("Quý khách vui lòng nhập họ tên hoặc tên thường gọi.");
      setLoading(false);
      return;
    }
    if (!/^(0[35789])[0-9]{8}$/.test(phone)) {
      setError("Số điện thoại chưa đúng định dạng. Quý khách vui lòng nhập đủ 10 chữ số, ví dụ 0704104104.");
      setLoading(false);
      return;
    }
    if (!vehicleType || !customerType) {
      setError("Quý khách vui lòng chọn loại khách hàng và loại xe.");
      setLoading(false);
      return;
    }
    if (processingLocation.length < 2) {
      setError("Quý khách vui lòng cho biết nơi cần thực hiện thủ tục.");
      setLoading(false);
      return;
    }
    if (message.length < 10) {
      setError("Quý khách vui lòng mô tả ngắn gọn giấy tờ hiện có để SGM kiểm tra trước.");
      setLoading(false);
      return;
    }
    if (!consent) {
      setError("Quý khách vui lòng đánh dấu đồng ý để SGM liên hệ và kiểm tra hồ sơ.");
      setLoading(false);
      return;
    }

    const body = {
      name,
      phone,
      service: CONSULTATION_SERVICE_SLUG,
      vehicleType,
      processingLocation,
      message,
      customerType,
      contactPreference,
      preferredTime,
      consent,
      website,
      formStartedAt: startedAt,
      sourcePath: PAGE_PATH,
      referrer: document.referrer,
      utmSource: search.get("utm_source") || "",
      utmMedium: search.get("utm_medium") || "",
      utmCampaign: search.get("utm_campaign") || "",
      utmContent: search.get("utm_content") || "",
      utmTerm: search.get("utm_term") || "",
      gclid: search.get("gclid") || "",
    };

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok || !result.ok || !result.leadId) {
        throw new Error(result?.error || "SGM chưa nhận được thông tin. Quý khách vui lòng thử lại.");
      }

      trackEvent("lead_submit_success", {
        lead_id: result.leadId,
        service_slug: CONSULTATION_SERVICE_SLUG,
        service_group: "consultation",
        vehicle_type: vehicleType,
        page_path: PAGE_PATH,
        placement: "consultation_lead_form",
      });
      trackGoogleAdsLeadConversion(result.leadId);
      router.push(`/thank-you?lead=${encodeURIComponent(result.leadId)}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Thông tin chưa gửi được. Quý khách vui lòng gọi 0704 104 104 để SGM hỗ trợ trực tiếp.",
      );
      setLoading(false);
    }
  }

  return (
    <form
      className={styles.form}
      onSubmit={submit}
      noValidate
    >
      <div className={styles.formHeader}>
        <span>Gửi thông tin hồ sơ</span>
        <h2>Mô tả tình trạng hồ sơ để SGM kiểm tra</h2>
        <p>Chúng tôi sẽ liên hệ để tìm hiểu thêm về giấy tờ quý khách đang có, sau đó thông báo phương án, phạm vi công việc và chi phí dự kiến để quý khách cân nhắc.</p>
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
          <span>Loại khách hàng</span>
          <select name="customerType" defaultValue="" required>
            <option value="" disabled>Chọn loại khách hàng</option>
            <option value="Cá nhân">Cá nhân</option>
            <option value="Doanh nghiệp">Doanh nghiệp</option>
          </select>
        </label>
        <label>
          <span>Loại xe</span>
          <select name="vehicleType" defaultValue="" required>
            <option value="" disabled>Chọn loại xe</option>
            <option value="oto">Ô tô</option>
            <option value="xe-may">Xe máy</option>
            <option value="khac">Nhiều xe hoặc loại khác</option>
          </select>
        </label>
        <label>
          <span>Nơi cần thực hiện thủ tục</span>
          <input name="processingLocation" maxLength={120} placeholder="Ví dụ: TP. Hồ Chí Minh" required />
        </label>
        <label>
          <span>Kênh liên hệ mong muốn</span>
          <select name="contactPreference" defaultValue="Điện thoại">
            <option value="Điện thoại">Điện thoại</option>
            <option value="Zalo">Zalo</option>
          </select>
        </label>
        <label className={styles.fullField}>
          <span>Thời gian thuận tiện để trao đổi</span>
          <select name="preferredTime" defaultValue="">
            <option value="">Bất kỳ lúc nào trong giờ làm việc</option>
            <option value="08:00-11:30">08:00-11:30</option>
            <option value="13:30-17:30">13:30-17:30</option>
            <option value="17:30-20:00">17:30-20:00</option>
          </select>
        </label>
        <label className={styles.fullField}>
          <span>Giấy tờ quý khách đang có và thủ tục cần hỗ trợ</span>
          <textarea
            name="message"
            maxLength={1000}
            rows={5}
            placeholder="Ví dụ: Tôi mua lại một xe cũ, hiện có giấy đăng ký và hợp đồng mua bán, cần hỗ trợ làm hồ sơ để xe đứng tên mình."
            required
          />
        </label>
        <div aria-hidden="true" className={styles.honeypot}>
          <label htmlFor="consultation-website">Website</label>
          <input id="consultation-website" name="website" tabIndex={-1} autoComplete="off" />
        </div>
      </div>

      <label className={styles.consent}>
        <input name="consent" type="checkbox" required />
        <span>
          Tôi đồng ý để Công ty TNHH Ô tô Xe máy 368 (Saigon Motor) sử dụng thông tin tôi cung cấp để liên hệ tư vấn và kiểm tra hồ sơ theo yêu cầu này, theo{" "}
          <Link href="/chinh-sach-bao-mat">Chính sách bảo mật</Link>. Tôi có thể rút lại sự đồng ý bất cứ lúc nào.
        </span>
      </label>

      {error ? <p className={styles.formError} role="alert">{error}</p> : null}

      <button className={styles.submitButton} type="submit" disabled={loading}>
        {loading ? "Đang gửi thông tin..." : "Gửi yêu cầu kiểm tra hồ sơ"}
      </button>
      <p className={styles.formNote}>SGM chỉ sử dụng thông tin này để phản hồi yêu cầu của quý khách và không đưa số điện thoại vào danh sách nhận quảng cáo.</p>
    </form>
  );
}
