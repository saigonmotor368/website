'use client';
import { useState, useRef } from 'react';
import { QuoteData, VehicleInfo } from '../types';
import { estimateValue } from '../data/depreciation';

interface Step1Props {
  quoteData: QuoteData;
  setQuoteData: React.Dispatch<React.SetStateAction<QuoteData>>;
  onNext: () => void;
}

export default function Step1_CustomerVehicle({ quoteData, setQuoteData, onNext }: Step1Props) {
  const [activeTab, setActiveTab] = useState<'with-info' | 'no-info'>('with-info');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [originalPriceInput, setOriginalPriceInput] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuoteData(prev => ({
      ...prev,
      customer: { ...prev.customer, [e.target.name]: e.target.value }
    }));
  };

  const handleVehicleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!quoteData.vehicle) return;
    setQuoteData(prev => ({
      ...prev,
      vehicle: { ...prev.vehicle!, [e.target.name]: e.target.value }
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setSelectedImages(prev => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    });
    
    // Clear the input so same files can be selected again if removed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const extractCavetInfo = async () => {
    if (selectedImages.length === 0) {
      setExtractError('Vui lòng tải lên ít nhất 1 ảnh.');
      return;
    }
    
    setIsExtracting(true);
    setExtractError('');
    try {
      const response = await fetch('/api/extract-cavet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: selectedImages })
      });

      if (!response.ok) throw new Error('Không thể trích xuất thông tin. Hãy thử lại.');

      const data = await response.json();
      
      setQuoteData(prev => {
        let estimatedValue = prev.vehicle?.estimatedValue;
        
        // Nếu AI trả về originalPrice (tự đoán giá trị gốc)
        if (data.originalPrice) {
          setOriginalPriceInput(data.originalPrice.toString());
          const year = data.yearOfManufacture || prev.vehicle?.yearOfManufacture;
          const type = data.vehicleType || prev.vehicle?.vehicleType;
          if (year && type) {
            estimatedValue = estimateValue(data.originalPrice, year, type);
          }
        }
        
        return { 
          ...prev, 
          vehicle: { 
            ...prev.vehicle!, 
            ...data,
            ...(estimatedValue !== undefined ? { estimatedValue } : {})
          } 
        };
      });
    } catch (error: any) {
      setExtractError(error.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCalculateDepreciation = () => {
    const price = parseFloat(originalPriceInput.replace(/,/g, ''));
    if (isNaN(price) || !quoteData.vehicle?.yearOfManufacture) return;

    const estimated = estimateValue(price, quoteData.vehicle.yearOfManufacture, quoteData.vehicle.vehicleType);
    setQuoteData(prev => ({
      ...prev,
      vehicle: { ...prev.vehicle!, estimatedValue: estimated }
    }));
  };

  const isNextDisabled = !quoteData.customer.name || !quoteData.customer.phone || (activeTab === 'with-info' && !quoteData.vehicle?.licensePlate);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Phần A: Thông tin khách hàng */}
      <div className="bao-gia-card">
        <h2 className="text-xl font-semibold mb-4 text-[#D4AF37]">1. Thông tin Khách hàng</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Họ và tên *</label>
            <input 
              type="text" 
              name="name"
              className="bao-gia-input" 
              placeholder="VD: Nguyễn Văn A"
              value={quoteData.customer.name}
              onChange={handleCustomerChange}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Số điện thoại *</label>
            <input 
              type="text" 
              name="phone"
              className="bao-gia-input" 
              placeholder="VD: 0901234567"
              value={quoteData.customer.phone}
              onChange={handleCustomerChange}
            />
          </div>
        </div>
      </div>

      {/* Phần B: Thông tin xe */}
      <div className="bao-gia-card">
        <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-4">
          <h2 className="text-xl font-semibold text-[#D4AF37]">2. Thông tin Xe</h2>
          <div className="flex bg-[#2a2d3d] p-1 rounded-lg">
            <button 
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'with-info' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => {
                setActiveTab('with-info');
                if (!quoteData.vehicle) {
                  setQuoteData(prev => ({ ...prev, vehicle: { ownerName: '', licensePlate: '', frameNumber: '', engineNumber: '', brand: '', model: '', color: '', yearOfManufacture: 2020, vehicleType: 'motorbike', registeredProvince: '' } }));
                }
              }}
            >
              Có thông tin / Cà vẹt
            </button>
            <button 
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === 'no-info' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
              onClick={() => {
                setActiveTab('no-info');
                setQuoteData(prev => ({ ...prev, vehicle: null }));
              }}
            >
              Không có thông tin xe
            </button>
          </div>
        </div>

        {activeTab === 'with-info' && (
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="border-2 border-dashed border-gray-700 hover:border-[#D4AF37] transition-colors rounded-xl p-8 text-center bg-[#212433]">
              <input 
                type="file" 
                accept="image/*" 
                multiple
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              
              {selectedImages.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-4 justify-center">
                    {selectedImages.map((src, idx) => (
                      <div key={idx} className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-[#D4AF37]">
                        <img src={src} alt="Thumbnail" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    {selectedImages.length < 5 && (
                      <div 
                        className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-[#D4AF37] hover:text-[#D4AF37] text-gray-500 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {isExtracting ? (
                    <div className="flex flex-col items-center justify-center py-4">
                      <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-[#D4AF37] font-medium animate-pulse">AI đang phân tích {selectedImages.length} ảnh cà vẹt...</p>
                    </div>
                  ) : (
                    <button 
                      onClick={extractCavetInfo}
                      className="px-6 py-3 bg-[#D4AF37] hover:bg-[#C5A028] text-black font-bold rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all transform hover:scale-105 active:scale-95"
                    >
                      BẮT ĐẦU TRÍCH XUẤT THÔNG TIN
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <svg className="w-12 h-12 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <p className="font-medium text-gray-300 mb-1">Click hoặc kéo thả ảnh Cà vẹt vào đây</p>
                  <p className="text-sm text-gray-500 mb-4">Hỗ trợ JPG, PNG. Bạn có thể chọn nhiều ảnh (mặt trước/mặt sau) cùng lúc.</p>
                  <button className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium text-[#D4AF37] transition-colors border border-gray-600 hover:border-[#D4AF37]">
                    Tải Ảnh Lên
                  </button>
                </div>
              )}
              {extractError && <p className="text-red-400 mt-4 text-sm font-medium">{extractError}</p>}
            </div>

            {/* Form Kết quả */}
            {quoteData.vehicle && (
              <div className="bg-[#212433] p-6 rounded-xl border border-gray-800">
                <h3 className="text-lg font-medium text-gray-200 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Thông tin xe đã trích xuất
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Loại xe</label>
                    <select name="vehicleType" className="bao-gia-input" value={quoteData.vehicle.vehicleType} onChange={handleVehicleChange}>
                      <option value="motorbike">Xe máy</option>
                      <option value="car">Ô tô</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Biển số</label>
                    <input type="text" name="licensePlate" className="bao-gia-input font-mono" value={quoteData.vehicle.licensePlate} onChange={handleVehicleChange} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tên chủ xe</label>
                    <input type="text" name="ownerName" className="bao-gia-input" value={quoteData.vehicle.ownerName} onChange={handleVehicleChange} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Số khung</label>
                    <input type="text" name="frameNumber" className="bao-gia-input font-mono text-sm" value={quoteData.vehicle.frameNumber} onChange={handleVehicleChange} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Số máy</label>
                    <input type="text" name="engineNumber" className="bao-gia-input font-mono text-sm" value={quoteData.vehicle.engineNumber} onChange={handleVehicleChange} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Nhãn hiệu (Brand)</label>
                    <input type="text" name="brand" className="bao-gia-input" value={quoteData.vehicle.brand} onChange={handleVehicleChange} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Số loại (Model)</label>
                    <input type="text" name="model" className="bao-gia-input" value={quoteData.vehicle.model} onChange={handleVehicleChange} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Năm sản xuất</label>
                    <input type="number" name="yearOfManufacture" className="bao-gia-input" value={quoteData.vehicle.yearOfManufacture || ''} onChange={handleVehicleChange} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Tỉnh đăng ký</label>
                    <input type="text" name="registeredProvince" className="bao-gia-input" value={quoteData.vehicle.registeredProvince} onChange={handleVehicleChange} />
                  </div>
                </div>

                {/* Định giá tài sản */}
                <div className="mt-6 p-4 bg-[#1a1d27] rounded-lg border border-gray-700">
                  <h4 className="text-sm font-medium text-[#D4AF37] mb-3">Định giá tài sản (Khấu hao)</h4>
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Giá trị gốc mua mới (VNĐ)</label>
                      <input 
                        type="text" 
                        className="bao-gia-input" 
                        placeholder="VD: 45000000"
                        value={originalPriceInput}
                        onChange={(e) => setOriginalPriceInput(e.target.value)}
                      />
                    </div>
                    <button 
                      className="bao-gia-btn-secondary py-2"
                      onClick={handleCalculateDepreciation}
                    >
                      Tính khấu hao
                    </button>
                    <div className="flex-1 bg-[#2a2d3d] rounded-lg p-2.5 border border-gray-700">
                      <p className="text-xs text-gray-500 mb-1">Giá trị ước tính hiện tại:</p>
                      <p className="text-lg font-bold text-green-400">
                        {quoteData.vehicle.estimatedValue 
                          ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(quoteData.vehicle.estimatedValue)
                          : '0 đ'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'no-info' && (
          <div className="bg-[#212433] p-6 rounded-xl border border-gray-800 text-center">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-300 mb-2">Báo giá theo yêu cầu dịch vụ</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">Bạn đã chọn tạo báo giá không có thông tin xe chi tiết. Hệ thống sẽ bỏ qua phần thông tin xe trong bản in PDF. Vui lòng chọn loại xe để nạp đúng bảng giá.</p>
            
            <div className="inline-flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-700 rounded-lg bg-[#1a1d27] hover:border-[#D4AF37] transition-colors">
                <input 
                  type="radio" 
                  name="mockVehicleType" 
                  value="motorbike" 
                  defaultChecked
                  className="w-4 h-4 text-[#D4AF37]"
                />
                <span className="text-gray-300">Xe Máy</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-3 border border-gray-700 rounded-lg bg-[#1a1d27] hover:border-[#D4AF37] transition-colors">
                <input 
                  type="radio" 
                  name="mockVehicleType" 
                  value="car" 
                  className="w-4 h-4 text-[#D4AF37]"
                />
                <span className="text-gray-300">Ô Tô</span>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <button 
          className="bao-gia-btn-primary flex items-center w-full sm:w-auto"
          onClick={onNext}
          disabled={isNextDisabled}
        >
          Tiếp theo: Chọn dịch vụ
          <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
