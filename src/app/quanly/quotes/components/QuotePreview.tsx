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
          className="relative overflow-hidden bg-[#fffefa] p-9 text-[14px] leading-[1.5] font-normal text-[#263633] shadow-2xl"
          style={{ width: '794px', minHeight: '1123px', fontFamily: 'var(--font-be-vietnam), Arial, sans-serif' }} // A4 dimensions at 96dpi
        >
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#14584f] via-[#75b7a7] to-[#d1a54f]" />
          {/* Watermark mờ */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo_sgm.png" alt="Watermark" style={{ width: '400px', height: '400px', objectFit: 'contain' }} />
          </div>

          <div className="relative z-10">
            {/* Header */}
              <div className="mb-7 flex items-start justify-between rounded-b-xl border-b border-[#c9d9d3] bg-gradient-to-br from-[#edf5f1] via-[#f7f8f3] to-[#fbf3e2] px-5 pb-5 pt-6">
              <div className="flex flex-1 items-center gap-3 pr-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo_sgm.png" alt="Saigon Motor" className="h-16 w-16 shrink-0 object-contain" />
                <div>
                  <h1 className="text-[20px] font-bold uppercase tracking-[0.08em] text-[#174f48]">SAIGON MOTOR</h1>
                  <p className="mt-1 text-[13px] font-medium uppercase tracking-wide text-[#405b55]">Công ty TNHH Ô tô Xe máy 368</p>
                  <p className="mt-1 text-[11px] font-normal text-[#445853]"><span className="font-semibold">MST:</span> 0316339254</p>
                  <p className="mt-1 max-w-[360px] text-[11px] font-normal leading-[1.45] text-[#445853]"><span className="font-semibold">Địa chỉ:</span> 745 Phạm Văn Đồng, khu phố 8, Phường Hiệp Bình, TP&nbsp;Hồ&nbsp;Chí&nbsp;Minh, Việt&nbsp;Nam</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <h2 className="mb-2 whitespace-nowrap text-[21px] font-bold uppercase tracking-[0.02em] text-[#174f48]">BÁO GIÁ DỊCH VỤ</h2>
                <p className="text-[12px] font-normal text-[#445853]">Số: <span className="font-semibold text-[#263633]">{quoteData.quoteNumber}</span></p>
                <p className="text-[12px] font-normal text-[#445853]">Ngày: <span className="font-semibold text-[#263633]">{dateStr}</span></p>
              </div>
            </div>

            {/* Thông tin Khách hàng & Xe */}
            <div className="mb-7 grid grid-cols-2 gap-7">
              <div>
                <h3 className="mb-2 border-b border-[#b8cbc4] pb-1.5 text-[13px] font-semibold uppercase tracking-wide text-[#174f48]">Thông tin khách hàng</h3>
                <p className="mb-1"><span className="inline-block w-20 font-normal text-[#536761]">Họ và tên:</span> <span className="font-semibold text-[#263633]">{quoteData.customer.name}</span></p>
                {quoteData.customer.companyName && (
                    <p className="mb-1"><span className="inline-block w-20 font-normal text-[#536761]">Đơn vị:</span> <span className="font-semibold text-[#263633]">{quoteData.customer.companyName}</span></p>
                )}
                {quoteData.customer.phone && (
                    <p className="mb-1"><span className="inline-block w-20 font-normal text-[#536761]">Điện thoại:</span> <span className="font-semibold text-[#263633]">{quoteData.customer.phone}</span></p>
                )}
                {quoteData.customer.zaloName && (
                    <p><span className="inline-block w-20 font-normal text-[#536761]">Zalo:</span> <span className="font-semibold text-[#263633]">{quoteData.customer.zaloName}</span></p>
                )}
              </div>
              
              {quoteData.vehicle && (
                <div>
                  <h3 className="mb-2 border-b border-[#b8cbc4] pb-1.5 text-[13px] font-semibold uppercase tracking-wide text-[#174f48]">Thông tin xe</h3>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[12px] font-medium">
                    <p><span className="font-semibold text-[#444]">Biển số:</span> <span className="font-bold text-black">{quoteData.vehicle.licensePlate}</span></p>
                    <p><span className="text-gray-600">Loại xe:</span> <span className="font-bold">{quoteData.vehicle.vehicleType === 'motorbike' ? 'Xe Máy' : 'Ô tô'}</span></p>
                    <p><span className="text-gray-600">Nhãn hiệu:</span> <span className="font-bold">{quoteData.vehicle.brand}</span></p>
                    <p><span className="text-gray-600">Model:</span> <span className="font-bold">{quoteData.vehicle.model}</span></p>
                    <p><span className="text-gray-600">Năm SX:</span> <span className="font-bold">{quoteData.vehicle.yearOfManufacture || '---'}</span></p>
                  </div>
                </div>
              )}
            </div>

            {/* Bảng Dịch vụ */}
            <div className="mb-7">
              <h3 className="mb-2.5 text-[14px] font-semibold uppercase tracking-wide text-[#174f48]">1. Chi phí dịch vụ</h3>
              <table className="w-full border-collapse border border-[#aebdb8] text-[#263633]">
                <thead>
                  <tr className="bg-[#185d53] text-white">
                    <th className="w-10 border border-[#185d53] px-2 py-2 text-center text-[11px] font-semibold">STT</th>
                    <th className="border border-[#185d53] px-2 py-2 text-left text-[11px] font-semibold">Nội dung công việc</th>
                    <th className="w-24 border border-[#185d53] px-2 py-2 text-right text-[11px] font-semibold">Đơn giá</th>
                    <th className="w-12 border border-[#185d53] px-2 py-2 text-center text-[11px] font-semibold">SL</th>
                    <th className="w-28 border border-[#185d53] px-2 py-2 text-right text-[11px] font-semibold">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteData.services.map((service, idx) => (
                    <tr key={service.id}>
                      <td className="border border-[#c5d0cc] px-2 py-2 text-center text-[12px] font-normal">{idx + 1}</td>
                      <td className="border border-[#c5d0cc] px-2 py-2">
                        <p className="text-[13px] font-medium text-[#263633]">{service.name}</p>
                        {service.note && <p className="mt-1 text-[11px] font-normal leading-[1.35] text-[#536761]">{service.note}</p>}
                      </td>
                      <td className="border border-[#c5d0cc] px-2 py-2 text-right text-[12px] font-normal whitespace-nowrap">{formatMoney(service.price)}</td>
                      <td className="border border-[#c5d0cc] px-2 py-2 text-center text-[12px] font-normal">{service.quantity}</td>
                      <td className="border border-[#c5d0cc] px-2 py-2 text-right text-[12px] font-semibold whitespace-nowrap">{formatMoney(service.price * service.quantity)}</td>
                    </tr>
                  ))}
                  
                  {quoteData.vatRate > 0 && (
                    <>
                      <tr>
                    <td colSpan={4} className="border border-[#c5d0cc] px-2 py-2 text-right text-[12px] font-medium text-[#40534e]">Cộng tiền dịch vụ:</td>
                      <td className="border border-[#c5d0cc] px-2 py-2 text-right text-[12px] font-medium whitespace-nowrap">{formatMoney(subtotal)}</td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="border border-[#c5d0cc] px-2 py-2 text-right text-[12px] font-medium text-[#40534e]">Thuế GTGT ({quoteData.vatRate}%):</td>
                        <td className="border border-[#c5d0cc] px-2 py-2 text-right text-[12px] font-medium whitespace-nowrap">{formatMoney(vatAmount)}</td>
                      </tr>
                    </>
                  )}
                  
                  {quoteData.includeRegistrationFee && registrationFee > 0 && (
                    <tr>
                      <td colSpan={4} className="border border-[#c5d0cc] px-2 py-1.5 text-right text-[11px] font-normal text-[#536761]">
                        Lệ phí trước bạ (Ước tính xe cũ {regFeePercent}%):
                      </td>
                      <td className="border border-[#c5d0cc] px-2 py-1.5 text-right text-[11px] font-normal whitespace-nowrap">{formatMoney(registrationFee)}</td>
                    </tr>
                  )}

                  <tr className="bg-[#f4edda] font-semibold">
                    <td colSpan={4} className="border border-[#aebdb8] px-2 py-2.5 text-right text-[13px] font-semibold uppercase text-[#344842]">Tổng cộng thanh toán:</td>
                    <td className="border border-[#aebdb8] px-2 py-2.5 text-right text-[16px] font-bold text-[#174f48] whitespace-nowrap">{formatMoney(totalAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bảng Hồ sơ */}
            <div className="mb-7">
              <h3 className="mb-2.5 text-[14px] font-semibold uppercase tracking-wide text-[#174f48]">2. Hồ sơ khách hàng cần chuẩn bị</h3>
              <table className="w-full border-collapse border border-[#aebdb8] text-[#263633]">
                <thead>
                  <tr className="bg-[#185d53] text-white">
                    <th className="w-10 border border-[#185d53] px-2 py-2 text-center text-[11px] font-semibold">STT</th>
                    <th className="border border-[#185d53] px-2 py-2 text-left text-[11px] font-semibold">Tên giấy tờ</th>
                    <th className="w-20 border border-[#185d53] px-2 py-2 text-center text-[11px] font-semibold">Số lượng</th>
                    <th className="border border-[#185d53] px-2 py-2 text-left text-[11px] font-semibold">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteData.documents.map((doc, idx) => (
                    <tr key={doc.id}>
                      <td className="border border-[#c5d0cc] px-2 py-2 text-center text-[12px] font-normal">{idx + 1}</td>
                      <td className="border border-[#c5d0cc] px-2 py-2 text-[12px] font-medium">{doc.name}</td>
                      <td className="border border-[#c5d0cc] px-2 py-2 text-center text-[12px] font-normal">{doc.quantity} bản</td>
                      <td className="border border-[#c5d0cc] px-2 py-2 text-[12px] font-normal text-[#536761]">{doc.note}</td>
                    </tr>
                  ))}
                  {quoteData.documents.length === 0 && (
                    <tr><td colSpan={4} className="border border-[#c5d0cc] py-2 text-center text-[11px] text-[#536761]">Không yêu cầu</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Ghi chú chung */}
            {quoteData.note && (
              <div className="mb-4">
                <h3 className="mb-1 text-[11px] font-semibold text-[#344842]">Ghi chú:</h3>
                <div className="whitespace-pre-wrap rounded-r-md border-l-[3px] border-[#d1a54f] bg-[#f5f6f1] p-3 text-[12px] font-normal text-[#344842]">
                  {quoteData.note}
                </div>
              </div>
            )}

            {/* Signatures */}
            <div className="mt-10 flex justify-between px-10 pt-5">
              <div className="text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#344842]">Khách hàng</p>
                <p className="mt-1 text-[10px] font-normal text-[#536761]">(Ký và ghi rõ họ tên)</p>
                <div className="h-16" aria-hidden="true" />
              </div>
              <div className="text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#344842]">Đại diện Saigon Motor</p>
                <p className="mt-1 text-[10px] font-normal text-[#536761]">(Ký, ghi rõ họ tên và đóng dấu)</p>
                <div className="h-16" aria-hidden="true" />
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
