'use client';

interface StepIndicatorProps {
  currentStep: number;
}

const steps = [
  "Thông tin KH & Xe",
  "Chọn Dịch vụ",
  "Hồ sơ cần chuẩn bị",
  "Preview",
  "Xuất PDF"
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        {/* Line in the background */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-800 z-0"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#D4AF37] z-0 transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {/* Steps */}
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;

          return (
            <div key={index} className="relative z-10 flex flex-col items-center gap-2">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                  isActive 
                    ? "bg-[#D4AF37] text-gray-900 border-4 border-[#1a1d27]" 
                    : isCompleted
                      ? "bg-[#D4AF37] text-gray-900"
                      : "bg-gray-800 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNumber
                )}
              </div>
              <span className={`text-[10px] sm:text-xs font-medium w-[60px] sm:w-[80px] text-center hidden sm:block ${
                isActive ? "text-[#D4AF37]" : isCompleted ? "text-gray-300" : "text-gray-500"
              }`}>
                {step}
              </span>
              <span className={`text-[10px] font-medium w-[60px] text-center sm:hidden ${
                isActive ? "text-[#D4AF37]" : "hidden"
              }`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
