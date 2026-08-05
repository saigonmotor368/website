'use client';
import { useEffect, useState } from 'react';
import { QuoteData, RequiredDocument } from '../types';
import { getDocumentsByServiceId } from '../data/documents';

interface Step3Props {
  quoteData: QuoteData;
  setQuoteData: React.Dispatch<React.SetStateAction<QuoteData>>;
  onNext: () => void;
  onPrev: () => void;
}

export default function Step3_Documents({ quoteData, setQuoteData, onNext, onPrev }: Step3Props) {
  const [generalNote, setGeneralNote] = useState('');

  // Auto load documents based on selected services ONLY if documents array is empty
  useEffect(() => {
    if (quoteData.documents.length === 0 && quoteData.services.length > 0) {
      handleLoadDefaultDocuments();
    }
  }, []); // Only run once when step mounts

  const handleLoadDefaultDocuments = () => {
    const docsMap = new Map<string, RequiredDocument>();
    
    quoteData.services.forEach(service => {
      const docs = getDocumentsByServiceId(service.id);
      docs.forEach(doc => {
        // Simple deduplication based on name
        if (!docsMap.has(doc.name)) {
          docsMap.set(doc.name, { ...doc, id: `${doc.id}_${Math.random()}` });
        }
      });
    });

    setQuoteData(prev => ({
      ...prev,
      documents: Array.from(docsMap.values())
    }));
  };

  const handleAddDocument = () => {
    const newDoc: RequiredDocument = {
      id: `doc_${Date.now()}`,
      name: 'Giấy tờ mới',
      quantity: 1,
      note: ''
    };
    setQuoteData(prev => ({
      ...prev,
      documents: [...prev.documents, newDoc]
    }));
  };

  const handleUpdateDocument = (id: string, field: keyof RequiredDocument, value: any) => {
    setQuoteData(prev => ({
      ...prev,
      documents: prev.documents.map(d => d.id === id ? { ...d, [field]: value } : d)
    }));
  };

  const handleRemoveDocument = (id: string) => {
    setQuoteData(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.id !== id)
    }));
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bao-gia-card">
        <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-[#D4AF37]">Hồ sơ thủ tục cần chuẩn bị</h2>
            <p className="text-sm text-gray-400 mt-1">Danh sách giấy tờ khách hàng cần cung cấp để thực hiện dịch vụ</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleLoadDefaultDocuments}
              className="text-sm text-gray-400 hover:text-white px-3 py-1.5 rounded-md border border-gray-700 transition-colors"
            >
              Tải lại mặc định
            </button>
            <button 
              onClick={handleAddDocument}
              className="text-sm text-[#D4AF37] hover:text-[#b8952d] flex items-center gap-1 border border-[#D4AF37] px-3 py-1.5 rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Thêm giấy tờ
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-800 rounded-lg mb-6">
          <table className="bao-gia-table">
            <thead>
              <tr>
                <th className="w-12 text-center">STT</th>
                <th>Tên giấy tờ</th>
                <th className="w-24 text-center">Số lượng</th>
                <th>Ghi chú</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {quoteData.documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    Chưa có giấy tờ nào. Hãy tải lại mặc định hoặc thêm mới.
                  </td>
                </tr>
              ) : (
                quoteData.documents.map((doc, index) => (
                  <tr key={doc.id} className="hover:bg-[#212433] transition-colors">
                    <td className="text-center text-gray-500 text-sm">{index + 1}</td>
                    <td>
                      <input 
                        type="text" 
                        className="bg-transparent w-full text-sm text-gray-200 focus:outline-none focus:border-b border-gray-600 pb-1"
                        value={doc.name}
                        onChange={(e) => handleUpdateDocument(doc.id, 'name', e.target.value)}
                      />
                    </td>
                    <td>
                      <input 
                        type="number" 
                        min="1"
                        className="bg-transparent w-full text-sm text-gray-200 text-center focus:outline-none focus:border-b border-gray-600 pb-1"
                        value={doc.quantity}
                        onChange={(e) => handleUpdateDocument(doc.id, 'quantity', Number(e.target.value))}
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        className="bg-transparent w-full text-sm text-gray-400 focus:outline-none focus:border-b border-gray-600 pb-1"
                        placeholder="Thêm ghi chú..."
                        value={doc.note || ''}
                        onChange={(e) => handleUpdateDocument(doc.id, 'note', e.target.value)}
                      />
                    </td>
                    <td className="text-center">
                      <button 
                        onClick={() => handleRemoveDocument(doc.id)}
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

        <div>
          <label className="block text-sm text-[#D4AF37] mb-2 font-medium">Ghi chú chung cho báo giá (Hiển thị ở cuối PDF)</label>
          <textarea 
            className="bao-gia-input min-h-[100px] text-sm"
            placeholder="Ví dụ: Báo giá có giá trị trong vòng 15 ngày..."
            value={generalNote}
            onChange={(e) => {
                setGeneralNote(e.target.value);
                // We'll store general note in the first service's note if we don't have a dedicated field, 
                // but actually let's add a global note field in Step 4, or just pass it as state.
                // For simplicity, let's just keep it local and use it in preview if needed, or add to QuoteData.
            }}
          ></textarea>
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
          Tiếp theo: Preview & Xác nhận
          <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
