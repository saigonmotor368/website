import { QuoteService } from '../types';

export const defaultServices = [
  {
    group: "Nhóm 1: Thu hồi đăng ký & biển số",
    services: [
      { id: "s1_mb", name: "Thu hồi đăng ký & biển số (Xe máy)", price: 500000, vehicleType: 'motorbike' },
      { id: "s1_car", name: "Thu hồi đăng ký & biển số (Ô tô)", price: 1500000, vehicleType: 'car' },
    ]
  },
  {
    group: "Nhóm 2: Sang tên đổi chủ",
    services: [
      { id: "s2_same_mb", name: "Sang tên đổi chủ cùng tỉnh (Xe máy)", price: 1500000, vehicleType: 'motorbike' },
      { id: "s2_same_car", name: "Sang tên đổi chủ cùng tỉnh (Ô tô)", price: 4500000, vehicleType: 'car' },
      { id: "s2_diff_mb", name: "Sang tên đổi chủ chuyển tỉnh (Xe máy)", price: 2500000, vehicleType: 'motorbike' },
      { id: "s2_diff_car", name: "Sang tên đổi chủ chuyển tỉnh (Ô tô)", price: 6500000, vehicleType: 'car' },
    ]
  },
  {
    group: "Nhóm 3: Xử lý ca khó",
    services: [
      { id: "s3_mb", name: "Xử lý ca khó – vắng chủ (Xe máy)", price: 5000000, vehicleType: 'motorbike' },
      { id: "s3_car", name: "Xử lý ca khó – vắng chủ (Ô tô)", price: 15000000, vehicleType: 'car' },
    ]
  },
  {
    group: "Nhóm 4: Cấp đổi, cải tạo",
    services: [
      { id: "s4_cavet_mb", name: "Cấp lại cà vẹt (mất/hỏng) (Xe máy)", price: 800000, vehicleType: 'motorbike' },
      { id: "s4_cavet_car", name: "Cấp lại cà vẹt (mất/hỏng) (Ô tô)", price: 2000000, vehicleType: 'car' },
      { id: "s4_yellow_car", name: "Đổi biển vàng (Ô tô)", price: 3500000, vehicleType: 'car' },
    ]
  },
  {
    group: "Nhóm 5: Hiện trường & Khác",
    services: [
      { id: "s5_frame_mb", name: "Cà số khung/máy tận nơi (Xe máy)", price: 300000, vehicleType: 'motorbike' },
      { id: "s5_frame_car", name: "Cà số khung/máy tận nơi (Ô tô)", price: 500000, vehicleType: 'car' },
      { id: "s5_check", name: "Tra cứu phạt nguội + thế chấp", price: 200000, vehicleType: 'all' },
    ]
  }
];

export const getServicesByType = (type: 'motorbike' | 'car' | 'all') => {
  return defaultServices.map(group => ({
    ...group,
    services: group.services.filter(s => s.vehicleType === type || s.vehicleType === 'all' || type === 'all')
  }));
};
