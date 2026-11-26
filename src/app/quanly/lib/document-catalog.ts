export interface StandardDocumentCatalogItem {
  id: string;
  name: string;
  defaultNote: string;
  defaultQuantity: number;
}

export const CUSTOM_DOCUMENT_OPTION = "__custom__";

export const STANDARD_DOCUMENT_CATALOG: StandardDocumentCatalogItem[] = [
  {
    id: "doc_cat_cavet",
    name: "Giấy đăng ký xe (Cà-vẹt bản gốc)",
    defaultNote: "Bản chính",
    defaultQuantity: 1,
  },
  {
    id: "doc_cat_cccd_owner",
    name: "CCCD gắn chip của chủ xe",
    defaultNote: "Bản chính / bản sao công chứng",
    defaultQuantity: 1,
  },
  {
    id: "doc_cat_cccd_both",
    name: "CCCD gắn chip của chủ cũ & chủ mới",
    defaultNote: "Đối chiếu bản chính / công chứng",
    defaultQuantity: 2,
  },
  {
    id: "doc_cat_hdmb",
    name: "Hợp đồng mua bán / Chuyển nhượng xe công chứng",
    defaultNote: "Đã công chứng hợp lệ",
    defaultQuantity: 2,
  },
  {
    id: "doc_cat_hduq",
    name: "Hợp đồng ủy quyền công chứng",
    defaultNote: "Bản chính công chứng",
    defaultQuantity: 1,
  },
  {
    id: "doc_cat_thuhoi",
    name: "Giấy chứng nhận thu hồi đăng ký, biển số xe",
    defaultNote: "Bản gốc cơ quan công an cấp",
    defaultQuantity: 1,
  },
  {
    id: "doc_cat_bienso",
    name: "Biển số xe cũ (2 biển / 1 biển thu hồi)",
    defaultNote: "Bàn giao để làm thủ tục thu hồi",
    defaultQuantity: 1,
  },
  {
    id: "doc_cat_casokhung",
    name: "Bản cà số khung, số máy",
    defaultNote: "02 bộ rõ nét",
    defaultQuantity: 2,
  },
  {
    id: "doc_cat_tokhai",
    name: "Tờ khai đăng ký xe",
    defaultNote: "Ký tên / đóng dấu theo mẫu",
    defaultQuantity: 1,
  },
  {
    id: "doc_cat_truocba",
    name: "Chứng từ nộp lệ phí trước bạ",
    defaultNote: "Biên lai hoặc mã hồ sơ thuế",
    defaultQuantity: 1,
  },
  {
    id: "doc_cat_dangkiem",
    name: "Sổ đăng kiểm xe cơ giới (Ô tô)",
    defaultNote: "Bản chính còn hiệu lực",
    defaultQuantity: 1,
  },
  {
    id: "doc_cat_baohiem",
    name: "Giấy chứng nhận bảo hiểm TNDS bắt buộc",
    defaultNote: "Còn thời hạn",
    defaultQuantity: 1,
  },
  {
    id: "doc_cat_hoadon",
    name: "Hóa đơn GTGT mua bán xe",
    defaultNote: "Bản in hóa đơn điện tử",
    defaultQuantity: 1,
  },
  {
    id: "doc_cat_doanhnghiep",
    name: "Giấy ĐKKD + Giấy giới thiệu & Con dấu (Doanh nghiệp)",
    defaultNote: "Bản sao y / đóng dấu mộc",
    defaultQuantity: 1,
  },
  {
    id: "doc_cat_giaichap",
    name: "Giấy giải chấp ngân hàng / Xóa thế chấp",
    defaultNote: "Bản chính ngân hàng cấp",
    defaultQuantity: 1,
  },
  {
    id: "doc_cat_honnhan",
    name: "Giấy xác nhận tình trạng hôn nhân / Đăng ký kết hôn",
    defaultNote: "Phục vụ công chứng hợp đồng",
    defaultQuantity: 1,
  },
];
