import Image from "next/image";

export default function ManagementLoading() {
  return (
    <div className="quanly-loading" role="status" aria-live="polite">
      <div className="quanly-loading-brand">
        <div className="quanly-loading-logo">
          <Image src="/logo_sgm_gold.png" alt="Saigon Motor" width={104} height={104} priority />
        </div>
        <strong>SAIGON MOTOR</strong>
        <span>Đang tải hệ thống quản lý...</span>
        <i aria-hidden="true" />
      </div>
    </div>
  );
}
