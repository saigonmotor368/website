"use client";

import { useEffect, useState } from "react";

interface Customer {
  id: string;
  type: "individual" | "company";
  name: string;
  company_name?: string | null;
  phone: string;
  zalo_name?: string | null;
  email?: string | null;
  tax_id?: string | null;
  address?: string | null;
  notes?: string | null;
  created_at?: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    type: "individual" as "individual" | "company",
    name: "",
    company_name: "",
    phone: "",
    zalo_name: "",
    email: "",
    tax_id: "",
    address: "",
    notes: "",
  });

  const fetchCustomers = async (query = "") => {
    setLoading(true);
    try {
      const url = query
        ? `/api/internal/customers?q=${encodeURIComponent(query)}`
        : "/api/internal/customers";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCustomers(data || []);
      }
    } catch (err) {
      console.error("Lỗi tải khách hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchCustomers(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Vui lòng điền họ tên và số điện thoại.");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/internal/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setModalOpen(false);
        setFormData({
          type: "individual",
          name: "",
          company_name: "",
          phone: "",
          zalo_name: "",
          email: "",
          tax_id: "",
          address: "",
          notes: "",
        });
        void fetchCustomers(searchTerm);
      } else {
        const err = await res.json();
        alert(err.error || "Không thể tạo khách hàng.");
      }
    } catch {
      alert("Lỗi kết nối.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý Khách hàng</h1>
          <p className="text-gray-400 text-sm mt-1">
            Danh sách khách hàng cá nhân, doanh nghiệp và thông tin liên hệ Zalo/MST.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="quanly-btn-gold"
        >
          <span>+ Thêm Khách Hàng</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="quanly-card p-3 flex items-center gap-3">
        <span className="text-gray-400 pl-2">🔍</span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo tên, SĐT, tên Zalo, tên công ty, mã số thuế..."
          className="bg-transparent w-full text-sm text-gray-200 placeholder-gray-500 focus:outline-none"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="text-gray-500 hover:text-white text-xs pr-2"
          >
            ✕ Xóa
          </button>
        )}
      </div>

      {/* Customers List */}
      <div className="quanly-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="text-xs uppercase text-gray-500 bg-black/30 border-b border-gray-800">
              <tr>
                <th className="px-5 py-3.5">Khách hàng</th>
                <th className="px-5 py-3.5">Số điện thoại / Zalo</th>
                <th className="px-5 py-3.5">Loại khách</th>
                <th className="px-5 py-3.5">Doanh nghiệp / MST</th>
                <th className="px-5 py-3.5">Địa chỉ</th>
                <th className="px-5 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    Đang tìm kiếm khách hàng...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    Không tìm thấy khách hàng nào.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-4">
                      <div className="font-bold text-white">{c.name}</div>
                      {c.notes && (
                        <div className="text-xs text-gray-500 truncate max-w-xs">
                          {c.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={`tel:${c.phone}`}
                        className="font-mono text-[#d4af37] font-semibold hover:underline block"
                      >
                        {c.phone}
                      </a>
                      {c.zalo_name && (
                        <div className="text-xs text-gray-400">
                          Zalo: <span className="text-blue-400">{c.zalo_name}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs">
                      <span
                        className={`px-2 py-0.5 rounded-full ${
                          c.type === "company"
                            ? "bg-purple-950/60 text-purple-300 border border-purple-800/40"
                            : "bg-teal-950/60 text-teal-300 border border-teal-800/40"
                        }`}
                      >
                        {c.type === "company" ? "Doanh nghiệp" : "Cá nhân"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs">
                      {c.company_name ? (
                        <>
                          <div className="font-semibold text-gray-200">
                            {c.company_name}
                          </div>
                          {c.tax_id && (
                            <div className="font-mono text-gray-400">
                              MST: {c.tax_id}
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400 max-w-xs truncate">
                      {c.address || "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <a
                        href={`/quanly/quotes/create?phone=${encodeURIComponent(c.phone)}`}
                        className="text-xs text-amber-400 hover:underline mr-3"
                      >
                        Tạo báo giá
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Customer */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141923] border border-gray-700 rounded-xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
              <h2 className="text-lg font-bold text-[#d4af37]">Thêm khách hàng mới</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                  <input
                    type="radio"
                    name="type"
                    checked={formData.type === "individual"}
                    onChange={() => setFormData({ ...formData, type: "individual" })}
                  />
                  <span>Khách hàng cá nhân</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                  <input
                    type="radio"
                    name="type"
                    checked={formData.type === "company"}
                    onChange={() => setFormData({ ...formData, type: "company" })}
                  />
                  <span>Khách hàng doanh nghiệp</span>
                </label>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">
                  {formData.type === "company" ? "Họ tên người liên hệ *" : "Họ và tên khách hàng *"}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0d1017] border border-gray-700 rounded-lg p-2.5 text-gray-200 focus:outline-none focus:border-[#d4af37]"
                  placeholder="Ví dụ: Nguyễn Văn A"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#0d1017] border border-gray-700 rounded-lg p-2.5 text-gray-200 font-mono focus:outline-none focus:border-[#d4af37]"
                    placeholder="0901234567"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-medium">Tên Zalo (nếu có)</label>
                  <input
                    type="text"
                    value={formData.zalo_name}
                    onChange={(e) => setFormData({ ...formData, zalo_name: e.target.value })}
                    className="w-full bg-[#0d1017] border border-gray-700 rounded-lg p-2.5 text-gray-200 focus:outline-none focus:border-[#d4af37]"
                    placeholder="Tên Zalo khách hàng"
                  />
                </div>
              </div>

              {formData.type === "company" && (
                <div className="space-y-3 pt-2 border-t border-gray-800">
                  <div>
                    <label className="block text-gray-400 mb-1 font-medium">Tên công ty / Doanh nghiệp</label>
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      className="w-full bg-[#0d1017] border border-gray-700 rounded-lg p-2.5 text-gray-200 focus:outline-none focus:border-[#d4af37]"
                      placeholder="Công ty TNHH..."
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1 font-medium">Mã số thuế (MST)</label>
                    <input
                      type="text"
                      value={formData.tax_id}
                      onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                      className="w-full bg-[#0d1017] border border-gray-700 rounded-lg p-2.5 text-gray-200 font-mono focus:outline-none focus:border-[#d4af37]"
                      placeholder="0301234567"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Địa chỉ</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-[#0d1017] border border-gray-700 rounded-lg p-2.5 text-gray-200 focus:outline-none focus:border-[#d4af37]"
                  placeholder="Số nhà, đường, phường, quận/huyện..."
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-medium">Ghi chú thêm</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#0d1017] border border-gray-700 rounded-lg p-2.5 text-gray-200 focus:outline-none focus:border-[#d4af37]"
                  placeholder="Ghi chú sở thích, nhu cầu, thời gian tiện liên hệ..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="quanly-btn-gold"
                >
                  {creating ? "Đang lưu..." : "Lưu khách hàng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
