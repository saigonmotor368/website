export default function PolicyDisclaimerBanner() {
  return (
    <aside
      aria-label="Thông báo pháp lý"
      style={{
        background: "#0b1320",
        borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
        color: "rgba(255, 255, 255, 0.8)",
        fontSize: "12px",
        lineHeight: "1.5",
        padding: "7px 16px",
        textAlign: "center",
        position: "relative",
        zIndex: 60,
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <strong style={{ color: "#f59e0b" }}>Thông báo minh bạch:</strong> Saigon Motor là dịch vụ tư nhân thuộc{" "}
        <strong style={{ color: "#fff" }}>Công ty TNHH Ô tô Xe máy 368</strong> (MST: 0316339254), hỗ trợ chuẩn bị và rà
        soát hồ sơ xe theo ủy quyền. Chúng tôi <strong>không phải cơ quan đăng ký xe của nhà nước</strong>. Khách hàng
        có thể tự thực hiện thủ tục trực tiếp tại cơ quan có thẩm quyền.
      </div>
    </aside>
  );
}
