export interface LeadNotifyPayload {
  id: string;
  name: string;
  phone: string;
  service: string;
  vehicle_type: string;
  processing_location: string;
  message?: string | null;
}

export interface LeadNotifyResult {
  sent: boolean;
  simulated?: boolean;
  error?: string;
}

export async function sendLeadNotificationEmail(
  lead: LeadNotifyPayload
): Promise<LeadNotifyResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_NOTIFICATION_FROM || "Saigon Motor <leads@saigonmotor.vn>";
  const to = process.env.LEAD_NOTIFICATION_TO || "saigonmotor68@gmail.com";

  // Environment check & safe test handling
  const isTestMode = process.env.NODE_ENV !== "production" || !apiKey || apiKey.startsWith("dummy") || apiKey.includes("sandbox") || apiKey.includes("test");
  const enableLiveSendInTest = process.env.RESEND_ENABLE_TEST_SEND === "true";

  if (isTestMode && !enableLiveSendInTest) {
    console.log(
      `[Resend Email Test Mode] Lead ${lead.id} (${lead.name} - ${lead.phone}): Safe simulation executed. Target inbox: ${to}`
    );
    return {
      sent: true,
      simulated: true,
    };
  }

  try {
    const vehicleLabels: Record<string, string> = {
      oto: "Ô tô",
      "xe-may": "Xe máy",
      khac: "Khác",
    };

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `[Yêu cầu mới] ${lead.name} - ${lead.phone} (${getServiceLabel(lead.service)})`,
        text: [
          `Mã hồ sơ: ${lead.id}`,
          `Họ và tên: ${lead.name}`,
          `Số điện thoại: ${lead.phone}`,
          `Dịch vụ quan tâm: ${getServiceLabel(lead.service)}`,
          `Loại xe: ${vehicleLabels[lead.vehicle_type] || lead.vehicle_type}`,
          `Nơi làm thủ tục: ${lead.processing_location}`,
          `Ghi chú: ${lead.message || "Không ghi chú"}`,
        ].join("\n"),
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Resend API failed:", response.status, errText);
      return { sent: false, error: `Resend error: ${response.status}` };
    }

    return { sent: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Resend API call exception:", msg);
    return { sent: false, error: msg };
  }
}
import { getServiceLabel } from "@/data/public-service-index";
