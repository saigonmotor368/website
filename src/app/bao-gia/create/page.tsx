'use client';
import { useState, useEffect, Suspense } from 'react';
import { QuoteData } from '../types';
import StepIndicator from '../components/StepIndicator';
import Step1_CustomerVehicle from '../components/Step1_CustomerVehicle';
import Step2_Services from '../components/Step2_Services';
import Step3_Documents from '../components/Step3_Documents';
import Step4_Preview from '../components/Step4_Preview';
import Step5_Export from '../components/Step5_Export';
import { format } from 'date-fns';
import { useSearchParams } from 'next/navigation';

const initialQuoteData: QuoteData = {
  customer: { name: '', phone: '' },
  vehicle: null,
  services: [],
  documents: [],
  createdAt: new Date(),
  quoteNumber: `BG-${format(new Date(), 'yyyyMMdd')}-${Math.floor(1000 + Math.random() * 9000)}`,
  vatRate: 0,
  includeRegistrationFee: false
};

function BaoGiaWizardContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const [currentStep, setCurrentStep] = useState(1);
  const [quoteData, setQuoteData] = useState<QuoteData>(initialQuoteData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (editId) {
      fetch('/api/quotes')
        .then(res => res.json())
        .then(data => {
          const q = data.find((item: any) => item.id === editId);
          if (q) setQuoteData(q);
          setIsLoaded(true);
        })
        .catch(() => setIsLoaded(true));
    } else {
      setIsLoaded(true);
    }
  }, [editId]);

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleReset = () => {
    window.location.href = '/bao-gia/create';
  };

  if (!isLoaded) return <div className="p-12 text-center text-gray-500">Đang tải dữ liệu báo giá...</div>;

  return (
    <div className="pb-24">
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center px-4 md:px-0">
        <button 
          onClick={() => window.location.href = '/bao-gia'}
          className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors text-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại Quản lý
        </button>
        {editId && (
          <div className="bg-[#D4AF37]/20 text-[#D4AF37] px-3 py-1 rounded-full text-sm font-medium border border-[#D4AF37]/30">
            Chế độ chỉnh sửa
          </div>
        )}
      </div>
      
      <StepIndicator currentStep={currentStep} />
      
      <div className="mt-8">
        {currentStep === 1 && (
          <Step1_CustomerVehicle quoteData={quoteData} setQuoteData={setQuoteData} onNext={handleNext} />
        )}
        {currentStep === 2 && (
          <Step2_Services quoteData={quoteData} setQuoteData={setQuoteData} onNext={handleNext} onPrev={handlePrev} />
        )}
        {currentStep === 3 && (
          <Step3_Documents quoteData={quoteData} setQuoteData={setQuoteData} onNext={handleNext} onPrev={handlePrev} />
        )}
        {currentStep === 4 && (
          <>
            <Step4_Preview quoteData={quoteData} onNext={handleNext} onPrev={handlePrev} />
            {/* The preview needs to be available in DOM for Step 5 to render it, 
                so we conditionally hide it or just keep it rendered but invisible.
                But actually, html2canvas needs the element to be visible in the DOM.
                A trick is to render Step4 inside Step5 but hidden, or render both and control visibility with CSS.
                Let's restructure slightly: We render Step4 ALWAYS when currentStep >= 4, but hide it visually in step 5 if needed. 
                Wait, if Step4 has the export button, maybe we don't need Step5 to re-render it. 
                Let's use a wrapper that hides Step4 if step === 5 but keeps it mounted.
             */}
          </>
        )}
        {currentStep === 5 && (
          <Step5_Export quoteData={quoteData} onReset={handleReset} />
        )}

        {/* Hidden preview container for html2canvas to capture in Step 5 */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          {currentStep === 5 && (
            <div className="pointer-events-none">
              <Step4_Preview quoteData={quoteData} onNext={() => {}} onPrev={() => {}} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BaoGiaWizard() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-500">Đang tải...</div>}>
      <BaoGiaWizardContent />
    </Suspense>
  );
}
