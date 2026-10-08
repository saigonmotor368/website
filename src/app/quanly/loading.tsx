import Image from "next/image";

export default function ManagementLoading() {
  return (
    <main className="quanly-loading" role="status" aria-live="polite">
      <div className="quanly-loading-brand">
        <div className="quanly-loading-logo">
          <Image src="/logo_sgm.png" alt="Saigon Motor" width={112} height={112} priority />
        </div>
        <strong>SAIGON MOTOR</strong>
        <span>Đang mở hệ thống quản lý...</span>
        <i aria-hidden="true" />
      </div>
    </main>
  );
}
