"use client";

const GOOGLE_ADS_LEAD_CONVERSION = "AW-18352281213/8pS_CM_kpJUdEP2shq9E";

export function trackEvent(
  event: string,
  payload: Record<string, string | number | boolean | undefined> = {},
) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload });
}

export function trackGoogleAdsLeadConversion(leadId: string) {
  if (typeof window === "undefined" || !leadId) return;
  window.gtag?.("event", "conversion", {
    send_to: GOOGLE_ADS_LEAD_CONVERSION,
    value: 1,
    currency: "VND",
    transaction_id: leadId,
  });
}
