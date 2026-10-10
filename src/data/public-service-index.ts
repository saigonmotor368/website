export type ServiceCategoryId = "registration" | "documents" | "violations" | "technical" | "transport";
export type ServiceAudience = "individual" | "business";
export type ServiceVehicle = "car" | "motorbike" | "commercial";

export const serviceCategories = [
  { id: "registration" as const, name: "Đăng ký, sang tên và thu hồi", icon: "01", description: "Hỗ trợ hồ sơ đăng ký lần đầu, chuyển quyền sở hữu, di chuyển xe và thu hồi đăng ký, biển số." },
  { id: "documents" as const, name: "Giấy đăng ký và biển số", icon: "02", description: "Cấp đổi, cấp lại cà vẹt, biển số và cập nhật thông tin của chủ xe hoặc phương tiện." },
  { id: "violations" as const, name: "Phạt nguội và tình trạng pháp lý", icon: "03", description: "Kiểm tra thông tin vi phạm, hướng dẫn chuẩn bị hồ sơ và hỗ trợ xử lý theo tình trạng thực tế." },
  { id: "technical" as const, name: "Đăng kiểm, cải tạo và kỹ thuật", icon: "04", description: "Đăng kiểm, hồ sơ xe cải tạo, cập nhật đăng ký và hỗ trợ số khung, số máy." },
  { id: "transport" as const, name: "Xe kinh doanh vận tải", icon: "05", description: "Hồ sơ giấy phép kinh doanh vận tải, phù hiệu và các thủ tục liên quan đến xe kinh doanh." },
] as const;

export const publicServiceOptions = [
  { slug: "thu-tuc-sang-ten-xe", name: "Sang tên ô tô, xe máy", shortName: "Sang tên xe", category: "registration", featured: true },
  { slug: "thu-tuc-thu-hoi-dang-ky", name: "Thu hồi đăng ký, biển số", shortName: "Thu hồi đăng ký", category: "registration", featured: true },
  { slug: "dang-ky-xe-lan-dau", name: "Đăng ký xe lần đầu", shortName: "Đăng ký xe mới", category: "registration", featured: true },
  { slug: "dang-ky-xe-tam-thoi", name: "Đăng ký xe tạm thời", shortName: "Đăng ký xe tạm", category: "registration", featured: false },
  { slug: "sang-ten-xe-cong-ty", name: "Sang tên xe công ty", shortName: "Sang tên xe doanh nghiệp", category: "registration", featured: true },
  { slug: "sang-ten-xe-qua-nhieu-doi-chu", name: "Sang tên xe qua nhiều đời chủ", shortName: "Xe qua nhiều đời chủ", category: "registration", featured: false },
  { slug: "cap-lai-cavet-xe", name: "Cấp lại cà vẹt xe", shortName: "Cấp lại cà vẹt", category: "documents", featured: true },
  { slug: "cap-doi-cavet-xe", name: "Cấp đổi cà vẹt xe", shortName: "Cấp đổi cà vẹt", category: "documents", featured: false },
  { slug: "cap-lai-bien-so-xe", name: "Cấp lại biển số xe", shortName: "Cấp lại biển số", category: "documents", featured: true },
  { slug: "doi-bien-so-vang", name: "Đổi biển số vàng", shortName: "Đổi biển vàng", category: "documents", featured: true },
  { slug: "doi-thong-tin-dang-ky-xe", name: "Đổi thông tin đăng ký xe", shortName: "Đổi thông tin đăng ký", category: "documents", featured: false },
  { slug: "xu-ly-phat-nguoi", name: "Xử lý phạt nguội", shortName: "Xử lý phạt nguội", category: "violations", featured: true },
  { slug: "dang-kiem-xe-o-to", name: "Đăng kiểm xe ô tô", shortName: "Đăng kiểm ô tô", category: "technical", featured: true },
  { slug: "ho-so-cai-tao-xe", name: "Hồ sơ cải tạo xe", shortName: "Hồ sơ cải tạo", category: "technical", featured: false },
  { slug: "doi-cavet-xe-cai-tao", name: "Đổi cà vẹt xe cải tạo", shortName: "Đổi cà vẹt xe cải tạo", category: "technical", featured: false },
  { slug: "ca-so-khung-so-may", name: "Cà số khung, số máy", shortName: "Cà số khung, số máy", category: "technical", featured: false },
  { slug: "phu-hieu-xe-kinh-doanh-van-tai", name: "Phù hiệu xe kinh doanh vận tải", shortName: "Cấp phù hiệu xe", category: "transport", featured: true },
  { slug: "giay-phep-kinh-doanh-van-tai", name: "Giấy phép kinh doanh vận tải", shortName: "Giấy phép vận tải", category: "transport", featured: false },
] as const satisfies ReadonlyArray<{ slug: string; name: string; shortName: string; category: ServiceCategoryId; featured: boolean }>;

export const publicServiceSlugs = new Set<string>(publicServiceOptions.map((service) => service.slug));

export function getPublicServiceOption(slug: string) {
  return publicServiceOptions.find((service) => service.slug === slug);
}

export function getServiceLabel(slug: string) {
  return getPublicServiceOption(slug)?.name || "Hồ sơ khác";
}
