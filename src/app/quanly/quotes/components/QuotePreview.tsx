'use client';
import { QuoteData } from '../quote-types';
import { format } from 'date-fns';

interface Step4Props {
  quoteData: QuoteData;
  onNext: () => void;
  onPrev: () => void;
}

export default function QuotePreview({ quoteData, onNext, onPrev }: Step4Props) {
  
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const subtotal = quoteData.services.reduce((sum, service) => sum + (service.price * service.quantity), 0);
  const vatAmount = subtotal * ((quoteData.vatRate || 0) / 100);
  let totalAmount = subtotal + vatAmount;

  let registrationFee = 0;
  let regFeePercent = 0;
  if (quoteData.includeRegistrationFee && quoteData.vehicle?.estimatedValue) {
    regFeePercent = quoteData.vehicle.vehicleType === 'car' ? 2 : 1;
    registrationFee = quoteData.vehicle.estimatedValue * (regFeePercent / 100);
    totalAmount += registrationFee;
  }

  const dateStr = format(quoteData.createdAt || new Date(), 'dd/MM/yyyy');

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Container giả lập trang A4 */}
      <div className="flex justify-center overflow-x-auto rounded-xl bg-gray-900 p-3 sm:p-6">
        <div 
          id="quote-preview" 
          className="relative bg-white p-8 text-[12px] leading-[1.35] text-black shadow-2xl"
          style={{ width: '794px', minHeight: '1123px', fontFamily: 'Arial, sans-serif' }} // A4 dimensions at 96dpi
        >
          {/* Watermark mờ */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo_sgm.png" alt="Watermark" style={{ width: '400px', height: '400px', objectFit: 'contain' }} />
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="mb-5 flex items-start justify-between border-b border-[#b7962f] pb-3">
              <div className="flex flex-1 items-center gap-3 pr-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo_sgm.png" alt="Saigon Motor" className="h-16 w-16 shrink-0 object-contain" />
                <div>
                  <h1 className="text-[17px] font-extrabold uppercase tracking-wide text-[#a98416]">SAIGON MOTOR</h1>
                  <p className="mt-0.5 text-[12px] font-bold uppercase">Công ty TNHH Ô tô Xe máy 368</p>
                  <p className="mt-0.5 text-[10px] text-gray-600"><span className="font-medium">MST:</span> 0316339254</p>
                  <p className="mt-0.5 max-w-[360px] text-[10px] leading-[1.3] text-gray-600"><span className="font-medium">Địa chỉ:</span> 745 Phạm Văn Đồng, khu phố 8, Phường Hiệp Bình, TP&nbsp;Hồ&nbsp;Chí&nbsp;Minh, Việt&nbsp;Nam</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <h2 className="mb-1 whitespace-nowrap text-[22px] font-black uppercase tracking-tight text-gray-900">BÁO GIÁ DỊCH VỤ</h2>
                <p className="text-[11px] text-gray-600">Số: <span className="font-semibold text-gray-900">{quoteData.quoteNumber}</span></p>
                <p className="text-[11px] text-gray-600">Ngày: <span className="font-semibold text-gray-900">{dateStr}</span></p>
                {quoteData.status === "issued" && (
                  <p className="mt-1.5 inline-block rounded border border-emerald-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                    Bản chính thức
                  </p>
                )}
              </div>
            </div>

            {/* Thông tin Khách hàng & Xe */}
            <div className="mb-5 grid grid-cols-2 gap-6">
              <div>
                <h3 className="mb-2 border-b border-gray-300 pb-1 text-[12px] font-bold uppercase text-gray-900">Thông tin khách hàng</h3>
                <p className="mb-0.5"><span className="inline-block w-20 text-gray-600">Họ và tên:</span> <span className="font-bold">{quoteData.customer.name}</span></p>
                {quoteData.customer.companyName && (
                  <p className="mb-0.5"><span className="inline-block w-20 text-gray-600">Đơn vị:</span> <span className="font-bold">{quoteData.customer.companyName}</span></p>
                )}
                {quoteData.customer.phone && (
                  <p className="mb-0.5"><span className="inline-block w-20 text-gray-600">Điện thoại:</span> <span className="font-bold">{quoteData.customer.phone}</span></p>
                )}
                {quoteData.customer.zaloName && (
                  <p><span className="inline-block w-20 text-gray-600">Zalo:</span> <span className="font-bold">{quoteData.customer.zaloName}</span></p>
                )}
              </div>
              
              {quoteData.vehicle && (
                <div>
                  <h3 className="mb-2 border-b border-gray-300 pb-1 text-[12px] font-bold uppercase text-gray-900">Thông tin xe</h3>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[11px]">
                    <p><span className="text-gray-600">Biển số:</span> <span className="font-bold">{quoteData.vehicle.licensePlate}</span></p>
                    <p><span className="text-gray-600">Loại xe:</span> <span className="font-bold">{quoteData.vehicle.vehicleType === 'motorbike' ? 'Xe Máy' : 'Ô tô'}</span></p>
                    <p><span className="text-gray-600">Nhãn hiệu:</span> <span className="font-bold">{quoteData.vehicle.brand}</span></p>
                    <p><span className="text-gray-600">Model:</span> <span className="font-bold">{quoteData.vehicle.model}</span></p>
                    <p><span className="text-gray-600">Năm SX:</span> <span className="font-bold">{quoteData.vehicle.yearOfManufacture || '---'}</span></p>
                  </div>
                </div>
              )}
            </div>

            {/* Bảng Dịch vụ */}
            <div className="mb-5">
              <h3 className="mb-2 text-[12px] font-bold uppercase text-gray-900">1. Chi phí dịch vụ</h3>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="w-10 border border-gray-300 px-2 py-1.5 text-center text-[10px]">STT</th>
                    <th className="border border-gray-300 px-2 py-1.5 text-left text-[10px]">Nội dung công việc</th>
                    <th className="w-24 border border-gray-300 px-2 py-1.5 text-right text-[10px]">Đơn giá</th>
                    <th className="w-12 border border-gray-300 px-2 py-1.5 text-center text-[10px]">SL</th>
                    <th className="w-28 border border-gray-300 px-2 py-1.5 text-right text-[10px]">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteData.services.map((service, idx) => (
                    <tr key={service.id}>
                      <td className="border border-gray-300 px-2 py-1.5 text-center text-[10px]">{idx + 1}</td>
                      <td className="border border-gray-300 px-2 py-1.5">
                        <p className="text-[11px] font-semibold">{service.name}</p>
                        {service.note && <p className="mt-0.5 text-[9px] italic leading-[1.2] text-gray-500">{service.note}</p>}
                      </td>
                      <td className="border border-gray-300 px-2 py-1.5 text-right text-[10px] whitespace-nowrap">{formatMoney(service.price)}</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-center text-[10px]">{service.quantity}</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-right text-[10px] font-medium whitespace-nowrap">{formatMoney(service.price * service.quantity)}</td>
                    </tr>
                  ))}
                  
                  {quoteData.vatRate > 0 && (
                    <>
                      <tr>
                        <td colSpan={4} className="border border-gray-300 px-2 py-1.5 text-right text-[10px] font-medium text-gray-700">Cộng tiền dịch vụ:</td>
                        <td className="border border-gray-300 px-2 py-1.5 text-right text-[10px] font-medium whitespace-nowrap">{formatMoney(subtotal)}</td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="border border-gray-300 px-2 py-1.5 text-right text-[10px] font-medium text-gray-700">Thuế GTGT ({quoteData.vatRate}%):</td>
                        <td className="border border-gray-300 px-2 py-1.5 text-right text-[10px] font-medium whitespace-nowrap">{formatMoney(vatAmount)}</td>
                      </tr>
                    </>
                  )}
                  
                  {quoteData.includeRegistrationFee && registrationFee > 0 && (
                    <tr>
                      <td colSpan={4} className="border border-gray-300 px-2 py-1.5 text-right text-[10px] font-medium text-gray-700">
                        Lệ phí trước bạ (Ước tính xe cũ {regFeePercent}%):
                      </td>
                      <td className="border border-gray-300 px-2 py-1.5 text-right text-[10px] font-medium whitespace-nowrap">{formatMoney(registrationFee)}</td>
                    </tr>
                  )}

                  <tr className="bg-gray-50 font-bold">
                    <td colSpan={4} className="border border-gray-300 px-2 py-2 text-right text-[11px] uppercase text-gray-800">Tổng cộng thanh toán:</td>
                    <td className="border border-gray-300 px-2 py-2 text-right text-[14px] text-[#9a7610] whitespace-nowrap">{formatMoney(totalAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bảng Hồ sơ */}
            <div className="mb-5">
              <h3 className="mb-2 text-[12px] font-bold uppercase text-gray-900">2. Hồ sơ khách hàng cần chuẩn bị</h3>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="w-10 border border-gray-300 px-2 py-1.5 text-center text-[10px]">STT</th>
                    <th className="border border-gray-300 px-2 py-1.5 text-left text-[10px]">Tên giấy tờ</th>
                    <th className="w-20 border border-gray-300 px-2 py-1.5 text-center text-[10px]">Số lượng</th>
                    <th className="border border-gray-300 px-2 py-1.5 text-left text-[10px]">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteData.documents.map((doc, idx) => (
                    <tr key={doc.id}>
                      <td className="border border-gray-300 px-2 py-1.5 text-center text-[10px]">{idx + 1}</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-[10px] font-medium">{doc.name}</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-center text-[10px]">{doc.quantity} bản</td>
                      <td className="border border-gray-300 px-2 py-1.5 text-[10px] italic text-gray-600">{doc.note}</td>
                    </tr>
                  ))}
                  {quoteData.documents.length === 0 && (
                    <tr><td colSpan={4} className="border border-gray-300 py-2 text-center text-[10px] text-gray-500">Không yêu cầu</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Ghi chú chung */}
            {quoteData.note && (
              <div className="mb-4">
                <h3 className="mb-1 text-[11px] font-bold text-gray-800">Ghi chú:</h3>
                <div className="whitespace-pre-wrap border-l-2 border-[#b7962f] bg-gray-50 p-2.5 text-[10px] italic text-gray-700">
                  {quoteData.note}
                </div>
              </div>
            )}

            {/* Signatures */}
            <div className="mt-8 flex justify-between px-10 pt-3">
              <div className="text-center">
                <p className="mb-14 text-[11px] font-bold uppercase text-gray-800">Khách hàng</p>
                <p className="text-[9px] text-gray-500">(Ký và ghi rõ họ tên)</p>
              </div>
              <div className="text-center">
                <p className="mb-14 text-[11px] font-bold uppercase text-gray-800">Đại diện Saigon Motor</p>
                <p className="text-[9px] text-gray-500">(Ký và ghi rõ họ tên)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 pt-8">
        <button 
          className="quanly-btn-secondary flex w-full items-center sm:w-auto"
          onClick={onPrev}
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Chỉnh sửa lại
        </button>
        <button 
          className="quanly-btn-gold flex w-full items-center sm:w-auto"
          onClick={onNext}
        >
          Chuyển sang Xuất PDF
          <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
