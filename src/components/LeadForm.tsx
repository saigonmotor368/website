"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { trackEvent } from "@/lib/tracking";

export default function LeadForm({defaultService=""}:{defaultService?:string}){
  const router=useRouter();const pathname=usePathname();
  const[loading,setLoading]=useState(false);const[error,setError]=useState("");
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setLoading(true);setError("");const form=new FormData(event.currentTarget);const search=new URLSearchParams(window.location.search);const body={name:form.get("name"),phone:form.get("phone"),service:form.get("service"),vehicleType:form.get("vehicleType"),processingLocation:form.get("processingLocation"),message:form.get("message"),consent:form.get("consent")==="on",website:form.get("website"),formStartedAt:Number(event.currentTarget.dataset.startedAt||0),sourcePath:pathname,referrer:document.referrer,utmSource:search.get("utm_source"),utmMedium:search.get("utm_medium"),utmCampaign:search.get("utm_campaign"),utmContent:search.get("utm_content"),utmTerm:search.get("utm_term"),gclid:search.get("gclid")};
    try{const response=await fetch("/api/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const result=await response.json();if(!response.ok)throw new Error(result.error||"SGM chưa nhận được thông tin. Bạn vui lòng thử lại.");trackEvent("lead_submit_success",{service:String(body.service),vehicle_type:String(body.vehicleType)});router.push(`/thank-you?lead=${encodeURIComponent(result.leadId)}`)}catch(err){setError(err instanceof Error?err.message:"Đã có lỗi xảy ra. Bạn vui lòng gọi 0704 104 104 để được hỗ trợ.");setLoading(false)}
  }
  return <form className="lead-form" onSubmit={submit} onFocusCapture={event=>{if(!event.currentTarget.dataset.startedAt)event.currentTarget.dataset.startedAt=String(Date.now())}} noValidate><div className="form-grid">
    <div className="field"><label htmlFor="lead-name">Họ và tên</label><input id="lead-name" name="name" required minLength={2} maxLength={80} autoComplete="name" placeholder="Nhập họ và tên của bạn"/></div>
    <div className="field"><label htmlFor="lead-phone">Số điện thoại</label><input id="lead-phone" name="phone" type="tel" inputMode="tel" required pattern="0[0-9]{9}" autoComplete="tel" placeholder="0704 104 104"/></div>
    <div className="field"><label htmlFor="lead-service">Dịch vụ cần hỗ trợ</label><select id="lead-service" name="service" required defaultValue={defaultService}><option value="" disabled>Chọn dịch vụ</option><option value="sang-ten">Sang tên xe</option><option value="thu-hoi">Thu hồi đăng ký, biển số</option><option value="dang-ky">Đăng ký xe</option><option value="khac">Hồ sơ khác</option></select></div>
    <div className="field"><label htmlFor="lead-vehicle">Loại xe</label><select id="lead-vehicle" name="vehicleType" required defaultValue=""><option value="" disabled>Chọn loại xe</option><option value="oto">Ô tô</option><option value="xe-may">Xe máy</option><option value="khac">Loại xe khác</option></select></div>
    <div className="field field-full"><label htmlFor="lead-location">Nơi cần làm thủ tục</label><input id="lead-location" name="processingLocation" required maxLength={120} placeholder="Ví dụ: TP. Hồ Chí Minh, Bình Dương, Đồng Nai..."/></div>
    <div className="field field-full"><label htmlFor="lead-message">Tình trạng hồ sơ</label><textarea id="lead-message" name="message" maxLength={1000} placeholder="Bạn có thể cho SGM biết xe đang đứng tên ai, hiện có những giấy tờ gì và đang gặp khó khăn ở bước nào."/></div>
    <div aria-hidden="true" style={{position:"absolute",left:"-10000px"}}><label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off"/></div>
  </div>
  <label className="consent"><input name="consent" type="checkbox" required/><span>Tôi đồng ý để Công ty TNHH Ô tô Xe máy 368 liên hệ tư vấn cho yêu cầu đã gửi và xử lý thông tin cá nhân của tôi theo <Link href="/chinh-sach-bao-mat">Chính sách bảo mật</Link>. Tôi có thể rút lại sự đồng ý bất cứ lúc nào.</span></label>
  {error?<p className="form-error" role="alert">{error}</p>:null}<button className="btn btn-primary btn-block" type="submit" disabled={loading}>{loading?"Đang gửi thông tin...":"Yêu cầu SGM gọi lại"}</button><p className="form-note">Nếu gửi thông tin từ 08:00–20:00, bạn thường sẽ nhận được cuộc gọi trong khoảng 15 phút. Yêu cầu gửi ngoài khung giờ này được ưu tiên xử lý vào sáng hôm sau.</p>
  </form>
}
