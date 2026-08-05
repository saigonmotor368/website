import { RequiredDocument } from '../types';

export const getDocumentsByServiceId = (serviceId: string): RequiredDocument[] => {
  if (serviceId.startsWith('s1')) {
    return [
      { id: Date.now().toString() + '1', name: 'Cà vẹt gốc', quantity: 1 },
      { id: Date.now().toString() + '2', name: 'Biển số xe', quantity: 1, note: 'Tháo cả biển trước và sau nếu là ô tô' },
      { id: Date.now().toString() + '3', name: 'Hợp đồng mua bán / Cho tặng', quantity: 1, note: 'Đã công chứng' },
      { id: Date.now().toString() + '4', name: 'CCCD chủ xe', quantity: 1 },
    ];
  }

  if (serviceId.startsWith('s2')) {
    return [
      { id: Date.now().toString() + '1', name: 'Giấy thu hồi đăng ký biển số', quantity: 1 },
      { id: Date.now().toString() + '2', name: 'Hợp đồng mua bán', quantity: 1, note: 'Đã công chứng' },
      { id: Date.now().toString() + '3', name: 'Biên lai nộp lệ phí trước bạ', quantity: 1 },
      { id: Date.now().toString() + '4', name: 'CCCD người mua', quantity: 1 },
    ];
  }
  
  if (serviceId.startsWith('s3')) {
    return [
      { id: Date.now().toString() + '1', name: 'Cà vẹt gốc', quantity: 1 },
      { id: Date.now().toString() + '2', name: 'Biển số xe', quantity: 1 },
      { id: Date.now().toString() + '3', name: 'Giấy tờ mua bán viết tay', quantity: 1, note: 'Của người bán cuối cùng' },
      { id: Date.now().toString() + '4', name: 'Giấy cam kết chịu trách nhiệm', quantity: 1, note: 'Ký theo mẫu' },
    ];
  }

  if (serviceId.startsWith('s4_cavet')) {
    return [
      { id: Date.now().toString() + '1', name: 'Đơn trình báo mất', quantity: 1, note: 'Có xác nhận của công an phường/xã' },
      { id: Date.now().toString() + '2', name: 'CCCD chủ xe', quantity: 1 },
    ];
  }

  if (serviceId.startsWith('s4_yellow')) {
    return [
      { id: Date.now().toString() + '1', name: 'Cà vẹt gốc', quantity: 1 },
      { id: Date.now().toString() + '2', name: 'Biển số xe cũ', quantity: 1 },
      { id: Date.now().toString() + '3', name: 'Giấy phép kinh doanh vận tải', quantity: 1 },
    ];
  }

  return [];
};
