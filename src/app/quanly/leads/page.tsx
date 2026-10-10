"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { publicServiceOptions, serviceCategories } from "@/data/public-service-index";

interface StaffMember {
  user_id: string;
  full_name: string;
  role: string;
}

interface LeadEvent {
  id: string;
  lead_id: string;
  event_name: string;
  actor_id: string | null;
  actor_name?: string;
  occurred_at: string;
  metadata?: Record<string, unknown>;
}

interface Lead {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  phone: string;
  service: string;
  vehicle_type: string;
  processing_location: string;
  message: string;
  source_path?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  gclid?: string;
  status: string;
  assigned_to?: string | null;
  contacted_at?: string | null;
  qualified_at?: string | null;
  file_received_at?: string | null;
  completed_at?: string | null;
  lost_reason?: string | null;
  email_status?: string;
  email_last_attempt_at?: string | null;
}

const statusLabels: Record<string, string> = {
  new: "Mới",
  contacted: "Đã liên hệ",
  qualified: "Đủ điều kiện",
  file_received: "Đã nhận hồ sơ",
  completed: "Hoàn tất",
  lost: "Không phù hợp",
};

const serviceLabels: Record<string, string> = Object.fromEntries(
  publicServiceOptions.map((service) => [service.slug, service.name])
);

const vehicleLabels: Record<string, string> = {
  oto: "Ô tô",
  "xe-may": "Xe máy",
  khac: "Khác",
};

