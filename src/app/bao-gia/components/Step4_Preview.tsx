'use client';
import { QuoteData } from '../types';
import Image from 'next/image';
import { format } from 'date-fns';

interface Step4Props {
  quoteData: QuoteData;
  onNext: () => void;
  onPrev: () => void;
}

export default function Step4_Preview({ quoteData, onNext, onPrev }: Step4Props) {
  
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
      <div className="flex justify-center bg-gray-900 p-8 rounded-xl overflow-x-auto">
        <div 
          id="quote-preview" 
          className="bg-white text-black p-10 shadow-2xl relative"
          style={{ width: '794px', minHeight: '1123px' }} // A4 dimensions at 96dpi
        >
          {/* Watermark mờ */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none z-0">
            <img src="/logo_sgm.png" alt="Watermark" style={{ width: '400px', height: '400px', objectFit: 'contain' }} />
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-[#D4AF37] pb-6 mb-8">
              <div className="flex items-center gap-4 flex-1 pr-4">
                <img src="/logo_sgm.png" alt="Saigon Motor" className="w-20 h-20 object-contain shrink-0" />
                <div>
                  <h1 className="text-xl font-bold uppercase text-[#D4AF37]">SAIGON MOTOR</h1>
                  <p className="text-sm font-bold mt-1 uppercase">Công ty TNHH Oto Xe Máy 368</p>
                  <p className="text-xs text-gray-600 mt-0.5"><span className="font-medium">MST:</span> 0316339254</p>
                  <p className="text-xs text-gray-600 mt-0.5"><span className="font-medium">Địa chỉ:</span> 745 Phạm Văn Đồng, khu phố 8, Phường Hiệp Bình, TP&nbsp;Hồ&nbsp;Chí&nbsp;Minh, Việt&nbsp;Nam</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <h2 className="text-3xl font-black uppercase text-gray-800 mb-2 whitespace-nowrap">BÁO GIÁ DỊCH VỤ</h2>
                <p className="text-sm text-gray-600">Số: <span className="font-semibold">{quoteData.quoteNumber}</span></p>
                <p className="text-sm text-gray-600">Ngày: <span className="font-semibold">{dateStr}</span></p>
              </div>
            </div>

            {/* Thông tin Khách hàng & Xe */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-[#D4AF37] font-bold uppercase border-b border-gray-200 pb-2 mb-3">Thông tin Khách hàng</h3>
                <p className="mb-1"><span className="text-gray-600 w-24 inline-block">Họ và tên:</span> <span className="font-bold">{quoteData.customer.name}</span></p>
                <p><span className="text-gray-600 w-24 inline-block">Điện thoại:</span> <span className="font-bold">{quoteData.customer.phone}</span></p>
              </div>
              
              {quoteData.vehicle && (
                <div>
                  <h3 className="text-[#D4AF37] font-bold uppercase border-b border-gray-200 pb-2 mb-3">Thông tin Xe</h3>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
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
            <div className="mb-8">
              <h3 className="text-[#D4AF37] font-bold uppercase mb-3">1. Chi phí dịch vụ</h3>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="border border-gray-300 py-2 px-3 w-12 text-center text-sm">STT</th>
                    <th className="border border-gray-300 py-2 px-3 text-left text-sm">Nội dung công việc</th>
                    <th className="border border-gray-300 py-2 px-3 w-28 text-right text-sm">Đơn giá</th>
                    <th className="border border-gray-300 py-2 px-3 w-16 text-center text-sm">SL</th>
                    <th className="border border-gray-300 py-2 px-3 w-32 text-right text-sm">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteData.services.map((service, idx) => (
                    <tr key={service.id}>
                      <td className="border border-gray-300 py-2 px-3 text-center text-sm">{idx + 1}</td>
                      <td className="border border-gray-300 py-2 px-3">
                        <p className="font-semibold text-sm">{service.name}</p>
                        {service.note && <p className="text-xs text-gray-500 italic mt-0.5">{service.note}</p>}
                      </td>
                      <td className="border border-gray-300 py-2 px-3 text-right text-sm">{formatMoney(service.price)}</td>
                      <td className="border border-gray-300 py-2 px-3 text-center text-sm">{service.quantity}</td>
                      <td className="border border-gray-300 py-2 px-3 text-right font-medium text-sm">{formatMoney(service.price * service.quantity)}</td>
                    </tr>
                  ))}
                  
                  {quoteData.vatRate > 0 && (
                    <>
                      <tr>
                        <td colSpan={4} className="border border-gray-300 py-2 px-3 text-right text-gray-700 font-medium">Cộng tiền dịch vụ:</td>
                        <td className="border border-gray-300 py-2 px-3 text-right font-medium">{formatMoney(subtotal)}</td>
                      </tr>
                      <tr>
                        <td colSpan={4} className="border border-gray-300 py-2 px-3 text-right text-gray-700 font-medium">Thuế GTGT ({quoteData.vatRate}%):</td>
                        <td className="border border-gray-300 py-2 px-3 text-right font-medium">{formatMoney(vatAmount)}</td>
                      </tr>
                    </>
                  )}
                  
                  {quoteData.includeRegistrationFee && registrationFee > 0 && (
                    <tr>
                      <td colSpan={4} className="border border-gray-300 py-2 px-3 text-right text-gray-700 font-medium">
                        Lệ phí trước bạ (Ước tính xe cũ {regFeePercent}%):
                      </td>
                      <td className="border border-gray-300 py-2 px-3 text-right font-medium">{formatMoney(registrationFee)}</td>
                    </tr>
                  )}

                  <tr className="bg-gray-50 font-bold">
                    <td colSpan={4} className="border border-gray-300 py-3 px-3 text-right text-gray-800 uppercase">Tổng cộng thanh toán:</td>
                    <td className="border border-gray-300 py-3 px-3 text-right text-[#D4AF37] text-lg">{formatMoney(totalAmount)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bảng Hồ sơ */}
            <div className="mb-12">
              <h3 className="text-[#D4AF37] font-bold uppercase mb-3">2. Hồ sơ khách hàng cần chuẩn bị</h3>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="border border-gray-300 py-2 px-3 w-12 text-center text-sm">STT</th>
                    <th className="border border-gray-300 py-2 px-3 text-left text-sm">Tên giấy tờ</th>
                    <th className="border border-gray-300 py-2 px-3 w-24 text-center text-sm">Số lượng</th>
                    <th className="border border-gray-300 py-2 px-3 text-left text-sm">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteData.documents.map((doc, idx) => (
                    <tr key={doc.id}>
                      <td className="border border-gray-300 py-2 px-3 text-center text-sm">{idx + 1}</td>
                      <td className="border border-gray-300 py-2 px-3 font-medium text-sm">{doc.name}</td>
                      <td className="border border-gray-300 py-2 px-3 text-center text-sm">{doc.quantity} bản</td>
                      <td className="border border-gray-300 py-2 px-3 text-sm text-gray-600 italic">{doc.note}</td>
                    </tr>
                  ))}
                  {quoteData.documents.length === 0 && (
                    <tr><td colSpan={4} className="border border-gray-300 py-4 text-center text-sm text-gray-500">Không yêu cầu</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Signatures */}
            <div className="flex justify-between px-12 mt-16 pt-8">
              <div className="text-center">
                <p className="font-bold text-gray-800 mb-24 uppercase">Khách hàng</p>
                <p className="text-sm text-gray-500">(Ký và ghi rõ họ tên)</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-800 mb-24 uppercase">Đại diện Saigon Motor</p>
                <p className="text-sm text-gray-500">(Ký và ghi rõ họ tên)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-between gap-4 pt-8">
        <button 
          className="bao-gia-btn-secondary flex items-center w-full sm:w-auto"
          onClick={onPrev}
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Chỉnh sửa lại
        </button>
        <button 
          className="bao-gia-btn-primary flex items-center w-full sm:w-auto"
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
