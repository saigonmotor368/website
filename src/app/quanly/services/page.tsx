"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

interface ServiceItem {
  id: string;
  code: string;
  group_name: string;
  name: string;
  vehicle_type: "car" | "motorbike" | "all";
  cost_price: number;
  suggested_price: number;
  sort_order: number;
  isFallback?: boolean;
}

const emptyForm: Omit<ServiceItem, "id"> = {
  code: "",
  group_name: "",
  name: "",
  vehicle_type: "all",
  cost_price: 0,
  suggested_price: 0,
  sort_order: 0,
};

const money = (amount: number) => new Intl.NumberFormat("vi-VN").format(amount || 0) + " ₫";

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [search, setSearch] = useState("");
  const [canManage, setCanManage] = useState(false);
  const [warning, setWarning] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadServices = useCallback(async () => {
    try {
      const response = await fetch("/api/internal/service-catalog", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không thể tải danh mục dịch vụ.");
      setServices(data.services || []);
      setCanManage(!!data.canManage);
      setWarning(data.warning || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh mục dịch vụ.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadServices(), 0);
    return () => window.clearTimeout(timer);
  }, [loadServices]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return services.filter((service) => {
      const matchesType = filterType === "all" || service.vehicle_type === filterType || service.vehicle_type === "all";
      const matchesSearch = !term || `${service.code} ${service.name} ${service.group_name}`.toLowerCase().includes(term);
      return matchesType && matchesSearch;
    });
  }, [services, filterType, search]);

  const groups = useMemo(() => {
    return filtered.reduce<Record<string, ServiceItem[]>>((result, service) => {
      (result[service.group_name] ||= []).push(service);
      return result;
    }, {});
  }, [filtered]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, sort_order: services.length + 1 });
    setError("");
    setShowForm(true);
  };

  const openEdit = (service: ServiceItem) => {
    if (service.isFallback) {
      setError("Cần chạy migration danh mục trước khi chỉnh sửa dữ liệu mẫu.");
      return;
    }
    setEditingId(service.id);
    setForm({
      code: service.code,
      group_name: service.group_name,
      name: service.name,
      vehicle_type: service.vehicle_type,
      cost_price: service.cost_price || 0,
      suggested_price: service.suggested_price || 0,
      sort_order: service.sort_order || 0,
    });
    setError("");
    setShowForm(true);
  };

  async function saveService(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/internal/service-catalog", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editingId || undefined }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Không thể lưu dịch vụ.");
      setShowForm(false);
      await loadServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu dịch vụ.");
    } finally {
      setSaving(false);
    }
  }

  async function archiveService(service: ServiceItem) {
    if (service.isFallback || !window.confirm(`Xóa dịch vụ “${service.name}”?\n\nDịch vụ sẽ ngừng xuất hiện trong báo giá mới, dữ liệu báo giá cũ vẫn được giữ nguyên.`)) return;
    setError("");
    const response = await fetch(`/api/internal/service-catalog?id=${encodeURIComponent(service.id)}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Không thể xóa dịch vụ.");
      return;
    }
    await loadServices();
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#d4af37] font-bold mb-2">Thiết lập nghiệp vụ</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Danh mục dịch vụ chuẩn</h1>
          <p className="text-gray-400 text-sm mt-2 max-w-2xl">Quản lý giá vốn nội bộ, giá bán đề xuất và nhóm dịch vụ dùng chung cho toàn bộ hệ thống báo giá.</p>
        </div>
        {canManage && (
          <button type="button" onClick={openCreate} className="quanly-btn-gold">＋ Thêm dịch vụ</button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="quanly-kpi-card"><span className="text-xs text-gray-500">Dịch vụ đang dùng</span><strong className="text-2xl text-white mt-2">{services.length}</strong></div>
        <div className="quanly-kpi-card"><span className="text-xs text-gray-500">Nhóm dịch vụ</span><strong className="text-2xl text-white mt-2">{new Set(services.map((s) => s.group_name)).size}</strong></div>
        <div className="quanly-kpi-card"><span className="text-xs text-gray-500">Giá bán bình quân</span><strong className="text-lg text-emerald-400 mt-2">{money(services.length ? Math.round(services.reduce((sum, s) => sum + s.suggested_price, 0) / services.length) : 0)}</strong></div>
        <div className="quanly-kpi-card"><span className="text-xs text-gray-500">Quyền chỉnh sửa</span><strong className="text-base text-[#d4af37] mt-2">{canManage ? "Chủ hệ thống" : "Chỉ xem"}</strong></div>
      </div>

      {warning && <div className="rounded-xl border border-amber-700/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">{warning}</div>}
      {error && <div role="alert" className="rounded-xl border border-red-700/50 bg-red-950/30 px-4 py-3 text-sm text-red-200">{error}</div>}

      <div className="quanly-card flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">⌕</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên, mã hoặc nhóm dịch vụ..." className="w-full bg-[#0d1017] border border-gray-700 rounded-xl pl-9 pr-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#d4af37]" />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="bg-[#0d1017] border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-[#d4af37]">
          <option value="all">Tất cả phương tiện</option><option value="car">Ô tô</option><option value="motorbike">Xe máy</option>
        </select>
      </div>

      {loading ? (
        <div className="quanly-card text-center py-14 text-gray-500">Đang tải danh mục dịch vụ...</div>
      ) : Object.keys(groups).length === 0 ? (
        <div className="quanly-card text-center py-14 text-gray-500">Không tìm thấy dịch vụ phù hợp.</div>
      ) : (
        <div className="space-y-5">
          {Object.entries(groups).map(([groupName, items]) => (
            <section key={groupName} className="quanly-card p-0 overflow-hidden">
              <div className="px-4 sm:px-5 py-4 border-b border-white/5 bg-white/[0.015] flex items-center justify-between gap-3">
                <div><h2 className="text-sm font-bold text-[#e8c766]">{groupName}</h2><p className="text-[11px] text-gray-500 mt-1">{items.length} dịch vụ</p></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-left text-sm text-gray-300">
                  <thead className="text-[11px] uppercase tracking-wider text-gray-500 bg-black/20">
                    <tr><th className="px-4 py-3">Dịch vụ</th><th className="px-4 py-3">Loại xe</th><th className="px-4 py-3 text-right">Giá vốn</th><th className="px-4 py-3 text-right">Giá khách</th><th className="px-4 py-3 text-right">Lãi dự kiến</th>{canManage && <th className="px-4 py-3 text-right">Thao tác</th>}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/70">
                    {items.map((service) => {
                      const profit = service.suggested_price - (service.cost_price || 0);
                      return (
                        <tr key={service.id} className="hover:bg-white/[0.025] transition-colors">
                          <td className="px-4 py-4"><div className="font-semibold text-white">{service.name}</div><div className="font-mono text-[11px] text-gray-500 mt-1">{service.code}</div></td>
                          <td className="px-4 py-4"><span className="rounded-full border border-gray-700 bg-gray-900 px-2.5 py-1 text-[11px]">{service.vehicle_type === "car" ? "Ô tô" : service.vehicle_type === "motorbike" ? "Xe máy" : "Tất cả"}</span></td>
                          <td className="px-4 py-4 text-right font-mono text-amber-300">{money(service.cost_price)}</td>
                          <td className="px-4 py-4 text-right font-mono font-bold text-emerald-400">{money(service.suggested_price)}</td>
                          <td className={`px-4 py-4 text-right font-mono font-semibold ${profit >= 0 ? "text-cyan-300" : "text-red-300"}`}>{money(profit)}</td>
                          {canManage && <td className="px-4 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => openEdit(service)} className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs hover:border-[#d4af37] hover:text-[#e8c766]">Sửa</button><button type="button" onClick={() => void archiveService(service)} className="rounded-lg border border-red-900/70 px-3 py-1.5 text-xs text-red-300 hover:bg-red-950/40">Xóa</button></div></td>}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/75 backdrop-blur-sm p-4" onMouseDown={(e) => { if (e.currentTarget === e.target && !saving) setShowForm(false); }}>
          <form onSubmit={saveService} className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#141923] shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 sm:px-6 py-5"><div><p className="text-[11px] uppercase tracking-widest text-[#d4af37] font-bold">Danh mục dịch vụ</p><h2 className="text-xl font-bold text-white mt-1">{editingId ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}</h2></div><button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white text-xl">×</button></div>
            <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <label className="grid gap-1.5"><span className="text-gray-400">Mã dịch vụ *</span><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="VD: SANG_TEN_OTO" className="bg-[#0d1017] border border-gray-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:border-[#d4af37]" required /></label>
              <label className="grid gap-1.5"><span className="text-gray-400">Loại phương tiện</span><select value={form.vehicle_type} onChange={(e) => setForm({ ...form, vehicle_type: e.target.value as ServiceItem["vehicle_type"] })} className="bg-[#0d1017] border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"><option value="all">Tất cả</option><option value="car">Ô tô</option><option value="motorbike">Xe máy</option></select></label>
              <label className="grid gap-1.5 sm:col-span-2"><span className="text-gray-400">Nhóm dịch vụ *</span><input list="service-groups" value={form.group_name} onChange={(e) => setForm({ ...form, group_name: e.target.value })} placeholder="VD: Sang tên đổi chủ" className="bg-[#0d1017] border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#d4af37]" required /><datalist id="service-groups">{Array.from(new Set(services.map((s) => s.group_name))).map((group) => <option key={group} value={group} />)}</datalist></label>
              <label className="grid gap-1.5 sm:col-span-2"><span className="text-gray-400">Tên dịch vụ *</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Tên hiển thị trên báo giá" className="bg-[#0d1017] border border-gray-700 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-[#d4af37]" required /></label>
              <label className="grid gap-1.5"><span className="text-gray-400">Giá vốn nội bộ</span><input type="number" min="0" step="50000" value={form.cost_price} onChange={(e) => setForm({ ...form, cost_price: Number(e.target.value) })} className="bg-[#0d1017] border border-gray-700 rounded-lg px-3 py-2.5 text-amber-300 font-mono focus:outline-none focus:border-[#d4af37]" /><small className="text-gray-600">Không hiển thị trên báo giá gửi khách.</small></label>
              <label className="grid gap-1.5"><span className="text-gray-400">Giá khách đề xuất</span><input type="number" min="0" step="50000" value={form.suggested_price} onChange={(e) => setForm({ ...form, suggested_price: Number(e.target.value) })} className="bg-[#0d1017] border border-gray-700 rounded-lg px-3 py-2.5 text-emerald-300 font-mono focus:outline-none focus:border-[#d4af37]" /><small className="text-gray-600">Có thể điều chỉnh khi lập từng báo giá.</small></label>
              <label className="grid gap-1.5"><span className="text-gray-400">Thứ tự hiển thị</span><input type="number" min="0" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className="bg-[#0d1017] border border-gray-700 rounded-lg px-3 py-2.5 text-white font-mono focus:outline-none focus:border-[#d4af37]" /></label>
              <div className="rounded-xl border border-white/5 bg-black/20 p-3"><span className="text-xs text-gray-500">Lãi dự kiến</span><strong className="block text-lg text-cyan-300 mt-1">{money(form.suggested_price - form.cost_price)}</strong></div>
            </div>
            {error && <p role="alert" className="mx-5 sm:mx-6 mb-4 rounded-lg bg-red-950/40 px-3 py-2 text-sm text-red-200">{error}</p>}
            <div className="flex justify-end gap-3 border-t border-white/10 px-5 sm:px-6 py-4"><button type="button" onClick={() => setShowForm(false)} disabled={saving} className="quanly-btn-secondary">Hủy</button><button type="submit" disabled={saving} className="quanly-btn-gold">{saving ? "Đang lưu..." : editingId ? "Lưu thay đổi" : "Thêm dịch vụ"}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