const eventLabels: Record<string, string> = {
  lead_created: "Tạo yêu cầu mới",
  contacted: "Đã liên hệ khách",
  qualified: "Đủ điều kiện hồ sơ",
  file_received: "Đã nhận hồ sơ gốc",
  completed: "Hoàn tất thủ tục",
  lost: "Hồ sơ không phù hợp",
  assigned: "Phân công xử lý",
  email_resent: "Gửi lại email thông báo",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [serviceGroupFilter, setServiceGroupFilter] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");

  // Modals & Active state
  const [lostModalLeadId, setLostModalLeadId] = useState<string | null>(null);
  const [lostReasonInput, setLostReasonInput] = useState("");

  const [historyModalLeadId, setHistoryModalLeadId] = useState<string | null>(null);
  const [historyEvents, setHistoryEvents] = useState<LeadEvent[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [actionMessage, setActionMessage] = useState<{ id: string; text: string; type: "success" | "error" } | null>(null);

  const staffMap: Record<string, string> = {};
  for (const s of staffList) {
    staffMap[s.user_id] = s.full_name;
  }

  const refreshData = async () => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (statusFilter) qs.set("status", statusFilter);
    if (serviceGroupFilter) qs.set("service_group", serviceGroupFilter);
    if (serviceFilter) qs.set("service", serviceFilter);
    if (sourceFilter) qs.set("source", sourceFilter);
    if (assignedFilter) qs.set("assigned_to", assignedFilter);

    try {
      const response = await fetch(`/api/internal/leads?${qs.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads || []);
        if (data.staff) {
          setStaffList(data.staff);
        }
      }
    } catch (err) {
      console.error("Lỗi tải khách hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const qs = new URLSearchParams();
    if (statusFilter) qs.set("status", statusFilter);
    if (serviceGroupFilter) qs.set("service_group", serviceGroupFilter);
    if (serviceFilter) qs.set("service", serviceFilter);
    if (sourceFilter) qs.set("source", sourceFilter);
    if (assignedFilter) qs.set("assigned_to", assignedFilter);

    fetch(`/api/internal/leads?${qs.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!ignore && data) {
          setLeads(data.leads || []);
          if (data.staff) setStaffList(data.staff);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Lỗi tải khách hàng:", err);
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [statusFilter, serviceGroupFilter, serviceFilter, sourceFilter, assignedFilter]);

  const updateLead = async (
    id: string,
    updates: { status?: string; lostReason?: string; assignedTo?: string | null }
  ) => {
    try {
      const response = await fetch(`/api/internal/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        setActionMessage({ id, text: "Cập nhật thành công", type: "success" });
        setTimeout(() => setActionMessage(null), 3000);
        void refreshData();
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(errData.error || "Không thể cập nhật.");
      }
    } catch {
      alert("Đã xảy ra lỗi kết nối.");
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    if (newStatus === "lost") {
      setLostModalLeadId(id);
      setLostReasonInput("");
      return;
    }
    void updateLead(id, { status: newStatus });
  };

  const submitLostReason = async () => {
    if (!lostModalLeadId) return;
    const reason = lostReasonInput.trim() || "Không ghi rõ lý do";
    await updateLead(lostModalLeadId, { status: "lost", lostReason: reason });
    setLostModalLeadId(null);
    setLostReasonInput("");
  };

  const handleAssignChange = (id: string, newAssignee: string) => {
    const assignedTo = newAssignee === "unassigned" ? null : newAssignee;
    void updateLead(id, { assignedTo });
  };

  const handleResendEmail = async (id: string) => {
    try {
      setActionMessage({ id, text: "Đang gửi email...", type: "success" });
      const response = await fetch(`/api/internal/leads/${id}/resend`, {
        method: "POST",
      });
      const data = await response.json();

      if (response.ok) {
        const notice = data.simulated
          ? "Đã mô phỏng gửi email (môi trường thử nghiệm)"
          : "Đã gửi lại email thành công";
        setActionMessage({ id, text: notice, type: "success" });
        void refreshData();
      } else {
        setActionMessage({ id, text: data.error || "Gửi email thất bại", type: "error" });
      }
    } catch {
      setActionMessage({ id, text: "Lỗi kết nối khi gửi email", type: "error" });
    }
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleViewHistory = async (id: string) => {
    setHistoryModalLeadId(id);
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/internal/leads/${id}`);
      if (response.ok) {
        const data = await response.json();
        setHistoryEvents(data.events || []);
      }
    } catch (err) {
      console.error("Lỗi tải lịch sử:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    try {
      return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "short",
        timeStyle: "short",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  // Unique sources for filter
  const existingSources = Array.from(
    new Set(leads.map((l) => l.utm_source).filter(Boolean))
  ) as string[];

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-[#D4AF37]">Quản lý khách hàng tiềm năng</h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#203040] text-[#00E5FF] border border-[#00E5FF]/30">
              {leads.length} yêu cầu
            </span>
          </div>
          <p className="text-gray-400 mt-1">
            Theo dõi từ liên hệ đầu tiên đến khi bàn giao hồ sơ hoàn tất.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/quanly/quotes"
            className="px-4 py-2 rounded-lg bg-gray-800 text-gray-200 hover:bg-gray-700 text-sm font-medium transition-colors"
          >
            ← Quản lý báo giá
          </Link>
          <button
            onClick={() => void refreshData()}
            className="px-4 py-2 rounded-lg bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 text-sm font-medium transition-colors"
          >
            Làm mới
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#1a1d27] border border-gray-800 rounded-xl p-4 mb-6 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Trạng thái hồ sơ</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#11151d] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="">Tất cả trạng thái</option>
              {Object.entries(statusLabels).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Nhóm dịch vụ</label>
            <select
              value={serviceGroupFilter}
              onChange={(e) => {
                setServiceGroupFilter(e.target.value);
                setServiceFilter("");
              }}
              className="w-full bg-[#11151d] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="">Tất cả nhóm</option>
              {serviceCategories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Dịch vụ</label>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full bg-[#11151d] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="">Tất cả dịch vụ</option>
              {publicServiceOptions
                .filter((service) => !serviceGroupFilter || service.category === serviceGroupFilter)
                .map((service) => (
                  <option key={service.slug} value={service.slug}>{service.name}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Nguồn (UTM Source)</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full bg-[#11151d] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="">Tất cả nguồn</option>
              {existingSources.map((src) => (
                <option key={src} value={src}>
                  {src}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Người phụ trách</label>
            <select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              className="w-full bg-[#11151d] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="">Tất cả người phụ trách</option>
              <option value="unassigned">Chưa phân công</option>
              {staffList.map((st) => (
                <option key={st.user_id} value={st.user_id}>
                  {st.full_name} ({st.role === "owner" ? "Chủ hệ thống" : "Nhân viên"})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-gray-500 bg-[#1a1d27] rounded-xl border border-gray-800">
            Đang tải dữ liệu khách hàng...
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-gray-500 bg-[#1a1d27] rounded-xl border border-gray-800">
            Không tìm thấy khách hàng nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          leads.map((lead) => {
            const assignedStaffName = lead.assigned_to
              ? staffMap[lead.assigned_to] || "Chưa xác định"
              : "Chưa phân công";

            return (
              <article
                key={lead.id}
                className="bg-[#1a1d27] border border-gray-800 hover:border-gray-700 rounded-xl p-5 shadow-lg transition-colors"
              >
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  {/* Left Column: Lead Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-bold text-white text-lg tracking-wide">{lead.name}</h2>
                      <a
                        href={`tel:${lead.phone}`}
                        className="font-mono text-[#D4AF37] font-semibold hover:underline bg-[#D4AF37]/10 px-2.5 py-0.5 rounded border border-[#D4AF37]/30 text-sm"
                      >
                        {lead.phone}
                      </a>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          lead.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : lead.status === "lost"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : lead.status === "new"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        }`}
                      >
                        {statusLabels[lead.status] || lead.status}
                      </span>

                      {lead.email_status && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded border ${
                            lead.email_status === "sent"
                              ? "bg-teal-900/30 text-teal-300 border-teal-700/50"
                              : lead.email_status === "failed"
                              ? "bg-red-900/30 text-red-300 border-red-700/50"
                              : "bg-gray-800 text-gray-400 border-gray-700"
                          }`}
                          title={`Email lần cuối: ${formatDate(lead.email_last_attempt_at)}`}
                        >
                          Email: {lead.email_status === "sent" ? "Đã gửi" : lead.email_status === "failed" ? "Lỗi gửi" : "Chờ gửi"}
                        </span>
                      )}
                    </div>

                    {/* Metadata line */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-300">
                      <span className="inline-flex items-center gap-1.5 font-medium text-[#00E5FF]">
                        {serviceLabels[lead.service] || lead.service}
                      </span>
                      <span>·</span>
                      <span>{vehicleLabels[lead.vehicle_type] || lead.vehicle_type}</span>
                      <span>·</span>
                      <span className="text-gray-400">{lead.processing_location}</span>
                    </div>

                    {/* Customer Message */}
                    <div className="bg-[#12151e] rounded-lg p-3 text-sm text-gray-300 border border-gray-800/80">
                      <span className="text-gray-500 text-xs block mb-1">Nội dung ghi chú của khách:</span>
                      {lead.message || <span className="text-gray-600 italic">Không có ghi chú thêm</span>}
                    </div>

                    {/* Lost reason notice if any */}
                    {lead.status === "lost" && lead.lost_reason && (
                      <div className="bg-rose-950/30 border border-rose-800/50 rounded-lg p-2.5 text-xs text-rose-300">
                        <strong className="font-semibold">Lý do không phù hợp:</strong> {lead.lost_reason}
                      </div>
                    )}

                    {/* Timeline timestamps */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1 border-t border-gray-800/70 text-gray-400">
                      <div>
                        <span className="text-gray-500 block">Tiếp nhận:</span>
                        {formatDate(lead.created_at)}
                      </div>
                      <div>
                        <span className="text-gray-500 block">Đã liên hệ:</span>
                        {formatDate(lead.contacted_at)}
                      </div>
                      <div>
                        <span className="text-gray-500 block">Đã nhận hồ sơ:</span>
                        {formatDate(lead.file_received_at)}
                      </div>
                      <div>
                        <span className="text-gray-500 block">Hoàn tất:</span>
                        {formatDate(lead.completed_at)}
                      </div>
                    </div>

                    {/* Tracking details */}
                    <div className="text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
                      <span>Nguồn: <strong className="text-gray-400">{lead.utm_source || "Trực tiếp"}</strong></span>
                      {lead.utm_campaign && <span>Chiến dịch: <strong className="text-gray-400">{lead.utm_campaign}</strong></span>}
                      {lead.gclid && <span className="text-[#00E5FF]">Google Ads (GCLID)</span>}
                    </div>
                  </div>

                  {/* Right Column: Actions & Controls */}
                  <div className="flex flex-col justify-between items-start lg:items-end gap-4 min-w-[240px] pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-800">
                    <div className="w-full space-y-3">
                      {/* Status Selector */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          Cập nhật trạng thái
                        </label>
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className="w-full bg-[#11151d] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#D4AF37]"
                        >
                          <option value="new">Mới</option>
                          <option value="contacted">Đã liên hệ</option>
                          <option value="qualified">Đủ điều kiện</option>
                          <option value="file_received">Đã nhận hồ sơ</option>
                          <option value="completed">Hoàn tất</option>
                          <option value="lost">Không phù hợp</option>
                        </select>
                      </div>

                      {/* Staff Assignee Selector */}
                      <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">
                          Người phụ trách: <span className="text-gray-300 font-semibold">{assignedStaffName}</span>
                        </label>
                        <select
                          value={lead.assigned_to || "unassigned"}
                          onChange={(e) => handleAssignChange(lead.id, e.target.value)}
                          className="w-full bg-[#11151d] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#00E5FF]"
                        >
                          <option value="unassigned">Chưa phân công</option>
                          {staffList.map((st) => (
                            <option key={st.user_id} value={st.user_id}>
                              {st.full_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Action buttons & feedback */}
                    <div className="w-full space-y-2">
                      {actionMessage && actionMessage.id === lead.id && (
                        <div
                          className={`text-xs px-2.5 py-1.5 rounded text-center ${
                            actionMessage.type === "success"
                              ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/60"
                              : "bg-rose-950/60 text-rose-300 border border-rose-800/60"
                          }`}
                        >
                          {actionMessage.text}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewHistory(lead.id)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-300 transition-colors"
                        >
                          Lịch sử xử lý
                        </button>
                        <button
                          onClick={() => handleResendEmail(lead.id)}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-teal-900/40 border border-teal-700/50 hover:bg-teal-900/60 text-xs font-medium text-teal-300 transition-colors"
                          title="Gửi lại thông báo email cho quản trị viên"
                        >
                          Gửi lại email
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Lost Reason Modal */}
      {lostModalLeadId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1d27] border border-gray-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-rose-400 mb-2">Đánh dấu hồ sơ không phù hợp</h3>
            <p className="text-xs text-gray-400 mb-4">
              Vui lòng nhập lý do cụ thể (ví dụ: hồ sơ tranh chấp, xe mất nguồn gốc, khách hủy lịch, v.v.)
            </p>
            <textarea
              value={lostReasonInput}
              onChange={(e) => setLostReasonInput(e.target.value)}
              placeholder="Nhập lý do tại đây..."
              rows={3}
              className="w-full bg-[#11151d] border border-gray-700 rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:border-rose-400 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setLostModalLeadId(null)}
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm text-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={() => void submitLostReason()}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-sm font-semibold text-white"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Events Modal */}
      {historyModalLeadId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1a1d27] border border-gray-700 rounded-xl max-w-lg w-full p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
              <h3 className="text-lg font-bold text-[#D4AF37]">Lịch sử xử lý hồ sơ</h3>
              <button
                onClick={() => setHistoryModalLeadId(null)}
                className="text-gray-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingHistory ? (
                <div className="text-center py-8 text-gray-500">Đang tải lịch sử...</div>
              ) : historyEvents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Chưa ghi nhận sự kiện nào.</div>
              ) : (
                historyEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="bg-[#12151e] border border-gray-800/80 rounded-lg p-3 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-[#00E5FF]">
                        {eventLabels[evt.event_name] || evt.event_name}
                      </span>
                      <span className="text-gray-500">{formatDate(evt.occurred_at)}</span>
                    </div>
                    <div className="text-gray-400">
                      Thực hiện bởi:{" "}
                      <span className="text-gray-200 font-medium">
                        {evt.actor_name || (evt.actor_id ? staffMap[evt.actor_id] || "Nhân viên" : "Hệ thống")}
                      </span>
                    </div>
                    {evt.metadata && Object.keys(evt.metadata).length > 0 && (
                      <div className="mt-1 text-gray-500 font-mono text-[11px] bg-black/30 p-1.5 rounded">
                        {JSON.stringify(evt.metadata)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-gray-800 mt-4 flex justify-end">
              <button
                onClick={() => setHistoryModalLeadId(null)}
                className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm text-gray-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
