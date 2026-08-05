'use client';
import { QuoteData, QuoteService } from '../types';
import { getServicesByType } from '../data/services';
import { useState, useMemo } from 'react';

interface Step2Props {
  quoteData: QuoteData;
  setQuoteData: React.Dispatch<React.SetStateAction<QuoteData>>;
  onNext: () => void;
  onPrev: () => void;
}

export default function Step2_Services({ quoteData, setQuoteData, onNext, onPrev }: Step2Props) {
  // Determine vehicle type for filtering services
  // If no vehicle info, default to motorbike (could be read from radio in real app)
  const vehicleType = quoteData.vehicle?.vehicleType || 'motorbike';
  
  const serviceGroups = useMemo(() => getServicesByType(vehicleType), [vehicleType]);
  
  const handleAddService = (service: any) => {
    if (quoteData.services.find(s => s.id === service.id)) return; // already added

    const newService: QuoteService = {
      id: service.id,
      name: service.name,
      price: service.price,
      quantity: 1,
      note: ''
    };

    setQuoteData(prev => ({
      ...prev,
      services: [...prev.services, newService]
    }));
  };

  const handleUpdateService = (id: string, field: keyof QuoteService, value: any) => {
    setQuoteData(prev => ({
      ...prev,
      services: prev.services.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const handleRemoveService = (id: string) => {
    setQuoteData(prev => ({
      ...prev,
      services: prev.services.filter(s => s.id !== id)
    }));
  };

  const handleAddCustomService = () => {
    const customService: QuoteService = {
      id: `custom_${Date.now()}`,
      name: 'Dịch vụ tùy chỉnh mới',
      price: 0,
      quantity: 1,
      note: ''
    };
    setQuoteData(prev => ({
      ...prev,
      services: [...prev.services, customService]
    }));
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const subtotal = quoteData.services.reduce((sum, service) => sum + (service.price * service.quantity), 0);
  const vatAmount = subtotal * (quoteData.vatRate / 100);
  let totalAmount = subtotal + vatAmount;

  let registrationFee = 0;
  let regFeePercent = 0;
  if (quoteData.includeRegistrationFee && quoteData.vehicle?.estimatedValue) {
    regFeePercent = quoteData.vehicle.vehicleType === 'car' ? 2 : 1;
    registrationFee = quoteData.vehicle.estimatedValue * (regFeePercent / 100);
    totalAmount += registrationFee;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Cột trái: Danh mục dịch vụ mẫu */}
        <div className="lg:col-span-5 bao-gia-card h-[650px] flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-[#D4AF37]">Danh mục Dịch vụ</h2>
          <div className="overflow-y-auto pr-2 flex-1 space-y-6">
            {serviceGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-2">
                <h3 className="text-sm font-bold text-gray-400 bg-[#2a2d3d] px-3 py-1.5 rounded">{group.group}</h3>
                <div className="space-y-2 pl-2">
                  {group.services.map(service => {
                    const isSelected = quoteData.services.some(s => s.id === service.id);
                    return (
                      <div 
                        key={service.id} 
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                          isSelected ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-gray-700 hover:border-gray-500 bg-[#212433]'
                        }`}
                        onClick={() => {
                          if (isSelected) handleRemoveService(service.id);
                          else handleAddService(service);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded flex items-center justify-center border ${isSelected ? 'bg-[#D4AF37] border-[#D4AF37] text-gray-900' : 'border-gray-500'}`}>
                            {isSelected && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <span className="text-sm text-gray-200 font-medium">{service.name}</span>
                        </div>
                        <span className="text-sm text-gray-400">{formatMoney(service.price)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cột phải: Báo giá chi tiết */}
        <div className="lg:col-span-7 bao-gia-card h-[650px] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[#D4AF37]">Báo giá Chi tiết</h2>
            <button 
              onClick={handleAddCustomService}
              className="text-sm text-[#D4AF37] hover:text-[#b8952d] flex items-center gap-1 border border-[#D4AF37] px-3 py-1 rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Thêm dòng
            </button>
          </div>

          <div className="flex-1 overflow-auto border border-gray-800 rounded-lg">
            <table className="bao-gia-table min-w-[600px]">
              <thead className="sticky top-0 z-10">
                <tr>
                  <th className="w-10 text-center">STT</th>
                  <th>Dịch vụ</th>
                  <th className="w-32">Đơn giá</th>
                  <th className="w-20 text-center">SL</th>
                  <th className="w-36 text-right">Thành tiền</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {quoteData.services.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-500">
                      Chưa có dịch vụ nào được chọn.
                    </td>
                  </tr>
                ) : (
                  quoteData.services.map((service, index) => (
                    <tr key={service.id} className="hover:bg-[#212433] transition-colors">
                      <td className="text-center text-gray-500 text-sm">{index + 1}</td>
                      <td>
                        <input 
                          type="text" 
                          className="bg-transparent w-full text-sm text-gray-200 focus:outline-none focus:border-b border-gray-600 pb-1"
                          value={service.name}
                          onChange={(e) => handleUpdateService(service.id, 'name', e.target.value)}
                        />
                        <input 
                          type="text" 
                          className="bg-transparent w-full text-xs text-gray-500 focus:outline-none mt-1"
                          placeholder="Ghi chú thêm (không bắt buộc)..."
                          value={service.note || ''}
                          onChange={(e) => handleUpdateService(service.id, 'note', e.target.value)}
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          className="bg-transparent w-full text-sm text-gray-200 focus:outline-none focus:border-b border-gray-600 pb-1"
                          value={service.price}
                          onChange={(e) => handleUpdateService(service.id, 'price', Number(e.target.value))}
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          min="1"
                          className="bg-transparent w-full text-sm text-gray-200 text-center focus:outline-none focus:border-b border-gray-600 pb-1"
                          value={service.quantity}
                          onChange={(e) => handleUpdateService(service.id, 'quantity', Number(e.target.value))}
                        />
                      </td>
                      <td className="text-right font-medium text-[#D4AF37]">
                        {formatMoney(service.price * service.quantity)}
                      </td>
                      <td className="text-center">
                        <button 
                          onClick={() => handleRemoveService(service.id)}
                          className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-800 bg-[#1a1d27] p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Cộng tiền dịch vụ:</span>
              <span className="text-gray-200">{formatMoney(subtotal)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">Thuế GTGT (VAT):</span>
                <select 
                  className="bg-[#2a2d3d] border border-gray-600 text-gray-200 text-sm rounded-md px-2 py-1 outline-none focus:border-[#D4AF37]"
                  value={quoteData.vatRate}
                  onChange={(e) => setQuoteData(prev => ({ ...prev, vatRate: Number(e.target.value) }))}
                >
                  <option value={0}>Không xuất hóa đơn</option>
                  <option value={8}>8%</option>
                  <option value={10}>10%</option>
                </select>
              </div>
              <span className="text-gray-200">{formatMoney(vatAmount)}</span>
            </div>

            <div className="flex justify-between items-center border-t border-gray-700 pt-3 mt-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <input 
                    type="checkbox" 
                    className="sr-only"
                    checked={quoteData.includeRegistrationFee || false}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, includeRegistrationFee: e.target.checked }))}
                    disabled={!quoteData.vehicle?.estimatedValue}
                  />
                  <div className={`w-5 h-5 rounded border transition-colors ${
                    quoteData.includeRegistrationFee ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-gray-500 group-hover:border-gray-400'
                  } ${!quoteData.vehicle?.estimatedValue && 'opacity-50 cursor-not-allowed'}`}>
                    {quoteData.includeRegistrationFee && <svg className="w-4 h-4 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                </div>
                <div>
                  <span className={`text-sm ${!quoteData.vehicle?.estimatedValue ? 'text-gray-500' : 'text-gray-300'}`}>
                    Lệ phí trước bạ tham khảo (Xe cũ {regFeePercent > 0 ? regFeePercent : (quoteData.vehicle?.vehicleType === 'car' ? 2 : 1)}%)
                  </span>
                  {!quoteData.vehicle?.estimatedValue && (
                    <p className="text-xs text-red-400 mt-1">Yêu cầu phải có định giá xe ở Bước 1</p>
                  )}
                </div>
              </label>
              <span className="text-gray-200">{formatMoney(registrationFee)}</span>
            </div>

            <div className="flex justify-between items-center border-t border-gray-700 pt-3">
              <span className="text-gray-300 font-medium uppercase tracking-wider">Tổng cộng thanh toán</span>
              <span className="text-2xl font-bold text-[#D4AF37]">{formatMoney(totalAmount)}</span>
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
          Quay lại
        </button>
        <button 
          className="bao-gia-btn-primary flex items-center w-full sm:w-auto"
          onClick={onNext}
        >
          Tiếp theo: Hồ sơ cần chuẩn bị
          <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
