"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

interface CaseDetail {
  id: string;
  case_number: string;
  quote_id?: string;
  quote_number?: string;
  status: "new" | "processing" | "completed";
  customer: {
    id: string;
    name: string;
    phone: string;
    type?: string;
    company_name?: string;
    tax_id?: string;
    zalo_name?: string;
    address?: string;
  };
  vehicles: Array<{
    id: string;
    license_plate?: string;
    owner_name?: string;
    brand?: string;
    model?: string;
    engine_number?: string;
    chassis_number?: string;
    address?: string;
    fleet_description?: string;
    vehicle_count: number;
  }>;
  items: Array<{
    id: string;
    service_name: string;
    quoted_price: number;
    adjusted_price: number;
    quantity: number;
    adjustment_reason?: string;
    final_price: number;
  }>;
  documents: Array<{
    id: string;
    document_name: string;
    status: "required" | "received" | "missing";
    note?: string;
    verified_by?: string;
    verified_at?: string;
  }>;
  costs: Array<{
    id: string;
    cost_group: string;
    description: string;
    amount: number;
    incurred_date: string;
    status: "draft" | "approved" | "rejected";
    submitted_by?: string;
    approved_by?: string;
    approved_at?: string;
  }>;
  estimated_amount: number;
  final_amount: number;
  is_locked: boolean;
  locked_at?: string;
  notes?: string;
  assigned_name?: string;
  received_at: string;
  completed_at?: string;
  audit_logs: Array<{
    id: string;
    action: string;
    actor_name: string;
    timestamp: string;
    details?: string;
  }>;
}

