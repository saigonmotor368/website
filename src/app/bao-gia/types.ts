// src/app/bao-gia/types.ts

// Thông tin xe trích xuất từ cà vẹt
export interface VehicleInfo {
  ownerName: string;        // Tên chủ xe trên cà vẹt
  licensePlate: string;     // Biển số xe
  frameNumber: string;      // Số khung
  engineNumber: string;     // Số máy
  brand: string;            // Hãng xe (Honda, Yamaha...)
  model: string;            // Model xe
  color: string;            // Màu xe
  yearOfManufacture: number; // Năm sản xuất
  vehicleType: 'motorbike' | 'car'; // Loại xe
  registeredProvince: string; // Tỉnh đăng ký
  originalPrice?: number;   // Giá trị gốc AI tự tra cứu
  estimatedValue?: number;  // Giá trị ước tính sau khấu hao
}

// Thông tin khách hàng
export interface CustomerInfo {
  name: string;
  phone: string;
}

// Dịch vụ trong báo giá
export interface QuoteService {
  id: string;
  name: string;         // Tên dịch vụ
  price: number;        // Đơn giá (có thể điều chỉnh)
  quantity: number;     // Số lượng (mặc định 1)
  note?: string;        // Ghi chú
}

// Hồ sơ cần chuẩn bị
export interface RequiredDocument {
  id: string;
  name: string;         // Tên giấy tờ
  quantity: number;     // Số lượng bản
  note?: string;        // Ghi chú thêm
}

export interface QuoteData {
  id?: string;
  customer: CustomerInfo;
  vehicle: VehicleInfo | null;   // null = trường hợp không có thông tin xe
  services: QuoteService[];
  documents: RequiredDocument[];
  createdAt: Date;
  quoteNumber: string;           // Mã báo giá tự sinh (VD: BG-20260804-001)
  vatRate: number;               // 0, 8, hoặc 10
  includeRegistrationFee?: boolean; // Tính thêm thuế trước bạ tham khảo
}
