"use client";

import { useState } from "react";
import { format } from "date-fns";
import type { QuoteData } from "../quote-types";
import { generateQuoteImage } from "@/lib/generate-quote-pdf";
import { formatMoneyToVietnameseWords } from "../../lib/money-to-words";

interface Step4Props {
  quoteData: QuoteData;
  onNext: () => void;
  onPrev: () => void;
  initialMode?: "color" | "bw";
  elementId?: string;
  saving?: boolean;
}

export default function QuotePreview({
  quoteData,
  onNext,
  onPrev,
  initialMode = "color",
  elementId = "quote-preview",
  saving = false,
}: Step4Props) {
  const [mode, setMode] = useState<"color" | "bw">(initialMode);
  const [trackedInitialMode, setTrackedInitialMode] = useState(initialMode);
  const [exportingImage, setExportingImage] = useState(false);

  if (trackedInitialMode !== initialMode) {
    setTrackedInitialMode(initialMode);
    setMode(initialMode);
  }

  const isBw = mode === "bw";

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const subtotal = quoteData.services.reduce(
    (sum, service) => sum + service.price * service.quantity,
    0
  );
  const vatAmount = subtotal * ((quoteData.vatRate || 0) / 100);
  let totalAmount = subtotal + vatAmount;

  let registrationFee = 0;
  let regFeePercent = 0;
  if (quoteData.includeRegistrationFee && quoteData.vehicle?.estimatedValue) {
    regFeePercent = quoteData.vehicle.vehicleType === "car" ? 2 : 1;
    registrationFee = quoteData.vehicle.estimatedValue * (regFeePercent / 100);
    totalAmount += registrationFee;
  }

  const roundedTotal = Math.round(totalAmount);
  const dateStr = format(quoteData.createdAt || new Date(), "dd/MM/yyyy");

  const handleSaveColorImage = async () => {
    setExportingImage(true);
    try {
      if (mode !== "color") {
        setMode("color");
        await new Promise((resolve) => window.setTimeout(resolve, 90));
      }
      if (document.fonts?.ready) await document.fonts.ready;
      const previewEl = document.getElementById(elementId);
      if (previewEl) {
        const imgs = Array.from(previewEl.querySelectorAll("img"));
        await Promise.all(imgs.map((img) => img.decode?.().catch(() => undefined)));
      }
      const safeCustomer = quoteData.customer.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      const safeNumber = quoteData.quoteNumber || "BAN_NHAP";
      const ok = await generateQuoteImage(
        elementId,
        `BaoGia_${safeNumber}_${safeCustomer || "KhachHang"}.jpg`
      );
      if (!ok) {
        alert("Chưa thể tạo ảnh báo giá. Anh/chị vui lòng thử lại.");
      }
    } finally {
      setExportingImage(false);
    }
  };

  const handlePrintBw = async () => {
    if (mode !== "bw") {
      setMode("bw");
      await new Promise((resolve) => window.setTimeout(resolve, 90));
    }
    document.body.classList.add("quote-printing");
    window.addEventListener(
      "afterprint",
      () => document.body.classList.remove("quote-printing"),
      { once: true }
    );
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Mode Switcher & Quick Export Toolbar */}
      <div className="print:hidden flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#141923] p-3">
        <div
          className="grid grid-cols-2 sm:inline-flex gap-1.5 rounded-xl bg-[#0b0e14] p-1 border border-white/10"
          role="group"
          aria-label="Chế độ hiển thị mẫu báo giá"
        >
          <button
            type="button"
            onClick={() => setMode("color")}
            aria-pressed={!isBw}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
              !isBw
                ? "bg-[#174f48] text-white border border-[#d4af37]/50 shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🎨 Bản màu (Lưu ảnh)
          </button>
          <button
            type="button"
            onClick={() => setMode("bw")}
            aria-pressed={isBw}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
              isBw
                ? "bg-white text-black font-bold shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            🖨 Bản in trắng đen
          </button>
        </div>

        <div className="quanly-action-bar">
          <button
            type="button"
            disabled={exportingImage || saving}
            onClick={() => void handleSaveColorImage()}
            className="quanly-btn-secondary !py-2 !text-xs disabled:opacity-50"
          >
            {exportingImage ? "Đang xuất ảnh..." : "▧ Lưu ảnh màu (Zalo)"}
          </button>
          <button
            type="button"
            disabled={exportingImage || saving}
            onClick={() => void handlePrintBw()}
            className="quanly-btn-secondary !py-2 !text-xs disabled:opacity-50"
          >
            🖨 In trắng đen (A4)
          </button>
        </div>
      </div>

      {/* Mobile Swipe Hint */}
      <p className="print:hidden mb-1 text-center text-[11px] text-amber-300/90 md:hidden">
        ← Vuốt ngang để xem toàn bộ trang A4 →
      </p>

      {/* Container giả lập trang A4 */}
      <div className="quanly-table-scroll rounded-xl bg-gray-900 p-3 sm:p-6 print:bg-white print:p-0 print:overflow-visible">
        <div
          id={elementId}
          data-print-mode={mode}
          className={`quote-print-sheet relative mx-auto overflow-hidden bg-white p-9 text-[13.5px] leading-[1.5] font-normal shadow-2xl print:shadow-none print:m-0 ${
            isBw ? "text-black" : "text-[#1e293b]"
          }`}
          style={{
            width: "794px",
            minHeight: "1123px",
            fontFamily: "var(--font-be-vietnam), Arial, sans-serif",
          }}
        >
          {/* Subtle Watermark (Color Mode Only) */}
          {!isBw && (
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03] print:hidden"
              aria-hidden="true"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo_sgm.png" alt="" className="w-[340px] h-[340px] object-contain" />
            </div>
          )}

          <div className="relative z-10 flex flex-col min-h-[1045px]">
            {/* HEADER */}
            {isBw ? (
              <div className="mb-5 flex items-center justify-between gap-4 border-b-[3px] border-double border-black pb-4 bg-white text-black">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="h-[72px] w-[72px] shrink-0 grid place-items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/logo_sgm.png"
                      alt="Saigon Motor"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-[21px] font-extrabold uppercase tracking-[0.06em] text-black leading-tight">
                      SAIGON MOTOR
                    </h1>
                    <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-black">
                      Trực thuộc Công ty TNHH Ô tô Xe máy 368
                    </p>
                    <p className="mt-1 text-[10.5px] text-black">
                      <strong>MST:</strong> 0316339254 &nbsp;•&nbsp; <strong>Hotline:</strong> 0704 104 104
                    </p>
                    <p className="mt-0.5 text-[10.5px] leading-[1.35] text-black">
                      <strong>Địa chỉ:</strong> 745 Phạm Văn Đồng, KP. 8, P. Hiệp Bình, TP. Hồ Chí Minh
                    </p>
                  </div>
                </div>
                <div className="shrink-0 border-2 border-black px-4 py-2.5 text-right bg-white">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-black">
                    Báo giá dịch vụ
                  </p>
                  <h2 className="mt-0.5 whitespace-nowrap text-[18px] font-extrabold tracking-tight text-black">
                    {quoteData.quoteNumber}
                  </h2>
                  <p className="mt-0.5 text-[11px] font-medium text-black">Ngày: {dateStr}</p>
                </div>
              </div>
            ) : (
              <div
                className="mb-6 overflow-hidden rounded-2xl text-white shadow-md"
                style={{
                  background: "linear-gradient(135deg, #0b111c 0%, #122b30 52%, #174f48 100%)",
                }}
              >
                <div className="flex items-center justify-between gap-4 px-5 py-5">
                  <div className="flex min-w-0 flex-1 items-center gap-4 pr-2">
                    <div
                      className="grid h-[76px] w-[76px] shrink-0 place-items-center rounded-2xl p-2"
                      style={{
                        backgroundColor: "#0b0e14",
                        border: "1.5px solid rgba(243, 210, 122, 0.55)",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/logo_sgm_gold.png"
                        alt="Saigon Motor"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-[21px] font-extrabold uppercase tracking-[0.06em] text-white leading-none">
                        SAIGON MOTOR
                      </h1>
                      <p className="mt-1.5 text-[11px] font-bold uppercase tracking-wider text-[#f3d27a]">
                        Công ty TNHH Ô tô Xe máy 368
                      </p>
                      <p className="mt-1 text-[10.5px] text-[#e2efec]">
                        <span className="font-semibold text-white">MST:</span> 0316339254 &nbsp;•&nbsp;{" "}
                        <span className="font-semibold text-white">Hotline/Zalo:</span> 0704 104 104
                      </p>
                      <p className="mt-0.5 max-w-[400px] text-[10.5px] leading-[1.35] text-[#cfe3de]">
                        <span className="font-semibold text-white">Đ/c:</span> 745 Phạm Văn Đồng, KP. 8, P. Hiệp Bình, TP. Hồ Chí Minh
                      </p>
                    </div>
                  </div>
                  <div
                    className="shrink-0 rounded-xl px-4 py-3 text-right"
                    style={{
                      backgroundColor: "rgba(11, 14, 20, 0.72)",
                      border: "1px solid rgba(243, 210, 122, 0.45)",
                    }}
                  >
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#f3d27a]">
                      Báo giá dịch vụ
                    </p>
                    <h2 className="whitespace-nowrap text-[18px] font-extrabold tracking-tight text-white">
                      {quoteData.quoteNumber}
                    </h2>
                    <p className="mt-1 text-[11px] font-normal text-[#d5e7e2]">Ngày lập: {dateStr}</p>
                    <span
                      className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider"
                      style={{
                        backgroundColor:
                          quoteData.status === "issued"
                            ? "rgba(16, 185, 129, 0.22)"
                            : "rgba(243, 210, 122, 0.18)",
                        color: quoteData.status === "issued" ? "#6ee7b7" : "#f8e49b",
                      }}
                    >
                      {quoteData.status === "issued" ? "Bản chính thức" : "Bản nháp"}
                    </span>
                  </div>
                </div>
                <div
                  className="h-[4px] w-full"
                  style={{
                    background: "linear-gradient(90deg, #b58e24 0%, #f8e49b 50%, #b58e24 100%)",
                  }}
                />
              </div>
            )}

            {/* THÔNG TIN KHÁCH HÀNG & XE */}
            <div className="mb-5 grid grid-cols-2 gap-4">
              <div
                className={
                  isBw
                    ? "border border-black bg-white p-3.5 text-black"
                    : "rounded-xl border border-[#d5e2dc] border-l-4 border-l-[#174f48] bg-[#f7faf9] p-4"
                }
              >
                <h3
                  className={`mb-2 pb-1.5 text-[12px] font-bold uppercase tracking-wide ${
                    isBw ? "border-b border-black text-black" : "border-b border-[#c5d6cf] text-[#174f48]"
                  }`}
                >
                  Thông tin khách hàng
                </h3>
                <div className="space-y-1 text-[12.5px]">
                  <p>
                    <span className={isBw ? "inline-block w-20 font-medium text-black" : "inline-block w-20 text-[#536761]"}>
                      Họ và tên:
                    </span>{" "}
                    <span className="font-bold">{quoteData.customer.name || "---"}</span>
                  </p>
                  {quoteData.customer.companyName && (
                    <p>
                      <span className={isBw ? "inline-block w-20 font-medium text-black" : "inline-block w-20 text-[#536761]"}>
                        Đơn vị:
                      </span>{" "}
                      <span className="font-semibold">{quoteData.customer.companyName}</span>
                    </p>
                  )}
                  {quoteData.customer.taxId && (
                    <p>
                      <span className={isBw ? "inline-block w-20 font-medium text-black" : "inline-block w-20 text-[#536761]"}>
                        MST:
                      </span>{" "}
                      <span className="font-mono font-semibold">{quoteData.customer.taxId}</span>
                    </p>
                  )}
                  {quoteData.customer.phone && (
                    <p>
                      <span className={isBw ? "inline-block w-20 font-medium text-black" : "inline-block w-20 text-[#536761]"}>
                        Điện thoại:
                      </span>{" "}
                      <span className="font-semibold">{quoteData.customer.phone}</span>
                    </p>
                  )}
                  {quoteData.customer.zaloName && (
                    <p>
                      <span className={isBw ? "inline-block w-20 font-medium text-black" : "inline-block w-20 text-[#536761]"}>
                        Zalo:
                      </span>{" "}
                      <span className="font-semibold">{quoteData.customer.zaloName}</span>
                    </p>
                  )}
                  {quoteData.customer.address && (
                    <p>
                      <span className={isBw ? "inline-block w-20 font-medium text-black" : "inline-block w-20 text-[#536761]"}>
                        Địa chỉ:
                      </span>{" "}
                      <span>{quoteData.customer.address}</span>
                    </p>
                  )}
                </div>
              </div>

              <div
                className={
                  isBw
                    ? "border border-black bg-white p-3.5 text-black"
                    : "rounded-xl border border-[#e6dec3] border-l-4 border-l-[#d4af37] bg-[#fcfbf7] p-4"
                }
              >
                <h3
                  className={`mb-2 pb-1.5 text-[12px] font-bold uppercase tracking-wide ${
                    isBw ? "border-b border-black text-black" : "border-b border-[#dfd4b2] text-[#8a6a14]"
                  }`}
                >
                  Thông tin phương tiện
                </h3>
                {quoteData.vehicle ? (
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[12px]">
                    <p>
                      <span className={isBw ? "text-black" : "text-[#536761]"}>Biển số:</span>{" "}
                      <span className="font-bold">{quoteData.vehicle.licensePlate || "Chưa có"}</span>
                    </p>
                    <p>
                      <span className={isBw ? "text-black" : "text-[#536761]"}>Loại xe:</span>{" "}
                      <span className="font-semibold">
                        {quoteData.vehicle.vehicleType === "motorbike" ? "Xe máy" : "Ô tô"}
                      </span>
                    </p>
                    <p>
                      <span className={isBw ? "text-black" : "text-[#536761]"}>Nhãn hiệu:</span>{" "}
                      <span className="font-semibold">{quoteData.vehicle.brand || "---"}</span>
                    </p>
                    <p>
                      <span className={isBw ? "text-black" : "text-[#536761]"}>Mẫu xe:</span>{" "}
                      <span className="font-semibold">{quoteData.vehicle.model || "---"}</span>
                    </p>
                    <p className="col-span-2">
                      <span className={isBw ? "text-black" : "text-[#536761]"}>Năm sản xuất:</span>{" "}
                      <span className="font-semibold">{quoteData.vehicle.yearOfManufacture || "---"}</span>
                    </p>
                  </div>
                ) : (
                  <p className={`text-[12px] italic ${isBw ? "text-black" : "text-[#536761]"}`}>
                    Chưa kê khai biển số cụ thể — áp dụng tư vấn và xử lý theo hồ sơ thực tế của khách hàng.
                  </p>
                )}
              </div>
            </div>

            {/* 1. CHI PHÍ DỊCH VỤ */}
            <div className="mb-5">
              <div className="mb-2 flex items-center justify-between">
                <h3
                  className={`text-[13.5px] font-bold uppercase tracking-wide ${
                    isBw ? "text-black" : "text-[#174f48]"
                  }`}
                >
                  1. Bảng chi phí dịch vụ dự kiến
                </h3>
                <span className={`text-[11px] font-semibold ${isBw ? "text-black" : "text-[#536761]"}`}>
                  Đơn vị tính: VNĐ
                </span>
              </div>

              <table
                className={`w-full border-collapse text-[12.5px] ${
                  isBw ? "border border-black text-black" : "border border-[#b9ccc6] text-[#1e293b]"
                }`}
              >
                <thead>
                  <tr
                    className={
                      isBw
                        ? "border-t-2 border-b-2 border-black bg-white text-black"
                        : "bg-[#133f3a] text-white"
                    }
                  >
                    <th className={`w-10 px-2.5 py-2.5 text-center text-[11px] font-bold ${isBw ? "border border-black" : "border border-[#133f3a]"}`}>
                      STT
                    </th>
                    <th className={`px-3 py-2.5 text-left text-[11px] font-bold ${isBw ? "border border-black" : "border border-[#133f3a]"}`}>
                      Nội dung công việc / Thủ tục
                    </th>
                    <th className={`w-28 px-2.5 py-2.5 text-right text-[11px] font-bold ${isBw ? "border border-black" : "border border-[#133f3a]"}`}>
                      Đơn giá
                    </th>
                    <th className={`w-12 px-2 py-2.5 text-center text-[11px] font-bold ${isBw ? "border border-black" : "border border-[#133f3a]"}`}>
                      SL
                    </th>
                    <th className={`w-32 px-2.5 py-2.5 text-right text-[11px] font-bold ${isBw ? "border border-black" : "border border-[#133f3a]"}`}>
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {quoteData.services.map((service, idx) => (
                    <tr
                      key={service.id}
                      className={isBw ? "bg-white" : idx % 2 === 0 ? "bg-white" : "bg-[#f5f9f7]"}
                    >
                      <td className={`px-2.5 py-2.5 text-center ${isBw ? "border border-black" : "border border-[#cddad5]"}`}>
                        {idx + 1}
                      </td>
                      <td className={`px-3 py-2.5 ${isBw ? "border border-black" : "border border-[#cddad5]"}`}>
                        <p className="font-semibold">{service.name}</p>
                        {service.note && (
                          <p className={`mt-0.5 text-[11px] leading-[1.35] ${isBw ? "text-black" : "text-[#536761]"}`}>
                            {service.note}
                          </p>
                        )}
                      </td>
                      <td className={`px-2.5 py-2.5 text-right whitespace-nowrap font-mono ${isBw ? "border border-black" : "border border-[#cddad5]"}`}>
                        {formatMoney(service.price)}
                      </td>
                      <td className={`px-2 py-2.5 text-center font-mono ${isBw ? "border border-black" : "border border-[#cddad5]"}`}>
                        {service.quantity}
                      </td>
                      <td className={`px-2.5 py-2.5 text-right font-bold whitespace-nowrap font-mono ${isBw ? "border border-black" : "border border-[#cddad5]"}`}>
                        {formatMoney(service.price * service.quantity)}
                      </td>
                    </tr>
                  ))}

                  {quoteData.vatRate > 0 && (
                    <>
                      <tr className="bg-white">
                        <td
                          colSpan={4}
                          className={`px-3 py-2 text-right font-medium ${isBw ? "border border-black text-black" : "border border-[#cddad5] text-[#40534e]"}`}
                        >
                          Cộng tiền dịch vụ:
                        </td>
                        <td className={`px-2.5 py-2 text-right font-semibold whitespace-nowrap font-mono ${isBw ? "border border-black" : "border border-[#cddad5]"}`}>
                          {formatMoney(subtotal)}
                        </td>
                      </tr>
                      <tr className="bg-white">
                        <td
                          colSpan={4}
                          className={`px-3 py-2 text-right font-medium ${isBw ? "border border-black text-black" : "border border-[#cddad5] text-[#40534e]"}`}
                        >
                          Thuế GTGT ({quoteData.vatRate}%):
                        </td>
                        <td className={`px-2.5 py-2 text-right font-semibold whitespace-nowrap font-mono ${isBw ? "border border-black" : "border border-[#cddad5]"}`}>
                          {formatMoney(vatAmount)}
                        </td>
                      </tr>
                    </>
                  )}

                  {quoteData.includeRegistrationFee && registrationFee > 0 && (
                    <tr className="bg-white">
                      <td
                        colSpan={4}
                        className={`px-3 py-2 text-right text-[11.5px] ${isBw ? "border border-black text-black" : "border border-[#cddad5] text-[#536761]"}`}
                      >
                        Lệ phí trước bạ (Ước tính xe cũ {regFeePercent}%):
                      </td>
                      <td className={`px-2.5 py-2 text-right whitespace-nowrap font-mono ${isBw ? "border border-black" : "border border-[#cddad5]"}`}>
                        {formatMoney(registrationFee)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Grand Total Highlight Box + Amount in Words */}
              {isBw ? (
                <div className="mt-0 border-x border-b-[3px] border-t-2 border-black border-b-black bg-white px-3.5 py-3 text-black">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[13px] font-bold uppercase tracking-wide">
                      Tổng cộng thanh toán:
                    </span>
                    <span className="font-mono text-[17px] font-extrabold whitespace-nowrap">
                      {formatMoney(roundedTotal)}
                    </span>
                  </div>
                  <p className="mt-1 border-t border-black pt-1 text-[11.5px] italic">
                    <strong>Số tiền bằng chữ:</strong> {formatMoneyToVietnameseWords(roundedTotal)}.
                  </p>
                </div>
              ) : (
                <div
                  className="mt-3 overflow-hidden rounded-xl text-white shadow-sm"
                  style={{
                    background: "linear-gradient(135deg, #0e1522 0%, #174f48 100%)",
                    border: "1px solid rgba(212, 175, 55, 0.4)",
                  }}
                >
                  <div className="flex items-center justify-between gap-4 px-4 py-3">
                    <div>
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-[#f3d27a]">
                        Tổng cộng thanh toán
                      </span>
                      <span className="mt-0.5 block text-[11px] italic text-[#d5e7e2]">
                        Bằng chữ: <strong className="font-semibold text-white">{formatMoneyToVietnameseWords(roundedTotal)}.</strong>
                      </span>
                    </div>
                    <span className="font-mono text-[20px] font-extrabold text-[#f8e49b] whitespace-nowrap">
                      {formatMoney(roundedTotal)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. HỒ SƠ CẦN CHUẨN BỊ */}
            <div className="mb-5">
              <h3
                className={`mb-2 text-[13.5px] font-bold uppercase tracking-wide ${
                  isBw ? "text-black" : "text-[#174f48]"
                }`}
              >
                2. Hồ sơ khách hàng cần chuẩn bị
              </h3>
              <table
                className={`w-full border-collapse text-[12px] ${
                  isBw ? "border border-black text-black" : "border border-[#b9ccc6] text-[#1e293b]"
                }`}
              >
                <thead>
                  <tr
                    className={
                      isBw
                        ? "border-t-2 border-b-2 border-black bg-white text-black"
                        : "bg-[#133f3a] text-white"
                    }
                  >
                    <th className={`w-10 px-2.5 py-2 text-center text-[11px] font-bold ${isBw ? "border border-black" : "border border-[#133f3a]"}`}>
                      STT
                    </th>
                    <th className={`px-3 py-2 text-left text-[11px] font-bold ${isBw ? "border border-black" : "border border-[#133f3a]"}`}>
                      Tên giấy tờ / Chứng từ
                    </th>
                    <th className={`w-24 px-2 py-2 text-center text-[11px] font-bold ${isBw ? "border border-black" : "border border-[#133f3a]"}`}>
                      Số lượng
                    </th>
                    <th className={`px-3 py-2 text-left text-[11px] font-bold ${isBw ? "border border-black" : "border border-[#133f3a]"}`}>
                      Ghi chú
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {quoteData.documents.map((doc, idx) => (
                    <tr
                      key={doc.id}
                      className={isBw ? "bg-white" : idx % 2 === 0 ? "bg-white" : "bg-[#f5f9f7]"}
                    >
                      <td className={`px-2.5 py-2 text-center ${isBw ? "border border-black" : "border border-[#cddad5]"}`}>
                        {idx + 1}
                      </td>
                      <td className={`px-3 py-2 font-semibold ${isBw ? "border border-black" : "border border-[#cddad5]"}`}>
                        {doc.name}
                      </td>
                      <td className={`px-2 py-2 text-center whitespace-nowrap ${isBw ? "border border-black" : "border border-[#cddad5]"}`}>
                        {doc.quantity} bản
                      </td>
                      <td className={`px-3 py-2 ${isBw ? "border border-black text-black" : "border border-[#cddad5] text-[#536761]"}`}>
                        {doc.note || "—"}
                      </td>
                    </tr>
                  ))}
                  {quoteData.documents.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className={`py-2.5 text-center text-[11.5px] ${isBw ? "border border-black text-black" : "border border-[#cddad5] text-[#536761]"}`}
                      >
                        Không yêu cầu giấy tờ bổ sung
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* GHI CHÚ & CHỮ KÝ */}
            {quoteData.note && (
              <div className="mb-5">
                <h3 className={`mb-1 text-[11.5px] font-bold uppercase ${isBw ? "text-black" : "text-[#174f48]"}`}>
                  Điều khoản &amp; Ghi chú:
                </h3>
                <div
                  className={
                    isBw
                      ? "whitespace-pre-wrap border border-black bg-white p-3 text-[12px] text-black"
                      : "whitespace-pre-wrap rounded-xl border border-[#d5e2dc] border-l-4 border-l-[#bd2c3b] bg-[#f7faf9] p-3 text-[12px] text-[#334155]"
                  }
                >
                  {quoteData.note}
                </div>
              </div>
            )}

            <div className={`mt-auto grid grid-cols-2 gap-8 pt-6 text-center ${isBw ? "border-t border-black text-black" : "border-t border-[#d5e2dc] text-[#334155]"}`}>
              <div>
                <p className="text-[11.5px] font-bold uppercase tracking-wide">Khách hàng xác nhận</p>
                <p className="mt-0.5 text-[10.5px]">(Ký và ghi rõ họ tên)</p>
                <div className="h-16" aria-hidden="true" />
                <p className="text-[12px] font-semibold">{quoteData.customer.name || "........................."}</p>
              </div>
              <div>
                <p className="text-[11.5px] font-bold uppercase tracking-wide">Đại diện Saigon Motor</p>
                <p className="mt-0.5 text-[10.5px]">(Ký, ghi rõ họ tên &amp; đóng dấu)</p>
                <div className="h-16" aria-hidden="true" />
                <p className="text-[12px] font-semibold">Công ty TNHH Ô tô Xe máy 368</p>
              </div>
            </div>

            {/* Footer Strip */}
            <div
              className={`mt-5 pt-2.5 text-center text-[10px] ${
                isBw ? "border-t border-black text-black" : "border-t border-[#e2ece8] text-[#536761]"
              }`}
            >
              Saigon Motor — 745 Phạm Văn Đồng, KP. 8, P. Hiệp Bình, TP. Hồ Chí Minh • Hotline/Zalo: 0704 104 104 • saigonmotor.vn
            </div>
          </div>
        </div>
      </div>

      {/* Modal Bottom Navigation */}
      <div className="print:hidden quanly-action-bar pt-4 sm:justify-between">
        <button type="button" className="quanly-btn-secondary" onClick={onPrev}>
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Chỉnh sửa lại
        </button>
        <button
          type="button"
          disabled={saving || exportingImage}
          className="quanly-btn-gold disabled:opacity-50"
          onClick={onNext}
        >
          {saving ? "Đang xử lý..." : quoteData.status === "issued" ? "↻ Tải file PDF" : "Phát hành & xuất PDF"}
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
