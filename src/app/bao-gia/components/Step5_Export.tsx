'use client';
import { useState, useEffect, useRef } from 'react';
import { QuoteData } from '../types';
import { generatePDF } from '../utils/generatePDF';

interface Step5Props {
  quoteData: QuoteData;
  onReset: () => void;
}

export default function Step5_Export({ quoteData, onReset }: Step5Props) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('Đang tự động lưu báo giá...');

  const hasSaved = useRef(false);

  useEffect(() => {
    if (hasSaved.current) return;
    hasSaved.current = true;

    const saveQuote = async () => {
      try {
        const method = quoteData.id ? 'PUT' : 'POST';
        const url = quoteData.id ? `/api/quotes/${quoteData.id}` : '/api/quotes';
        
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(quoteData)
        });
        
        if (res.ok) {
          const result = await res.json();
          // Cập nhật lại id cho quoteData nếu là POST mới
          if (!quoteData.id && result.data?.id) {
            quoteData.id = result.data.id;
          }
          setSaveStatus('✅ Đã tự động lưu vào Lịch sử báo giá.');
        } else {
          setSaveStatus('❌ Lỗi: Không thể lưu báo giá tự động.');
        }
      } catch (err) {
        setSaveStatus('❌ Lỗi: Không thể kết nối máy chủ.');
      }
    };

    saveQuote();
  }, [quoteData]);

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    
    const normalizedName = quoteData.customer.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/_$/, '');
      
    let filename = `BaoGia_${normalizedName}`;
    if (quoteData.vehicle?.licensePlate) {
      const safePlate = quoteData.vehicle.licensePlate.replace(/[^a-zA-Z0-9-]/g, '');
      filename += `_${safePlate}`;
    } else {
      filename += `_${quoteData.quoteNumber}`;
    }
    filename += '.pdf';
    
    const success = await generatePDF('quote-preview', filename);
    
    setIsExporting(false);
    if (success) {
      setExportSuccess(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in zoom-in duration-500">
      <div className="bao-gia-card text-center py-12 px-8">
        
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-500/30">
          <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-3xl font-bold text-white mb-2">Báo giá đã sẵn sàng!</h2>
        <p className="text-gray-400 mb-8">Mã báo giá: <span className="font-mono text-[#D4AF37]">{quoteData.quoteNumber}</span></p>

        <div className="bg-[#212433] rounded-xl p-6 mb-8 text-left border border-gray-800 inline-block w-full max-w-md">
          <p className="text-sm text-gray-400 mb-2">Tóm tắt:</p>
          <p className="font-medium text-white mb-1">Khách hàng: <span className="text-[#D4AF37]">{quoteData.customer.name}</span></p>
          <p className="font-medium text-white mb-1">Dịch vụ: <span className="text-[#D4AF37]">{quoteData.services.length} mục</span></p>
          <p className="font-medium text-white text-lg mt-3 pt-3 border-t border-gray-700">Tổng tiền: <span className="text-green-400 font-bold">{
            new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
              .format(quoteData.services.reduce((sum, s) => sum + (s.price * s.quantity), 0))
          }</span></p>
        </div>

        <div className="flex flex-col gap-4 w-full sm:max-w-sm mx-auto">
          {saveStatus && (
            <p className={`text-sm font-medium text-center mb-4 ${saveStatus.includes('✅') ? 'text-green-400' : 'text-gray-400'}`}>
              {saveStatus}
            </p>
          )}

          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="bao-gia-btn-primary flex items-center justify-center gap-2 py-4 text-base sm:text-lg shadow-[0_0_20px_rgba(212,175,55,0.3)] w-full"
          >
            {isExporting ? (
              <>
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                Đang tạo PDF...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Tải xuống File PDF
              </>
            )}
          </button>
          
          {exportSuccess && (
            <p className="text-green-400 text-sm font-medium">✅ Đã tải file PDF thành công!</p>
          )}

          <button 
            onClick={onReset}
            className="bao-gia-btn-secondary mt-2 w-full"
          >
            Tạo Báo Giá Mới
          </button>
        </div>
      </div>
    </div>
  );
}
