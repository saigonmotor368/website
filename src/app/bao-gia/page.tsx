'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function DashboardPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotes = async () => {
    try {
      const res = await fetch('/api/quotes');
      const data = await res.json();
      setQuotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa báo giá này không?')) return;
    
    try {
      const res = await fetch(`/api/quotes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setQuotes(quotes.filter(q => q.id !== id));
      }
    } catch (err) {
      alert('Không thể xóa báo giá.');
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const calculateTotal = (quote: any) => {
    const subtotal = quote.services.reduce((sum: number, s: any) => sum + (s.price * s.quantity), 0);
    const vat = subtotal * ((quote.vatRate || 0) / 100);
    let total = subtotal + vat;
    if (quote.includeRegistrationFee && quote.vehicle?.estimatedValue) {
      const percent = quote.vehicle.vehicleType === 'car' ? 2 : 1;
      total += quote.vehicle.estimatedValue * (percent / 100);
    }
    return total;
  };

  return (
    <div className="container mx-auto max-w-6xl py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#D4AF37]">Quản lý Báo giá</h1>
          <p className="text-gray-400 mt-2">Lịch sử các báo giá dịch vụ đã được tạo.</p>
        </div>
        <Link 
          href="/bao-gia/create"
          className="bao-gia-btn-primary px-6 py-3 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tạo Báo Giá Mới
        </Link>
      </div>

      <div className="bg-[#1a1d27] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#2a2d3d] text-xs uppercase text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium border-b border-gray-700">Ngày tạo</th>
                <th className="px-6 py-4 font-medium border-b border-gray-700">Mã Báo Giá</th>
                <th className="px-6 py-4 font-medium border-b border-gray-700">Khách hàng</th>
                <th className="px-6 py-4 font-medium border-b border-gray-700">Thông tin xe</th>
                <th className="px-6 py-4 font-medium border-b border-gray-700">Tổng tiền</th>
                <th className="px-6 py-4 font-medium border-b border-gray-700 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Đang tải dữ liệu...</td>
                </tr>
              ) : quotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Chưa có báo giá nào trong hệ thống.</td>
                </tr>
              ) : (
                quotes.map((quote) => (
                  <tr key={quote.id} className="border-b border-gray-800 hover:bg-[#212433] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(quote.createdAt), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-[#D4AF37]">
                      {quote.quoteNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{quote.customer.name}</div>
                      <div className="text-gray-500">{quote.customer.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      {quote.vehicle ? (
                        <>
                          <div className="font-medium text-gray-300">{quote.vehicle.licensePlate}</div>
                          <div className="text-gray-500 text-xs">{quote.vehicle.brand} {quote.vehicle.model}</div>
                        </>
                      ) : (
                        <span className="text-gray-600">Không có xe</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-green-400">
                      {formatMoney(calculateTotal(quote))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        href={`/bao-gia/create?edit=${quote.id}`}
                        className="text-blue-400 hover:text-blue-300 mr-4"
                      >
                        Sửa
                      </Link>
                      <button 
                        onClick={() => handleDelete(quote.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
