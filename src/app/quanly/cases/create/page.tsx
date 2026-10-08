"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface CatalogItem {
  id: string;
  name: string;
  category: string;
  suggested_price: number;
}

function CaseCreateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const quoteId = searchParams.get("quoteId");

  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(!!quoteId);
  const [error, setError] = useState("");

  // Customer state
  const [customerType, setCustomerType] = useState<"individual" | "company">("individual");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [zaloName, setZaloName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  // Vehicle state
  const [vehicleMode, setVehicleMode] = useState<"single" | "fleet">("single");
  const [licensePlate, setLicensePlate] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [vehicleBrand, setVehicleBrand] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [fleetDesc, setFleetDesc] = useState("");
  const [fleetCount, setFleetCount] = useState(1);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [ocrConfidence, setOcrConfidence] = useState("");
  const [ocrStoragePath, setOcrStoragePath] = useState("");
  const [ocrPreview, setOcrPreview] = useState<string | null>(null);

  async function handleOcrUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrLoading(true);
    setOcrStatus("scanning");
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        setOcrPreview(base64);
        try {
          const res = await fetch("/api/internal/ocr/cavet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64: base64 }),
          });
          const json = await res.json();
          if (json.ok && json.data) {
            if (json.data.licensePlate) setLicensePlate(json.data.licensePlate);
            if (json.data.ownerName) setOwnerName(json.data.ownerName);
            if (json.data.brand) setVehicleBrand(json.data.brand);
            if (json.data.model) setVehicleModel(json.data.model);
            if (!customerName && json.data.ownerName) setCustomerName(json.data.ownerName);
            if (!customerAddress && json.data.address) setCustomerAddress(json.data.address);
            setOcrStatus("success");
            setOcrConfidence(json.confidence || "high");
            setOcrStoragePath(json.storagePath || "");
          } else {
            setOcrStatus("error");
          }
        } catch {
          setOcrStatus("error");
        } finally {
          setOcrLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setOcrStatus("error");
      setOcrLoading(false);
    }
  }

  // Load catalog
  const [services, setServices] = useState<
    Array<{ id: string; name: string; price: number; quantity: number; note?: string }>
  >([]);

  // Checklist
  const [documents, setDocuments] = useState<
    Array<{ id: string; name: string; status: "required" | "received" | "missing"; note?: string }>
  >([
    { id: "1", name: "Giấy đăng ký xe (Cavet gốc)", status: "required", note: "Kiểm tra số khung số máy" },
    { id: "2", name: "CCCD gắn chip của chủ cũ & chủ mới", status: "required" },
    { id: "3", name: "Hợp đồng mua bán / ủy quyền công chứng", status: "required" },
    { id: "4", name: "Biển số xe cũ (2 biển)", status: "required" },
  ]);

  const [notes, setNotes] = useState("");
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [selectedCatalogId, setSelectedCatalogId] = useState("");

  // Load catalog
  useEffect(() => {
    fetch("/api/internal/service-catalog")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setCatalog(data);
        } else if (data?.services && Array.isArray(data.services)) {
          setCatalog(data.services);
        }
      })
      .catch(() => {});
  }, []);

  // Pre-load quote if quoteId exists
  useEffect(() => {
    if (!quoteId) return;

    let ignore = false;
    async function loadQuote() {
      try {
        const res = await fetch("/api/internal/quotes");
        if (!res.ok) return;
        const quotes = await res.json();
        const found = quotes.find((q: { id: string }) => q.id === quoteId);
        if (found && !ignore) {
          setCustomerName(found.customer_name || "");
          setCustomerPhone(found.customer_phone || "");
          if (found.company_name) {
            setCustomerType("company");
            setCompanyName(found.company_name);
          }
          if (found.vehicle_plate) {
            setLicensePlate(found.vehicle_plate);
          }
          // Fetch quote details to get services
          const quoteDetailRes = await fetch(`/api/internal/quotes/${quoteId}`, {
            cache: "no-store",
          });
          if (quoteDetailRes.ok) {
            const detail = await quoteDetailRes.json();
            const qData = detail;
            if (qData.services && Array.isArray(qData.services)) {
              setServices(
                qData.services.map((s: { id?: string; name: string; price: number; quantity: number }, idx: number) => ({
                  id: s.id || `srv_${idx}`,
                  name: s.name,
                  price: s.price,
                  quantity: s.quantity || 1,
                }))
              );
            }
          }
        }
      } catch (err) {
        console.warn("Lỗi load quote:", err);
      } finally {
        if (!ignore) setInitLoading(false);
      }
    }

    loadQuote();
    return () => {
      ignore = true;
    };
  }, [quoteId]);

  function handleAddServiceFromCatalog() {
    if (!selectedCatalogId) return;
    const item = catalog.find((c) => c.id === selectedCatalogId);
    if (!item) return;

    setServices((prev) => [
      ...prev,
      {
        id: `srv_${Date.now()}`,
        name: item.name,
        price: item.suggested_price,
        quantity: 1,
      },
    ]);
    setSelectedCatalogId("");
  }

  function handleAddCustomService() {
    setServices((prev) => [
      ...prev,
      {
        id: `srv_${Date.now()}`,
        name: "Dịch vụ mới",
        price: 1000000,
        quantity: 1,
      },
    ]);
  }

  function handleUpdateService(index: number, field: string, val: string | number) {
    setServices((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  }

  function handleRemoveService(index: number) {
    setServices((prev) => prev.filter((_, i) => i !== index));
  }

  const subtotal = services.reduce((sum, s) => sum + s.price * s.quantity, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!customerName.trim() || !customerPhone.trim()) {
      setError("Vui lòng nhập tên và số điện thoại khách hàng.");
      return;
    }

    if (services.length === 0) {
      setError("Hồ sơ cần ít nhất một dịch vụ thực hiện.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        quote_id: quoteId || undefined,
        customer: {
          name: customerName.trim(),
          phone: customerPhone.trim(),
          type: customerType,
          company_name: customerType === "company" ? companyName.trim() : undefined,
          tax_id: customerType === "company" ? taxId.trim() : undefined,
          zalo_name: zaloName.trim() || undefined,
          address: customerAddress.trim() || undefined,
        },
        vehicles:
          vehicleMode === "single"
            ? [
                {
                  license_plate: licensePlate.trim().toUpperCase() || undefined,
                  owner_name: ownerName.trim() || customerName.trim(),
                  brand: vehicleBrand.trim() || undefined,
                  model: vehicleModel.trim() || undefined,
                  vehicle_count: 1,
                },
              ]
            : [
                {
                  fleet_description: fleetDesc.trim() || "Đội xe",
                  vehicle_count: fleetCount || 1,
                },
              ],
        services,
        documents: documents.map((d) => ({
          name: d.name,
          status: d.status,
          note: d.note,
        })),
        notes: notes.trim() || undefined,
      };

      const res = await fetch("/api/internal/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể tạo hồ sơ");
      }

      router.push(`/quanly/cases/${data.id || data.case?.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  if (initLoading) {
    return (
      <div className="quanly-content-container text-center py-20 text-gray-400">
        Đang nạp dữ liệu từ báo giá...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="quanly-content-container max-w-5xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/quanly/cases"
              className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-gray-900 border border-gray-800"
            >
              ← Danh sách hồ sơ
            </Link>
            {quoteId && (
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40">
                Chuyển từ báo giá: {quoteId}
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight mt-2">
            📂 Tiếp nhận Hồ sơ Xử lý Mới
          </h1>
          <p className="text-xs text-gray-400">
            Khởi tạo hồ sơ, ghi nhận phương tiện, checklist giấy tờ và giá trị thực hiện
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="quanly-btn-primary self-start sm:self-auto text-xs flex items-center gap-1.5"
        >
          {loading ? "Đang lưu..." : "✓ Xác nhận tiếp nhận hồ sơ"}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300">
          ⚠️ {error}
        </div>
      )}

      {/* Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Customer & Vehicles */}
        <div className="space-y-6">
          {/* Section: Customer Information */}
          <div className="quanly-card">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <span>👤</span> Thông tin khách hàng
            </h2>

            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="custType"
                  checked={customerType === "individual"}
                  onChange={() => setCustomerType("individual")}
                  className="accent-[#d4af37]"
                />
                Cá nhân
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="custType"
                  checked={customerType === "company"}
                  onChange={() => setCustomerType("company")}
                  className="accent-[#d4af37]"
                />
                Doanh nghiệp / Tổ chức
              </label>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">
                  Họ tên người liên hệ / Đại diện *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn Tuấn"
                  className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="0908xxxxxx"
                    className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Tên Zalo (nếu có)</label>
                  <input
                    type="text"
                    value={zaloName}
                    onChange={(e) => setZaloName(e.target.value)}
                    placeholder="Zalo khách"
                    className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              {customerType === "company" && (
                <div className="p-3 bg-black/40 border border-gray-800 rounded-lg space-y-3 mt-2">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Tên doanh nghiệp</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Công ty Cổ phần / TNHH..."
                      className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Mã số thuế (MST)</label>
                    <input
                      type="text"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      placeholder="03xxxxxxxx"
                      className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Địa chỉ khách hàng</label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Quận/Huyện, Tỉnh/TP..."
                  className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>
          </div>

          {/* Section: Vehicle / Fleet Information */}
          <div className="quanly-card">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>🚗</span> Thông tin phương tiện tiếp nhận
              </h2>
              <label className="cursor-pointer px-2.5 py-1 rounded bg-[#d4af37]/10 border border-[#d4af37]/30 text-[#d4af37] text-[11px] font-semibold hover:bg-[#d4af37]/20 transition flex items-center gap-1.5">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleOcrUpload}
                  className="hidden"
                />
                <span>{ocrLoading ? "⚡ Đang quét AI..." : "📸 Quét Cà vẹt bằng Gemini AI"}</span>
              </label>
            </div>

            {/* OCR Status Banner */}
            {ocrStatus === "scanning" && (
              <div className="p-2.5 bg-amber-950/40 border border-amber-800/60 rounded-xl text-xs text-amber-300 flex items-center gap-2 mb-4 animate-pulse">
                ⚡ Đang kết nối Gemini 2.5 Flash để đọc số khung, số máy, biển số và tên chủ xe...
              </div>
            )}
            {ocrStatus === "success" && (
              <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center justify-between mb-4">
                <span>✓ Đã nhận diện thành công ({ocrConfidence === "high" ? "Độ tin cậy 95%" : "Độ tin cậy 75%"}) • Tự động điền dữ liệu xe</span>
                {ocrStoragePath && <span className="text-[10px] text-emerald-400/70 font-mono">Đã lưu trữ private</span>}
              </div>
            )}
            {ocrStatus === "error" && (
              <div className="p-2.5 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2 mb-4">
                ⚠️ Không thể nhận diện tự động từ ảnh. Vui lòng nhập thông tin xe thủ công bên dưới.
              </div>
            )}

            {ocrPreview && (
              <div className="mb-4 border border-gray-800 rounded-lg overflow-hidden max-h-36 flex items-center justify-center bg-black/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ocrPreview} alt="Cà vẹt xe" className="max-h-36 object-contain" />
              </div>
            )}

            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="vMode"
                  checked={vehicleMode === "single"}
                  onChange={() => setVehicleMode("single")}
                  className="accent-[#d4af37]"
                />
                1 xe cụ thể
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                <input
                  type="radio"
                  name="vMode"
                  checked={vehicleMode === "fleet"}
                  onChange={() => setVehicleMode("fleet")}
                  className="accent-[#d4af37]"
                />
                Đội xe / Lô nhiều xe
              </label>
            </div>

            {vehicleMode === "single" ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Biển số xe</label>
                    <input
                      type="text"
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value)}
                      placeholder="51K-892.45"
                      className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white uppercase font-mono focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Tên chủ trên cavet</label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Tên chủ xe"
                      className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Hãng xe (Brand)</label>
                    <input
                      type="text"
                      value={vehicleBrand}
                      onChange={(e) => setVehicleBrand(e.target.value)}
                      placeholder="Toyota, Ford, Hyundai..."
                      className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Dòng xe / Đời xe</label>
                    <input
                      type="text"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="Innova 2021..."
                      className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">
                    Mô tả lô xe / Đội xe
                  </label>
                  <input
                    type="text"
                    value={fleetDesc}
                    onChange={(e) => setFleetDesc(e.target.value)}
                    placeholder="Ví dụ: Đội 5 xe tải Hino vận chuyển hàng Tân Bình"
                    className="w-full bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Số lượng xe</label>
                  <input
                    type="number"
                    min={1}
                    value={fleetCount}
                    onChange={(e) => setFleetCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-32 bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Services & Document Checklist */}
        <div className="space-y-6">
          {/* Section: Services Cart */}
          <div className="quanly-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>📋</span> Dịch vụ pháp lý cần xử lý
              </h2>
              <span className="text-xs font-mono font-bold text-emerald-400">
                Tổng: {subtotal.toLocaleString("vi-VN")}đ
              </span>
            </div>

            {/* Catalog Selector */}
            <div className="flex gap-2 mb-4">
              <select
                value={selectedCatalogId}
                onChange={(e) => setSelectedCatalogId(e.target.value)}
                className="flex-1 bg-[#0d1017] border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-300 focus:outline-none focus:border-[#d4af37]"
              >
                <option value="">-- Chọn dịch vụ từ danh mục chuẩn --</option>
                {catalog.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.suggested_price.toLocaleString("vi-VN")}đ)
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddServiceFromCatalog}
                className="px-3 py-2 rounded-lg bg-gray-800 text-xs text-gray-200 hover:text-white hover:bg-gray-700 whitespace-nowrap"
              >
                + Thêm
              </button>
            </div>

            {/* Services List */}
            <div className="space-y-3">
              {services.map((s, idx) => (
                <div
                  key={s.id}
                  className="p-3 bg-black/40 border border-gray-800/80 rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={s.name}
                      onChange={(e) => handleUpdateService(idx, "name", e.target.value)}
                      className="flex-1 bg-transparent text-xs font-semibold text-white focus:outline-none focus:border-b border-[#d4af37]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveService(idx)}
                      className="text-gray-500 hover:text-red-400 text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-500">Đơn giá:</span>
                      <input
                        type="number"
                        value={s.price}
                        onChange={(e) =>
                          handleUpdateService(idx, "price", parseInt(e.target.value) || 0)
                        }
                        className="w-28 bg-[#0d1017] border border-gray-800 rounded px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-500">SL:</span>
                      <input
                        type="number"
                        min={1}
                        value={s.quantity}
                        onChange={(e) =>
                          handleUpdateService(idx, "quantity", parseInt(e.target.value) || 1)
                        }
                        className="w-14 bg-[#0d1017] border border-gray-800 rounded px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                    <span className="text-xs font-mono font-semibold text-emerald-400 ml-auto">
                      {(s.price * s.quantity).toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddCustomService}
                className="w-full py-2 border border-dashed border-gray-800 rounded-lg text-xs text-gray-400 hover:text-white hover:border-gray-600 transition"
              >
                + Thêm dịch vụ tùy biến khác
              </button>
            </div>
          </div>

          {/* Section: Document Checklist */}
          <div className="quanly-card">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <span>📑</span> Checklist Giấy tờ tiếp nhận
            </h2>
            <p className="text-[11px] text-gray-400 mb-3">
              Đánh dấu các giấy tờ đã nhận từ khách hàng tại thời điểm bàn giao
            </p>

            <div className="space-y-2">
              {documents.map((d, idx) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-2.5 bg-black/40 border border-gray-800 rounded-lg"
                >
                  <span className="text-xs text-gray-200">{d.name}</span>
                  <select
                    value={d.status}
                    onChange={(e) => {
                      const copy = [...documents];
                      copy[idx].status = e.target.value as "required" | "received" | "missing";
                      setDocuments(copy);
                    }}
                    className={`text-[11px] font-medium px-2 py-1 rounded border focus:outline-none ${
                      d.status === "received"
                        ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/40"
                        : "bg-gray-900 text-gray-400 border-gray-800"
                    }`}
                  >
                    <option value="required">Cần thu</option>
                    <option value="received">Đã nhận</option>
                    <option value="missing">Thiếu/Bổ sung sau</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Notes */}
          <div className="quanly-card">
            <label className="block text-xs font-bold text-white mb-2">
              📝 Ghi chú yêu cầu xử lý
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ví dụ: Khách cần gấp ngày thứ 6, đã gửi giấy ủy quyền gốc..."
              className="w-full bg-[#0d1017] border border-gray-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#d4af37]"
            />
          </div>
        </div>
      </div>
    </form>
  );
}

export default function CaseCreatePage() {
  return (
    <Suspense
      fallback={
        <div className="quanly-content-container text-center py-20 text-gray-400">
          Đang tải giao diện tiếp nhận hồ sơ...
        </div>
      }
    >
      <CaseCreateForm />
    </Suspense>
  );
}