function formatMoney(amount: number): string {
  return (amount || 0).toLocaleString("vi-VN") + "đ";
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString("vi-VN")} ${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return dateStr;
  }
}

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"services" | "documents" | "costs" | "timeline">("services");
  const [refreshKey, setRefreshKey] = useState(0);

  // State for Price Adjustment Modal
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newAdjustedPrice, setNewAdjustedPrice] = useState<number>(0);
  const [newAdjustmentReason, setNewAdjustmentReason] = useState<string>("");
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);
  const [adjustError, setAdjustError] = useState("");

  // State for Add Cost Modal
  const [costModalOpen, setCostModalOpen] = useState(false);
  const [costGroup, setCostGroup] = useState("Chi phí hồ sơ");
  const [costDescription, setCostDescription] = useState("");
  const [costAmount, setCostAmount] = useState<number>(0);
  const [costSubmitting, setCostSubmitting] = useState(false);

  // State for Cavet OCR Modal
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [ocrImagePreview, setOcrImagePreview] = useState<string | null>(null);
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<"idle" | "ready" | "scanning" | "success" | "error">("idle");
  const [ocrConfidence, setOcrConfidence] = useState<string>("");
  const [ocrStoragePath, setOcrStoragePath] = useState<string>("");
  const [ocrError, setOcrError] = useState("");
  const [ocrForm, setOcrForm] = useState({
    licensePlate: "",
    ownerName: "",
    brand: "",
    model: "",
    engineNumber: "",
    chassisNumber: "",
    address: "",
  });
  const [ocrSaving, setOcrSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function loadCaseData() {
      try {
        const res = await fetch(`/api/internal/cases/${id}`);
        if (!res.ok) {
          throw new Error("Không thể tải thông tin hồ sơ");
        }
        const data = await res.json();
        if (!ignore) {
          setCaseData(data);
          setError("");
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadCaseData();
    return () => {
      ignore = true;
    };
  }, [id, refreshKey]);

  function reloadCase() {
    setRefreshKey((k) => k + 1);
  }

  // Handle Status Update
  async function handleStatusChange(newStatus: "new" | "processing" | "completed") {
    if (!caseData) return;
    try {
      const res = await fetch(`/api/internal/cases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_status", status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Không thể cập nhật trạng thái");
        return;
      }
      await reloadCase();
    } catch {
      alert("Lỗi kết nối");
    }
  }

  // Handle Document Toggle
  async function handleDocStatusChange(docId: string, status: "required" | "received" | "missing") {
    if (!caseData) return;
    try {
      const res = await fetch(`/api/internal/cases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_documents",
          documents: [{ id: docId, status }],
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Không thể cập nhật giấy tờ");
        return;
      }
      await reloadCase();
    } catch {
      alert("Lỗi kết nối");
    }
  }

  // Handle Submit Price Adjustment
  async function handleSaveAdjustment(e: React.FormEvent) {
    e.preventDefault();
    setAdjustError("");

    if (!editingItemId || !caseData) return;
    const targetItem = caseData.items.find((i) => i.id === editingItemId);
    if (!targetItem) return;

    if (newAdjustedPrice !== targetItem.quoted_price && !newAdjustmentReason.trim()) {
      setAdjustError("Bắt buộc phải nhập lý do khi thay đổi đơn giá so với giá báo ban đầu.");
      return;
    }

    setAdjustSubmitting(true);
    try {
      const res = await fetch(`/api/internal/cases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "adjust_items",
          items: [
            {
              id: editingItemId,
              adjusted_price: newAdjustedPrice,
              adjustment_reason: newAdjustmentReason.trim(),
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể điều chỉnh giá");
      }

      setAdjustModalOpen(false);
      setEditingItemId(null);
      await reloadCase();
    } catch (err) {
      setAdjustError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setAdjustSubmitting(false);
    }
  }

  // Handle Add Cost
  async function handleAddCost(e: React.FormEvent) {
    e.preventDefault();
    if (!costDescription.trim() || costAmount <= 0) {
      alert("Vui lòng nhập mô tả chi phí và số tiền hợp lệ");
      return;
    }

    setCostSubmitting(true);
    try {
      const res = await fetch(`/api/internal/cases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_cost",
          cost: {
            cost_group: costGroup,
            description: costDescription.trim(),
            amount: costAmount,
          },
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Không thể thêm chi phí");
        return;
      }
      setCostModalOpen(false);
      setCostDescription("");
      setCostAmount(0);
      await reloadCase();
    } catch {
      alert("Lỗi kết nối");
    } finally {
      setCostSubmitting(false);
    }
  }

  // Handle Approve Cost
  async function handleApproveCost(costId: string, approveStatus: "approved" | "rejected") {
    try {
      const res = await fetch(`/api/internal/cases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve_cost",
          cost_id: costId,
          approve_status: approveStatus,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Không thể duyệt chi phí");
        return;
      }
      await reloadCase();
    } catch {
      alert("Lỗi kết nối");
    }
  }

  // Handle Toggle Lock
  async function handleToggleLock() {
    if (!confirm(caseData?.is_locked ? "Mở khóa hồ sơ này để chỉnh sửa?" : "Khóa và chốt số liệu nghiệm thu cho hồ sơ này?")) {
      return;
    }
    try {
      const res = await fetch(`/api/internal/cases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_lock" }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Không thể khóa/mở khóa hồ sơ");
        return;
      }
      await reloadCase();
    } catch {
      alert("Lỗi kết nối");
    }
  }

  // Handle Open OCR Modal
  function handleOpenOcrModal() {
    const v = caseData?.vehicles?.[0];
    setOcrForm({
      licensePlate: v?.license_plate || "",
      ownerName: v?.owner_name || "",
      brand: v?.brand || "",
      model: v?.model || "",
      engineNumber: v?.engine_number || "",
      chassisNumber: v?.chassis_number || "",
      address: v?.address || "",
    });
    setOcrImagePreview(null);
    setOcrError("");
    setOcrStatus("idle");
    setOcrConfidence("");
    setOcrStoragePath("");
    setOcrModalOpen(true);
  }

  // Handle OCR Image File
  function handleOcrFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setOcrError("Ảnh vượt quá kích thước 8MB. Vui lòng chọn ảnh nhỏ hơn.");
      setOcrStatus("error");
      return;
    }
    setOcrError("");
    setOcrStatus("ready");
    const reader = new FileReader();
    reader.onload = () => {
      setOcrImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  // Handle Scan with Gemini AI
  async function handleScanCavetWithAi() {
    if (!ocrImagePreview) {
      setOcrError("Vui lòng tải ảnh lên trước khi quét AI.");
      setOcrStatus("error");
      return;
    }
    setOcrScanning(true);
    setOcrStatus("scanning");
    setOcrError("");
    try {
      const res = await fetch("/api/internal/ocr/cavet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: ocrImagePreview,
          caseId: id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể quét ảnh bằng Gemini");
      }
      if (data.data) {
        setOcrForm({
          licensePlate: data.data.licensePlate || ocrForm.licensePlate,
          ownerName: data.data.ownerName || ocrForm.ownerName,
          brand: data.data.brand || ocrForm.brand,
          model: data.data.model || ocrForm.model,
          engineNumber: data.data.engineNumber || ocrForm.engineNumber,
          chassisNumber: data.data.chassisNumber || ocrForm.chassisNumber,
          address: data.data.address || ocrForm.address,
        });
        setOcrStatus("success");
        setOcrConfidence(data.confidence || "high");
        setOcrStoragePath(data.storagePath || "");
      }
    } catch (err) {
      setOcrStatus("error");
      setOcrError(err instanceof Error ? err.message : "Lỗi xử lý OCR");
    } finally {
      setOcrScanning(false);
    }
  }

  // Handle Save Vehicle from OCR / Form
  async function handleSaveVehicle(e: React.FormEvent) {
    e.preventDefault();
    setOcrSaving(true);
    try {
      const res = await fetch(`/api/internal/cases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_vehicle",
          vehicle: {
            license_plate: ocrForm.licensePlate.trim().toUpperCase(),
            owner_name: ocrForm.ownerName.trim(),
            brand: ocrForm.brand.trim(),
            model: ocrForm.model.trim(),
            engine_number: ocrForm.engineNumber.trim(),
            chassis_number: ocrForm.chassisNumber.trim(),
            address: ocrForm.address.trim(),
          },
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Không thể cập nhật thông tin xe");
      }
      setOcrModalOpen(false);
      await reloadCase();
    } catch (err) {
      setOcrError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setOcrSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="quanly-content-container text-center py-24 text-gray-400">
        Đang tải thông tin hồ sơ...
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="quanly-content-container py-12 text-center space-y-4">
        <div className="text-red-400 text-sm">⚠️ {error || "Hồ sơ không tồn tại"}</div>
        <Link href="/quanly/cases" className="quanly-btn-secondary text-xs inline-block">
          ← Quay lại danh sách hồ sơ
        </Link>
      </div>
    );
  }

  const primaryVehicle = caseData.vehicles[0];
  const approvedCosts = (caseData.costs || [])
    .filter((c) => c.status === "approved")
    .reduce((sum, c) => sum + c.amount, 0);
  const netEstimated = Math.max(0, caseData.final_amount - approvedCosts);

  return (
    <div className="quanly-content-container max-w-6xl space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/quanly/cases"
              className="text-xs text-gray-400 hover:text-white px-2.5 py-1 rounded bg-gray-900 border border-gray-800"
            >
              ← Danh sách hồ sơ
            </Link>
            <span className="font-mono text-sm font-bold text-[#d4af37]">
              {caseData.case_number}
            </span>
            {caseData.is_locked && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40">
                🔒 Đã khóa nghiệm thu
              </span>
            )}
          </div>

          <h1 className="text-xl font-bold text-white tracking-tight mt-2 flex items-center gap-2">
            <span>{caseData.customer.name}</span>
            <span className="text-xs font-normal text-gray-400 font-mono">
              ({caseData.customer.phone})
            </span>
            {caseData.customer.company_name && (
              <span className="text-xs text-amber-400 font-normal">
                - {caseData.customer.company_name}
              </span>
            )}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Ngày tiếp nhận: {formatDate(caseData.received_at)} • Người phụ trách: {caseData.assigned_name || "Phạm Xuân Định"}
          </p>
        </div>

        {/* Operational Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {caseData.status === "new" && (
            <button
              onClick={() => handleStatusChange("processing")}
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition"
            >
              ▶ Bắt đầu xử lý hồ sơ
            </button>
          )}

          {caseData.status === "processing" && (
            <button
              onClick={() => handleStatusChange("completed")}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
            >
              ✓ Đánh dấu Hoàn thành
            </button>
          )}

          {caseData.status === "completed" && (
            <Link
              href={`/quanly/invoices/create?caseId=${caseData.id}`}
              className="quanly-btn-primary text-xs flex items-center gap-1.5"
            >
              🧾 Lập Phiếu thanh toán
            </Link>
          )}

          <button
            onClick={handleToggleLock}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              caseData.is_locked
                ? "bg-purple-950/50 border-purple-800 text-purple-300 hover:bg-purple-900/50"
                : "bg-gray-800 border-gray-700 text-gray-300 hover:text-white"
            }`}
            title="Khóa/Mở khóa số liệu nghiệm thu (Chỉ Owner)"
          >
            {caseData.is_locked ? "🔓 Mở khóa số liệu" : "🔒 Khóa nghiệm thu"}
          </button>
        </div>
      </div>

      {/* Stepper Pipeline */}
      <div className="bg-[#121620] border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                caseData.status === "new"
                  ? "bg-blue-500 text-black shadow-md shadow-blue-500/30"
                  : "bg-gray-800 text-gray-400"
              }`}
            >
              1
            </span>
            <span className={caseData.status === "new" ? "text-blue-400 font-bold" : "text-gray-400"}>
              Mới tiếp nhận
            </span>
          </div>
          <div className="flex-1 h-0.5 mx-3 bg-gray-800" />
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                caseData.status === "processing"
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/30"
                  : "bg-gray-800 text-gray-400"
              }`}
            >
              2
            </span>
            <span className={caseData.status === "processing" ? "text-amber-400 font-bold" : "text-gray-400"}>
              Đang xử lý hồ sơ
            </span>
          </div>
          <div className="flex-1 h-0.5 mx-3 bg-gray-800" />
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                caseData.status === "completed"
                  ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30"
                  : "bg-gray-800 text-gray-400"
              }`}
            >
              3
            </span>
            <span className={caseData.status === "completed" ? "text-emerald-400 font-bold" : "text-gray-400"}>
              Hoàn thành & Nghiệm thu
            </span>
          </div>
        </div>
      </div>

      {/* 4 Financial KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="quanly-kpi-card">
          <div className="text-[11px] text-gray-400">Giá báo ban đầu</div>
          <div className="text-base font-bold font-mono text-gray-300 mt-1">
            {formatMoney(caseData.estimated_amount)}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">Giá theo báo giá</div>
        </div>

        <div className="quanly-kpi-card">
          <div className="text-[11px] text-gray-400">Giá chốt nghiệm thu</div>
          <div className="text-base font-bold font-mono text-emerald-400 mt-1">
            {formatMoney(caseData.final_amount)}
          </div>
          <div className="text-[10px] text-emerald-500/80 mt-0.5">
            {caseData.final_amount !== caseData.estimated_amount ? "Đã điều chỉnh" : "Không đổi"}
          </div>
        </div>

        <div className="quanly-kpi-card">
          <div className="text-[11px] text-gray-400">Chi phí đã duyệt</div>
          <div className="text-base font-bold font-mono text-rose-400 mt-1">
            {formatMoney(approvedCosts)}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">Lệ phí & Công tác phí</div>
        </div>

        <div className="quanly-kpi-card">
          <div className="text-[11px] text-gray-400">Lợi nhuận gộp ước tính</div>
          <div className="text-base font-bold font-mono text-[#d4af37] mt-1">
            {formatMoney(netEstimated)}
          </div>
          <div className="text-[10px] text-amber-500/80 mt-0.5">Chia 50/50: {formatMoney(Math.round(netEstimated / 2))}</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-800 gap-2">
        <button
          onClick={() => setActiveTab("services")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${
            activeTab === "services"
              ? "border-[#d4af37] text-[#d4af37]"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          📋 Dịch vụ & Điều chỉnh giá ({caseData.items.length})
        </button>

        <button
          onClick={() => setActiveTab("documents")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${
            activeTab === "documents"
              ? "border-[#d4af37] text-[#d4af37]"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          📑 Checklist Giấy tờ ({caseData.documents.filter((d) => d.status === "received").length}/
          {caseData.documents.length})
        </button>

        <button
          onClick={() => setActiveTab("costs")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${
            activeTab === "costs"
              ? "border-[#d4af37] text-[#d4af37]"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          💰 Chi phí phát sinh ({caseData.costs?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("timeline")}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${
            activeTab === "timeline"
              ? "border-[#d4af37] text-[#d4af37]"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          ⏱ Nhật ký xử lý ({caseData.audit_logs?.length || 0})
        </button>
      </div>

      {/* TAB 1: Services & Price Adjustment */}
      {activeTab === "services" && (
        <div className="space-y-4">
          <div className="quanly-card p-0 overflow-hidden">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs uppercase text-gray-500 bg-black/40 border-b border-gray-800">
                <tr>
                  <th className="px-5 py-3">Tên dịch vụ</th>
                  <th className="px-5 py-3 font-mono">Giá báo ban đầu</th>
                  <th className="px-5 py-3 font-mono">Giá điều chỉnh</th>
                  <th className="px-5 py-3 text-center">SL</th>
                  <th className="px-5 py-3 font-mono">Thành tiền</th>
                  <th className="px-5 py-3">Lý do điều chỉnh</th>
                  <th className="px-5 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-xs">
                {caseData.items.map((item) => {
                  const isChanged = item.adjusted_price !== item.quoted_price;
                  return (
                    <tr key={item.id} className="hover:bg-gray-800/20">
                      <td className="px-5 py-3.5 font-medium text-white">
                        {item.service_name}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-gray-400">
                        {formatMoney(item.quoted_price)}
                      </td>
                      <td className="px-5 py-3.5 font-mono">
                        <span className={isChanged ? "text-amber-400 font-bold" : "text-gray-300"}>
                          {formatMoney(item.adjusted_price)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center font-mono">{item.quantity}</td>
                      <td className="px-5 py-3.5 font-mono font-bold text-emerald-400">
                        {formatMoney(item.final_price)}
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 italic">
                        {item.adjustment_reason || "-"}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          disabled={caseData.is_locked}
                          onClick={() => {
                            setEditingItemId(item.id);
                            setNewAdjustedPrice(item.adjusted_price);
                            setNewAdjustmentReason(item.adjustment_reason || "");
                            setAdjustModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 disabled:opacity-40 text-xs"
                        >
                          Điều chỉnh giá
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Vehicle summary card below services */}
          <div className="quanly-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-gray-800/60 pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase text-gray-300 flex items-center gap-2">
                  <span>🚗</span> Phương tiện xử lý trong hồ sơ
                </h3>
                <p className="text-[11px] text-gray-400">
                  Dữ liệu xe chính thức phục vụ sang tên / rút hồ sơ / đổi biển
                </p>
              </div>
              <button
                disabled={caseData.is_locked}
                onClick={handleOpenOcrModal}
                className="quanly-btn-secondary text-xs flex items-center gap-1.5 self-start sm:self-auto hover:border-[#d4af37]"
              >
                <span>📸</span> Quét Cà vẹt bằng Gemini AI / Cập nhật xe
              </button>
            </div>

            {primaryVehicle && (primaryVehicle.license_plate || primaryVehicle.owner_name || primaryVehicle.brand) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-gray-300">
                <div className="p-2.5 bg-black/40 border border-gray-800/80 rounded-lg">
                  <span className="text-[10px] text-gray-400 block mb-0.5">Biển số xe:</span>
                  <span className="font-mono font-bold text-white bg-gray-900 px-2 py-0.5 rounded border border-gray-700 inline-block">
                    {primaryVehicle.license_plate || "Chưa có"}
                  </span>
                </div>

                <div className="p-2.5 bg-black/40 border border-gray-800/80 rounded-lg">
                  <span className="text-[10px] text-gray-400 block mb-0.5">Chủ xe trên Cà vẹt:</span>
                  <span className="font-semibold text-white">
                    {primaryVehicle.owner_name || "Chưa có"}
                  </span>
                </div>

                <div className="p-2.5 bg-black/40 border border-gray-800/80 rounded-lg">
                  <span className="text-[10px] text-gray-400 block mb-0.5">Nhãn hiệu / Dòng xe:</span>
                  <span className="text-white font-medium">
                    {primaryVehicle.brand || ""} {primaryVehicle.model || ""}
                  </span>
                </div>

                {primaryVehicle.chassis_number && (
                  <div className="p-2.5 bg-black/40 border border-gray-800/80 rounded-lg">
                    <span className="text-[10px] text-gray-400 block mb-0.5">Số khung:</span>
                    <span className="font-mono text-gray-200">{primaryVehicle.chassis_number}</span>
                  </div>
                )}

                {primaryVehicle.engine_number && (
                  <div className="p-2.5 bg-black/40 border border-gray-800/80 rounded-lg">
                    <span className="text-[10px] text-gray-400 block mb-0.5">Số máy:</span>
                    <span className="font-mono text-gray-200">{primaryVehicle.engine_number}</span>
                  </div>
                )}

                {primaryVehicle.address && (
                  <div className="p-2.5 bg-black/40 border border-gray-800/80 rounded-lg sm:col-span-2 lg:col-span-3">
                    <span className="text-[10px] text-gray-400 block mb-0.5">Địa chỉ đăng ký:</span>
                    <span className="text-gray-200">{primaryVehicle.address}</span>
                  </div>
                )}

                {primaryVehicle.fleet_description && (
                  <div className="p-2.5 bg-black/40 border border-gray-800/80 rounded-lg sm:col-span-2">
                    <span className="text-[10px] text-amber-400 block mb-0.5">Hồ sơ đội xe:</span>
                    <span className="text-amber-200">
                      {primaryVehicle.fleet_description} ({primaryVehicle.vehicle_count} xe)
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-500 py-3 italic flex items-center justify-between">
                <span>Chưa có thông tin xe. Bấm nút phía trên để tải ảnh Cà vẹt quét tự động bằng AI hoặc nhập tay.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Documents Checklist */}
      {activeTab === "documents" && (
        <div className="space-y-4">
          <div className="quanly-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">📑 Danh mục Giấy tờ bàn giao</h3>
                <p className="text-[11px] text-gray-400">
                  Click chuyển trạng thái nhanh để xác nhận bàn giao bản gốc
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {caseData.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 bg-black/40 border border-gray-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-semibold text-white text-xs flex items-center gap-2">
                      <span>{doc.document_name}</span>
                      {doc.status === "received" && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                          ✓ Đã nhận
                        </span>
                      )}
                      {doc.status === "missing" && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40">
                          ⚠️ Thiếu/Bổ sung sau
                        </span>
                      )}
                    </div>
                    {doc.note && (
                      <div className="text-[11px] text-gray-400 mt-1 italic">
                        Ghi chú: {doc.note}
                      </div>
                    )}
                    {doc.verified_by && (
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        Xác nhận bởi {doc.verified_by} lúc {formatDate(doc.verified_at)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      disabled={caseData.is_locked}
                      onClick={() => handleDocStatusChange(doc.id, "received")}
                      className={`px-2.5 py-1 rounded text-xs transition ${
                        doc.status === "received"
                          ? "bg-emerald-600 text-white font-bold"
                          : "bg-gray-800 text-gray-400 hover:text-white"
                      }`}
                    >
                      Đã nhận
                    </button>
                    <button
                      disabled={caseData.is_locked}
                      onClick={() => handleDocStatusChange(doc.id, "missing")}
                      className={`px-2.5 py-1 rounded text-xs transition ${
                        doc.status === "missing"
                          ? "bg-rose-600 text-white font-bold"
                          : "bg-gray-800 text-gray-400 hover:text-white"
                      }`}
                    >
                      Bổ sung sau
                    </button>
                    <button
                      disabled={caseData.is_locked}
                      onClick={() => handleDocStatusChange(doc.id, "required")}
                      className={`px-2.5 py-1 rounded text-xs transition ${
                        doc.status === "required"
                          ? "bg-amber-600 text-white font-bold"
                          : "bg-gray-800 text-gray-400 hover:text-white"
                      }`}
                    >
                      Cần thu
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Costs Management */}
      {activeTab === "costs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">💰 Chi phí thực hiện dịch vụ</h3>
            <button
              disabled={caseData.is_locked}
              onClick={() => setCostModalOpen(true)}
              className="quanly-btn-secondary text-xs flex items-center gap-1"
            >
              ＋ Nhập chi phí phát sinh
            </button>
          </div>

          <div className="quanly-card p-0 overflow-hidden">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs uppercase text-gray-500 bg-black/40 border-b border-gray-800">
                <tr>
                  <th className="px-5 py-3">Nhóm chi phí</th>
                  <th className="px-5 py-3">Mô tả</th>
                  <th className="px-5 py-3 font-mono">Số tiền</th>
                  <th className="px-5 py-3">Ngày phát sinh</th>
                  <th className="px-5 py-3">Trạng thái</th>
                  <th className="px-5 py-3">Người nhập / duyệt</th>
                  <th className="px-5 py-3 text-right">Duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-xs">
                {!caseData.costs || caseData.costs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      Chưa phát sinh chi phí nào cho hồ sơ này.
                    </td>
                  </tr>
                ) : (
                  caseData.costs.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-800/20">
                      <td className="px-5 py-3.5 text-gray-400">{c.cost_group}</td>
                      <td className="px-5 py-3.5 font-medium text-white">{c.description}</td>
                      <td className="px-5 py-3.5 font-mono font-bold text-rose-400">
                        {formatMoney(c.amount)}
                      </td>
                      <td className="px-5 py-3.5 text-gray-400">{c.incurred_date}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            c.status === "approved"
                              ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
                              : c.status === "rejected"
                              ? "bg-rose-950/60 text-rose-300 border border-rose-800/40"
                              : "bg-amber-950/60 text-amber-300 border border-amber-800/40"
                          }`}
                        >
                          {c.status === "approved"
                            ? "✓ Đã duyệt"
                            : c.status === "rejected"
                            ? "✕ Từ chối"
                            : "Bản nháp"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-[11px]">
                        <div>Nhập: {c.submitted_by || "Nhân viên"}</div>
                        {c.approved_by && <div>Duyệt: {c.approved_by}</div>}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {c.status !== "approved" && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              disabled={caseData.is_locked}
                              onClick={() => handleApproveCost(c.id, "approved")}
                              className="px-2 py-1 bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 rounded text-[11px] hover:bg-emerald-900/60"
                            >
                              Duyệt
                            </button>
                            <button
                              disabled={caseData.is_locked}
                              onClick={() => handleApproveCost(c.id, "rejected")}
                              className="px-2 py-1 bg-rose-950/60 border border-rose-800/40 text-rose-300 rounded text-[11px] hover:bg-rose-900/60"
                            >
                              Hủy
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Timeline / Audit logs */}
      {activeTab === "timeline" && (
        <div className="quanly-card space-y-4">
          <h3 className="text-sm font-bold text-white mb-2">⏱ Lịch sử Thao tác & Nhật ký Xử lý</h3>
          <div className="space-y-3">
            {caseData.audit_logs?.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-black/40 border border-gray-800 rounded-lg flex items-start justify-between gap-4 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{log.details || log.action}</div>
                  <div className="text-[10px] text-gray-500 mt-1">
                    Thực hiện bởi: <span className="text-gray-300">{log.actor_name}</span>
                  </div>
                </div>
                <div className="text-[10px] text-gray-500 font-mono whitespace-nowrap">
                  {formatDate(log.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: Adjust Price (Bắt buộc lý do) */}
      {adjustModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveAdjustment}
            className="bg-[#121620] border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-base font-bold text-white">⚙️ Điều chỉnh Đơn giá Dịch vụ</h3>
            <p className="text-xs text-gray-400">
              Quy tắc hệ thống: Khi giá điều chỉnh khác giá báo ban đầu, bạn bắt buộc phải ghi rõ lý do để lưu vết kiểm toán.
            </p>

            {adjustError && (
              <div className="p-2.5 bg-red-950/40 border border-red-800/60 rounded-lg text-xs text-red-300">
                ⚠️ {adjustError}
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-300 mb-1">Đơn giá mới (VNĐ) *</label>
              <input
                type="number"
                min={0}
                required
                value={newAdjustedPrice}
                onChange={(e) => setNewAdjustedPrice(parseInt(e.target.value) || 0)}
                className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-300 mb-1">
                Lý do điều chỉnh giá *
              </label>
              <textarea
                rows={3}
                required
                value={newAdjustmentReason}
                onChange={(e) => setNewAdjustmentReason(e.target.value)}
                placeholder="Ví dụ: Giảm giá do khách làm nhiều xe / Tăng phí do phát sinh cà số máy khó..."
                className="w-full bg-[#0d1017] border border-gray-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAdjustModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-800 text-xs text-gray-300 hover:text-white"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={adjustSubmitting}
                className="quanly-btn-primary text-xs"
              >
                {adjustSubmitting ? "Đang lưu..." : "Lưu điều chỉnh"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Add Cost */}
      {costModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleAddCost}
            className="bg-[#121620] border border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-base font-bold text-white">💰 Nhập Chi phí Phát sinh</h3>
            <p className="text-xs text-gray-400">
              Nhập lệ phí nhà nước, công tác phí hoặc các chi phí liên quan đến hồ sơ.
            </p>

            <div>
              <label className="block text-xs text-gray-300 mb-1">Nhóm chi phí</label>
              <select
                value={costGroup}
                onChange={(e) => setCostGroup(e.target.value)}
                className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
              >
                <option value="Lệ phí nhà nước">Lệ phí nhà nước (CSGT, Thuế, Đăng kiểm)</option>
                <option value="Công tác phí">Công tác phí (Xăng xe, di chuyển, cà số)</option>
                <option value="Chi phí hồ sơ">Chi phí hồ sơ / dịch thuật / công chứng</option>
                <option value="Khác">Chi phí khác</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-300 mb-1">Mô tả chi phí *</label>
              <input
                type="text"
                required
                value={costDescription}
                onChange={(e) => setCostDescription(e.target.value)}
                placeholder="Ví dụ: Lệ phí biển số tại CSGT Rạch Chiếc"
                className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-300 mb-1">Số tiền (VNĐ) *</label>
              <input
                type="number"
                min={1}
                required
                value={costAmount || ""}
                onChange={(e) => setCostAmount(parseInt(e.target.value) || 0)}
                placeholder="150000"
                className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCostModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-800 text-xs text-gray-300 hover:text-white"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={costSubmitting}
                className="quanly-btn-primary text-xs"
              >
                {costSubmitting ? "Đang lưu..." : "Xác nhận chi phí"}
              </button>
            </div>
          </form>
        </div>
      )}
      {/* MODAL: Gemini Cavet OCR & Review */}
      {ocrModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121620] border border-gray-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>📸</span> Quét Cà vẹt bằng Google Gemini AI
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  AI trích xuất tự động thông tin đăng ký xe. Nhân viên kiểm tra và xác nhận trước khi lưu.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOcrModalOpen(false)}
                className="text-gray-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            {ocrError && (
              <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300">
                ⚠️ {ocrError}
              </div>
            )}

            {/* Upload & Preview Step */}
            <div className="p-4 bg-black/40 border border-gray-800 rounded-xl space-y-3">
              <label className="block text-xs font-semibold text-gray-300">
                1. Chọn ảnh Cà vẹt xe (mặt trước hoặc mặt sau)
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleOcrFileSelect}
                  className="text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-800 file:text-gray-200 hover:file:bg-gray-700"
                />

                {ocrImagePreview && (
                  <button
                    type="button"
                    disabled={ocrScanning}
                    onClick={handleScanCavetWithAi}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-xs hover:from-amber-400 hover:to-amber-500 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {ocrScanning ? (
                      <>
                        <span className="animate-spin inline-block">⚡</span> Đang phân tích bằng Gemini AI...
                      </>
                    ) : (
                      <>
                        <span>⚡</span> Phân tích bằng Gemini AI
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Status Indicator Pill */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {ocrStatus === "idle" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-gray-800 text-gray-400 border border-gray-700">
                    ⚪ Chờ tải ảnh Cà vẹt
                  </span>
                )}
                {ocrStatus === "ready" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-blue-950/60 text-blue-300 border border-blue-800">
                    🔵 Ảnh sẵn sàng • Bấm &quot;Phân tích bằng Gemini AI&quot;
                  </span>
                )}
                {ocrStatus === "scanning" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-amber-950/60 text-amber-300 border border-amber-800 animate-pulse">
                    ⚡ Đang quét AI Gemini 2.5 Flash...
                  </span>
                )}
                {ocrStatus === "success" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                    ✓ Đã nhận diện thành công ({ocrConfidence === "high" ? "Độ tin cậy cao 95%" : "Độ tin cậy 75%"})
                    {ocrStoragePath ? ` • Lưu trữ: ${ocrStoragePath.slice(0, 24)}...` : ""}
                  </span>
                )}
                {ocrStatus === "error" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-amber-950/60 text-amber-300 border border-amber-800">
                    ⚠️ Nhận diện tự động gặp sự cố • Hãy nhập thủ công bên dưới
                  </span>
                )}
              </div>

              {ocrImagePreview && (
                <div className="mt-2 border border-gray-800 rounded-lg overflow-hidden max-h-48 flex items-center justify-center bg-black/60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ocrImagePreview}
                    alt="Xem trước Cà vẹt"
                    className="max-h-48 object-contain"
                  />
                </div>
              )}
            </div>

            {/* Editable Form for Human Verification */}
            <form onSubmit={handleSaveVehicle} className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#d4af37]">
                  2. Kiểm tra & chỉnh sửa dữ liệu trích xuất (Bắt buộc kiểm tra trước khi lưu)
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Biển số xe *</label>
                  <input
                    type="text"
                    required
                    value={ocrForm.licensePlate}
                    onChange={(e) => setOcrForm({ ...ocrForm, licensePlate: e.target.value })}
                    placeholder="51K-123.45"
                    className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Chủ xe trên Cà vẹt *</label>
                  <input
                    type="text"
                    required
                    value={ocrForm.ownerName}
                    onChange={(e) => setOcrForm({ ...ocrForm, ownerName: e.target.value })}
                    placeholder="NGUYỄN VĂN A"
                    className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Nhãn hiệu</label>
                  <input
                    type="text"
                    value={ocrForm.brand}
                    onChange={(e) => setOcrForm({ ...ocrForm, brand: e.target.value })}
                    placeholder="TOYOTA"
                    className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Số loại / Model</label>
                  <input
                    type="text"
                    value={ocrForm.model}
                    onChange={(e) => setOcrForm({ ...ocrForm, model: e.target.value })}
                    placeholder="INNOVA"
                    className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Số khung</label>
                  <input
                    type="text"
                    value={ocrForm.chassisNumber}
                    onChange={(e) => setOcrForm({ ...ocrForm, chassisNumber: e.target.value })}
                    placeholder="RL4..."
                    className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Số máy</label>
                  <input
                    type="text"
                    value={ocrForm.engineNumber}
                    onChange={(e) => setOcrForm({ ...ocrForm, engineNumber: e.target.value })}
                    placeholder="2TR..."
                    className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white font-mono uppercase focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-gray-400 mb-1">Địa chỉ đăng ký</label>
                  <input
                    type="text"
                    value={ocrForm.address}
                    onChange={(e) => setOcrForm({ ...ocrForm, address: e.target.value })}
                    placeholder="Số 123 Đường ABC, Phường X, Quận Y, TP.HCM"
                    className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setOcrModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-800 text-xs text-gray-300 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={ocrSaving}
                  className="quanly-btn-primary text-xs flex items-center gap-1.5"
                >
                  {ocrSaving ? "Đang lưu..." : "✓ Xác nhận & Áp dụng vào hồ sơ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
