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
        <strong style={{ color: "#f59e0b" }}>Xin quý khách lưu ý:</strong> Saigon Motor là đơn vị dịch vụ tư nhân thuộc{" "}
        <strong style={{ color: "#fff" }}>Công ty TNHH Ô tô Xe máy 368</strong> (MST: 0316339254),{" "}
        <strong>không phải cơ quan nhà nước</strong>. Chúng tôi hỗ trợ quý khách chuẩn bị, rà soát hồ sơ xe và thay mặt quý
        khách thực hiện những phần việc được ủy quyền. Quý khách vẫn có thể tự thực hiện thủ tục trực tiếp tại cơ quan có
        thẩm quyền.
      </div>
    </aside>
  );
}
