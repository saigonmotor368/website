"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { QuoteData } from "../quote-types";
import QuotePreview from "../components/QuotePreview";
import { generateQuotePdf } from "@/lib/generate-quote-pdf";

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
}

interface DocItem {
  id: string;
  name: string;
  quantity: number;
  note?: string;
}

interface CatalogService {
  id: string;
  code: string;
  group_name: string;
  name: string;
  vehicle_type: string;
  cost_price?: number;
  suggested_price: number;
}

export default function CreateQuotePage() {
  const router = useRouter();
  const [editId, setEditId] = useState<string | null>(null);
  const [quoteNumber, setQuoteNumber] = useState("");
  const [quoteCreatedAt, setQuoteCreatedAt] = useState<Date>(new Date());
  const [quoteStatus, setQuoteStatus] = useState<"draft" | "issued">("draft");
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [loadQuoteError, setLoadQuoteError] = useState("");
  const [pdfQuoteData, setPdfQuoteData] = useState<QuoteData | null>(null);
  const [pendingPdf, setPendingPdf] = useState(false);
  const [pdfAction, setPdfAction] = useState<"issue" | "download">("issue");
  const [showPreview, setShowPreview] = useState(false);

  // Step 1: Customer state
  const [customerType, setCustomerType] = useState<"individual" | "company">("individual");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [zaloName, setZaloName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [address, setAddress] = useState("");

  // Customer search suggestions
  const [searchResults, setSearchResults] = useState<Array<{
    name: string;
    phone: string;
    company_name?: string;
    zalo_name?: string;
    tax_id?: string;
    address?: string;
  }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Step 2: Vehicles state
  const [vehicleMode, setVehicleMode] = useState<"single" | "multiple" | "fleet">("single");
  const [licensePlate, setLicensePlate] = useState("");
  const [vehicleBrand, setVehicleBrand] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [fleetDesc, setFleetDesc] = useState("");
  const [fleetCount, setFleetCount] = useState(1);

  // Step 3: Services & Catalog state
  const [catalog, setCatalog] = useState<CatalogService[]>([]);
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  const [serviceSearch, setServiceSearch] = useState("");

  // Step 4: Documents state
  const [documents, setDocuments] = useState<DocItem[]>([
    { id: "doc_1", name: "Giấy đăng ký xe (Cà-vẹt gốc)", quantity: 1, note: "Bản chính" },
    { id: "doc_2", name: "CCCD gắn chip của chủ xe", quantity: 2, note: "Bản sao công chứng" },
    { id: "doc_3", name: "Hợp đồng mua bán / Chuyển nhượng xe", quantity: 2, note: "Đã công chứng" },
  ]);

  // General settings
  const [vatRate, setVatRate] = useState(0);
  const [quoteNotes, setQuoteNotes] = useState("Báo giá có giá trị trong vòng 15 ngày kể từ ngày phát hành.");
  const [saving, setSaving] = useState(false);

  // Load catalog on mount
  useEffect(() => {
    let ignore = false;
    fetch("/api/internal/service-catalog")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!ignore && data?.services) {
          setCatalog(data.services);
        }
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  // Mở lại báo giá đã lưu để tiếp tục chỉnh sửa hoặc phát hành.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("edit");
    if (!id) return;

    let ignore = false;
    const timer = window.setTimeout(() => {
      setEditId(id);
      setLoadingQuote(true);
      setLoadQuoteError("");

      fetch(`/api/internal/quotes/${encodeURIComponent(id)}`, { cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || "Không thể tải báo giá");
        return data;
      })
      .then((data) => {
        if (ignore) return;

        setQuoteNumber(data.quoteNumber || id);
        setQuoteCreatedAt(data.createdAt ? new Date(data.createdAt) : new Date());
        setQuoteStatus(data.status === "issued" ? "issued" : "draft");
        setCustomerType(data.customer?.type === "company" ? "company" : "individual");
        setCustomerName(data.customer?.name || "");
        setCustomerPhone(data.customer?.phone || "");
        setZaloName(data.customer?.zalo_name || "");
        setCompanyName(data.customer?.company_name || "");
        setTaxId(data.customer?.tax_id || "");
        setAddress(data.customer?.address || "");

        const vehicle = data.vehicles?.[0];
        if (vehicle?.description || Number(vehicle?.quantity) > 1) {
          setVehicleMode("fleet");
          setFleetDesc(vehicle.description || "");
          setFleetCount(Math.max(1, Number(vehicle.quantity) || 1));
        } else {
          setVehicleMode("single");
          setLicensePlate(vehicle?.license_plate || "");
          setVehicleBrand(vehicle?.brand || "");
          setVehicleModel(vehicle?.model || "");
        }

        setSelectedServices(Array.isArray(data.services) ? data.services : []);
        setDocuments(Array.isArray(data.documents) ? data.documents : []);
        setVatRate(Number(data.vatRate) || 0);
        setQuoteNotes(data.notes || "");
      })
      .catch((error: unknown) => {
        if (!ignore) {
          setLoadQuoteError(error instanceof Error ? error.message : "Không thể tải báo giá");
        }
      })
      .finally(() => {
        if (!ignore) setLoadingQuote(false);
      });
    }, 0);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, []);

  // Search existing customer as user types phone
  const searchCustomer = async (term: string) => {
    if (term.length < 3) {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await fetch(`/api/internal/customers?q=${encodeURIComponent(term)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data || []);
        setShowSuggestions(true);
      }
    } catch {
      // ignore
    }
  };

  const selectExistingCustomer = (c: typeof searchResults[0]) => {
    setCustomerName(c.name);
    setCustomerPhone(c.phone);
    if (c.company_name) {
      setCustomerType("company");
      setCompanyName(c.company_name);
    }
    if (c.zalo_name) setZaloName(c.zalo_name);
    if (c.tax_id) setTaxId(c.tax_id);
    if (c.address) setAddress(c.address);
    setShowSuggestions(false);
  };

  const addServiceFromCatalog = (cat: CatalogService) => {
    if (selectedServices.some((s) => s.id === cat.id)) return;
    setSelectedServices([
      ...selectedServices,
      {
        id: cat.id,
        name: cat.name,
        price: cat.suggested_price,
        quantity: 1,
        note: "",
      },
    ]);
    setServiceSearch("");
  };

  const addCustomService = () => {
    const newId = `custom_${Date.now()}`;
    setSelectedServices([
      ...selectedServices,
      {
        id: newId,
        name: "Dịch vụ theo yêu cầu",
        price: 1000000,
        quantity: 1,
        note: "",
      },
    ]);
  };

  const updateService = (id: string, field: keyof ServiceItem, value: string | number) => {
    setSelectedServices(
      selectedServices.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const removeService = (id: string) => {
    setSelectedServices(selectedServices.filter((s) => s.id !== id));
  };

  const addDocument = () => {
    setDocuments([
      ...documents,
      {
        id: `doc_${Date.now()}`,
        name: "Giấy tờ bổ sung",
        quantity: 1,
        note: "",
      },
    ]);
  };

  const removeDocument = (id: string) => {
    setDocuments(documents.filter((d) => d.id !== id));
  };

  // Calculations
  const subtotal = selectedServices.reduce((sum, s) => sum + s.price * s.quantity, 0);
  const vatAmount = subtotal * (vatRate / 100);
  const totalAmount = Math.round(subtotal + vatAmount);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const normalizedServiceSearch = serviceSearch.trim().toLowerCase();
  const suggestedServices = normalizedServiceSearch
    ? catalog
        .filter((service) => !selectedServices.some((selected) => selected.id === service.id))
        .filter((service) =>
          `${service.code} ${service.name} ${service.group_name} ${service.vehicle_type}`
            .toLowerCase()
            .includes(normalizedServiceSearch)
        )
        .slice(0, 8)
    : [];

  const buildPdfQuoteData = (
    savedQuoteNumber: string,
    status: "draft" | "issued"
  ): QuoteData => ({
    id: editId || undefined,
    customer: {
      name: customerName.trim(),
      phone: customerPhone.trim(),
      zaloName: zaloName.trim() || undefined,
      companyName: companyName.trim() || undefined,
      address: address.trim() || undefined,
    },
    vehicle:
      vehicleMode === "fleet"
        ? {
            ownerName: customerName.trim(),
            licensePlate: "",
            frameNumber: "",
            engineNumber: "",
            brand: "Đội xe / Lô xe",
            model: fleetDesc.trim() || `${fleetCount} xe`,
            color: "",
            yearOfManufacture: new Date().getFullYear(),
            vehicleType: "car",
            registeredProvince: "",
          }
        : licensePlate || vehicleBrand || vehicleModel
          ? {
              ownerName: customerName.trim(),
              licensePlate: licensePlate.trim(),
              frameNumber: "",
              engineNumber: "",
              brand: vehicleBrand.trim(),
              model: vehicleModel.trim(),
              color: "",
              yearOfManufacture: new Date().getFullYear(),
              vehicleType: "car",
              registeredProvince: "",
            }
          : null,
    services: selectedServices,
    documents,
    createdAt: quoteCreatedAt,
    quoteNumber: savedQuoteNumber,
    vatRate,
    includeRegistrationFee: false,
    note: quoteNotes,
    status,
  });

  useEffect(() => {
    if (!pendingPdf || !pdfQuoteData) return;
    let cancelled = false;

    const exportIssuedQuote = async () => {
      try {
        if (document.fonts?.ready) await document.fonts.ready;
        const preview = document.getElementById("quote-preview");
        if (preview) {
          const images = Array.from(preview.querySelectorAll("img"));
          await Promise.all(images.map((image) => image.decode?.().catch(() => undefined)));
        }

        const safeCustomer = pdfQuoteData.customer.name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/Đ/g, "D")
          .replace(/[^a-zA-Z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "");
        const filename = `BaoGia_${pdfQuoteData.quoteNumber}_${safeCustomer || "KhachHang"}.pdf`;
        const success = await generateQuotePdf("quote-preview", filename);
        if (cancelled) return;

        if (success) {
          if (pdfAction === "issue") {
            alert(`Đã phát hành báo giá ${pdfQuoteData.quoteNumber} và tải file PDF chính thức.`);
            router.push("/quanly/quotes");
            router.refresh();
          } else {
            alert(`Đã tải lại báo giá ${pdfQuoteData.quoteNumber}.`);
          }
        } else {
          alert(pdfAction === "issue"
            ? "Báo giá đã được phát hành nhưng chưa thể tạo file PDF. Anh/chị có thể bấm Tải lại PDF để thử lại."
            : "Chưa thể tạo file PDF. Anh/chị vui lòng thử lại.");
        }
      } finally {
        if (!cancelled) {
          setPendingPdf(false);
          setSaving(false);
        }
      }
    };

    void exportIssuedQuote();
    return () => {
      cancelled = true;
    };
  }, [pdfAction, pdfQuoteData, pendingPdf, router]);

  const handleSaveQuote = async (status: "draft" | "issued") => {
    if (!customerName.trim()) {
      alert("Vui lòng nhập họ tên khách hàng hoặc người liên hệ.");
      return;
    }
    if (!customerPhone.trim() && !zaloName.trim()) {
      alert("Vui lòng nhập số điện thoại hoặc tên Zalo để có thông tin liên hệ với khách hàng.");
      return;
    }
    if (selectedServices.length === 0) {
      alert("Vui lòng thêm ít nhất 1 dịch vụ.");
      return;
    }

    setSaving(true);
    let waitForPdf = false;
    try {
      const payload = {
        customer: {
          name: customerName,
          phone: customerPhone,
          type: customerType,
          company_name: companyName || undefined,
          tax_id: taxId || undefined,
          zalo_name: zaloName || undefined,
          address: address || undefined,
        },
        vehicles: [
          vehicleMode === "fleet"
            ? {
                vehicle_type: "car",
                description: fleetDesc,
                quantity: fleetCount,
              }
            : {
                license_plate: licensePlate,
                brand: vehicleBrand,
                model: vehicleModel,
                vehicle_type: "car",
              },
        ],
        services: selectedServices,
        documents,
        status,
        vatRate,
        notes: quoteNotes,
      };

      const requestUrl = editId
        ? `/api/internal/quotes/${encodeURIComponent(editId)}`
        : "/api/internal/quotes";
      const res = await fetch(requestUrl, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const savedNumber = data.quoteNumber || quoteNumber;
        setQuoteNumber(savedNumber);
        setQuoteStatus(status);

        if (status === "issued") {
          waitForPdf = true;
          setPdfAction("issue");
          setShowPreview(false);
          setPdfQuoteData(buildPdfQuoteData(savedNumber, "issued"));
          setPendingPdf(true);
        } else {
          alert(`Đã lưu bản nháp báo giá! Mã: ${savedNumber}`);
          router.push("/quanly/quotes");
          router.refresh();
        }
      } else {
        const err = await res.json();
        alert(err.error || "Không thể lưu báo giá.");
      }
    } catch {
      alert("Lỗi kết nối.");
    } finally {
      if (!waitForPdf) setSaving(false);
    }
  };

  const handleDownloadIssuedPdf = () => {
    if (!quoteNumber) {
      alert("Chưa có mã báo giá để tải PDF.");
      return;
    }

    setSaving(true);
    setPdfAction("download");
    setPdfQuoteData(buildPdfQuoteData(quoteNumber, "issued"));
    setPendingPdf(true);
  };

  const handlePrimaryPdfAction = () => {
    if (editId && quoteStatus === "issued") {
      handleDownloadIssuedPdf();
      return;
    }
    void handleSaveQuote("issued");
  };

  const isIssuedQuote = Boolean(editId && quoteStatus === "issued");

  if (loadingQuote) {
    return (
      <div className="quanly-card mx-auto max-w-3xl py-16 text-center text-sm text-gray-400">
        Đang tải nội dung báo giá để chỉnh sửa...
      </div>
    );
  }

  if (loadQuoteError) {
    return (
      <div className="quanly-card mx-auto max-w-3xl py-16 text-center">
        <div className="font-semibold text-rose-300">{loadQuoteError}</div>
        <Link href="/quanly/quotes" className="quanly-btn-secondary mt-5 inline-flex">
          Quay lại danh sách báo giá
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Link href="/quanly/quotes" className="hover:underline">Báo giá</Link>
            <span>/</span>
            <span className="text-gray-200">{editId ? "Chỉnh sửa báo giá" : "Lập báo giá mới"}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-white">
              {editId ? `Báo giá ${quoteNumber}` : "Tạo Báo Giá Dịch Vụ Mới"}
            </h1>
            {editId && (
              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${quoteStatus === "issued" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-gray-600 bg-gray-800 text-gray-300"}`}>
                {quoteStatus === "issued" ? "Đã phát hành" : "Bản nháp"}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            disabled={saving}
            className="quanly-btn-secondary"
          >
            Xem trước
          </button>
          {!isIssuedQuote && (
            <button
              onClick={() => void handleSaveQuote("draft")}
              disabled={saving}
              className="quanly-btn-secondary"
            >
              Lưu bản nháp
            </button>
          )}
          <button
            onClick={handlePrimaryPdfAction}
            disabled={saving}
            className="quanly-btn-gold"
          >
            {saving ? "Đang xử lý..." : isIssuedQuote ? "↻ Tải lại PDF" : "✓ Phát hành & tải PDF"}
          </button>
        </div>
      </div>

      {/* Section 1: Customer Info */}
      <div className="quanly-card space-y-4">
        <h2 className="text-base font-bold text-[#d4af37] border-b border-gray-800 pb-2 flex items-center justify-between">
          <span>1. Thông tin khách hàng</span>
          <span className="text-xs font-normal text-gray-400">Hỗ trợ cá nhân & doanh nghiệp</span>
        </h2>

        {/* Customer Type Radio */}
        <div className="flex gap-6 text-xs text-gray-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={customerType === "individual"}
              onChange={() => setCustomerType("individual")}
            />
            <span className="font-medium">Khách hàng cá nhân</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={customerType === "company"}
              onChange={() => setCustomerType("company")}
            />
            <span className="font-medium">Khách hàng doanh nghiệp</span>
          </label>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="relative">
            <label className="block text-gray-400 mb-1">Họ tên khách hàng / Người liên hệ *</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                void searchCustomer(e.target.value);
              }}
              placeholder="Ví dụ: Nguyễn Văn A"
              className="w-full bg-[#0d1017] border border-gray-700 rounded-lg p-2.5 text-gray-200 focus:outline-none focus:border-[#d4af37]"
            />
            {/* Auto suggestions */}
            {showSuggestions && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-[#1a202c] border border-gray-700 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
                {searchResults.map((c, i) => (
                  <div
                    key={i}
                    onClick={() => selectExistingCustomer(c)}
                    className="p-2.5 hover:bg-white/10 cursor-pointer border-b border-gray-800 last:border-b-0"
                  >
                    <div className="font-semibold text-white">{c.name}</div>
                    <div className="text-[11px] text-gray-400">
                      {c.phone || (c.zalo_name ? `Zalo: ${c.zalo_name}` : "Chưa có thông tin liên hệ")}
                    </div>
                    {c.company_name && <div className="text-[11px] text-gray-400">{c.company_name}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Số điện thoại (nếu có)</label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => {
                setCustomerPhone(e.target.value);
                void searchCustomer(e.target.value);
              }}
              placeholder="0901234567"
              className="w-full bg-[#0d1017] border border-gray-700 rounded-lg p-2.5 text-gray-200 font-mono focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Tên Zalo / tài khoản liên hệ</label>
            <input
              type="text"
              value={zaloName}
              onChange={(e) => setZaloName(e.target.value)}
              placeholder="Tên tài khoản Zalo"
              className="w-full bg-[#0d1017] border border-gray-700 rounded-lg p-2.5 text-gray-200 focus:outline-none focus:border-[#d4af37]"
            />
            <p className="mt-1.5 text-[10px] leading-relaxed text-gray-600">
              Chỉ cần có số điện thoại hoặc tên Zalo.
            </p>
          </div>
        </div>

        {customerType === "company" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-gray-800">
            <div>
              <label className="block text-gray-400 mb-1">Tên công ty / Doanh nghiệp</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Công ty TNHH Vận Tải ABC"
                className="w-full bg-[#0d1017] border border-gray-700 rounded-lg p-2.5 text-gray-200 focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Mã số thuế (MST)</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                placeholder="0312345678"
                className="w-full bg-[#0d1017] border border-gray-700 rounded-lg p-2.5 text-gray-200 font-mono focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-gray-400 mb-1 text-xs">Địa chỉ khách hàng</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố..."
            className="w-full bg-[#0d1017] border border-gray-700 rounded-lg p-2.5 text-gray-200 text-xs focus:outline-none focus:border-[#d4af37]"
          />
        </div>
      </div>

      {/* Section 2: Vehicles Info */}
      <div className="quanly-card space-y-4">
        <h2 className="text-base font-bold text-[#d4af37] border-b border-gray-800 pb-2 flex items-center justify-between">
          <span>2. Thông tin xe / Phương tiện</span>
          <div className="flex gap-4 text-xs font-normal">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                checked={vehicleMode === "single"}
                onChange={() => setVehicleMode("single")}
              />
              <span>1 Xe</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                checked={vehicleMode === "fleet"}
                onChange={() => setVehicleMode("fleet")}
              />
              <span>Đội xe / Lô xe</span>
            </label>
          </div>
        </h2>

        {vehicleMode === "single" ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-gray-400 mb-1">Biển số xe</label>
              <input
                type="text"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                placeholder="VD: 51H-123.45"
                className="w-full bg-[#0d1017] border border-gray-700 rounded-lg p-2.5 text-gray-200 font-mono font-bold focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Hãng xe</label>
              <input
                type="text"
                value={vehicleBrand}
                onChange={(e) => setVehicleBrand(e.target.value)}
                placeholder="VD: Toyota, Honda, Mazda..."
                className="w-full bg-[#0d1017] border border-gray-700 rounded-lg p-2.5 text-gray-200 focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Dòng xe / Model</label>
              <input
                type="text"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="VD: Camry, Fortuner, SH 150i..."
                className="w-full bg-[#0d1017] border border-gray-700 rounded-lg p-2.5 text-gray-200 focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block text-gray-400 mb-1">Mô tả đội xe / Lô xe doanh nghiệp</label>
              <input
                type="text"
                value={fleetDesc}
                onChange={(e) => setFleetDesc(e.target.value)}
                placeholder="VD: Đội 10 xe tải Hino giao nhận hàng, 5 xe bán tải công ty..."
                className="w-full bg-[#0d1017] border border-gray-700 rounded-lg p-2.5 text-gray-200 focus:outline-none focus:border-[#d4af37]"
              />
            </div>
            <div>
              <label className="block text-gray-400 mb-1">Số lượng xe dự kiến</label>
              <input
                type="number"
                min="1"
                value={fleetCount}
                onChange={(e) => setFleetCount(Number(e.target.value) || 1)}
                className="w-full bg-[#0d1017] border border-gray-700 rounded-lg p-2.5 text-gray-200 font-mono text-center focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Services Cart */}
      <div className="quanly-card space-y-5 !p-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 sm:px-6 py-5 border-b border-white/5 bg-gradient-to-r from-[#171d29] to-[#131822] gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#d4af37]/15 text-[#e8c766]">🛒</span>
              <h2 className="text-lg font-bold text-white">3. Chọn dịch vụ cần báo giá</h2>
            </div>
            <p className="text-xs text-gray-500 mt-2 sm:ml-10">Chọn từ danh mục chuẩn hoặc thêm một dòng riêng cho hồ sơ đặc thù.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-[#d4af37]/25 bg-[#d4af37]/10 px-3 py-1.5 text-xs text-[#e8c766]">{selectedServices.length} dịch vụ đã chọn</span>
            <button type="button" onClick={addCustomService} className="quanly-btn-secondary !py-1.5 !px-3 text-xs">＋ Dòng tự nhập</button>
          </div>
        </div>

        <div className="relative z-20 px-5 sm:px-6">
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">⌕</span>
            <input
              type="search"
              value={serviceSearch}
              onChange={(e) => setServiceSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setServiceSearch("");
              }}
              placeholder="Nhập tên hoặc mã dịch vụ để tìm và thêm..."
              aria-label="Tìm dịch vụ cần báo giá"
              role="combobox"
              aria-autocomplete="list"
              aria-controls="service-suggestions"
              aria-expanded={Boolean(normalizedServiceSearch)}
              className="w-full rounded-xl border border-gray-700 bg-[#0d1017] py-3 pl-10 pr-4 text-sm text-gray-200 shadow-inner outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/10"
            />

            {normalizedServiceSearch && (
              <div id="service-suggestions" className="absolute left-0 right-0 top-[calc(100%+8px)] overflow-hidden rounded-xl border border-gray-700 bg-[#111620] shadow-2xl shadow-black/60">
                {suggestedServices.length > 0 ? (
                  <div className="max-h-72 overflow-y-auto p-1.5">
                    {suggestedServices.map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => addServiceFromCatalog(service)}
                        className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-white/[0.06] focus:bg-white/[0.06] focus:outline-none"
                      >
                        <span className="hidden shrink-0 rounded bg-white/5 px-1.5 py-1 font-mono text-[9px] text-gray-500 sm:inline">
                          {service.code}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-gray-100">
                            {service.name}
                          </span>
                          <span className="mt-0.5 block truncate text-[11px] text-gray-500">
                            {service.vehicle_type === "car" ? "Ô tô" : service.vehicle_type === "motorbike" ? "Xe máy" : "Mọi loại xe"}
                            <span className="px-1.5 text-gray-700">•</span>
                            {service.group_name.replace(/^Nhóm \d+:\s*/, "")}
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block font-mono text-xs font-bold text-emerald-400">
                            {formatMoney(service.suggested_price)}
                          </span>
                          <span className="mt-0.5 block text-[11px] font-bold text-[#d4af37] group-hover:text-[#f1d66f]">
                            + Thêm
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-4 text-center text-xs text-gray-500">
                    Không tìm thấy dịch vụ phù hợp. Anh/chị có thể chọn “Dòng tự nhập”.
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="mt-2 text-[11px] text-gray-600">
            Gõ một phần tên dịch vụ, loại xe hoặc mã dịch vụ.
          </p>
        </div>

        {/* Selected Services Table */}
        <div className="mx-5 sm:mx-6 overflow-x-auto border border-gray-800 rounded-xl bg-[#0e1219]">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="uppercase bg-black/40 text-gray-500 border-b border-gray-800">
              <tr>
                <th className="px-4 py-2.5">Tên dịch vụ</th>
                <th className="px-4 py-2.5 w-36">Đơn giá (VNĐ)</th>
                <th className="px-4 py-2.5 w-24 text-center">Số lượng</th>
                <th className="px-4 py-2.5 w-36 text-right">Thành tiền</th>
                <th className="px-4 py-2.5">Ghi chú</th>
                <th className="px-4 py-2.5 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {selectedServices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    <span className="block text-2xl mb-2">🧾</span>Chưa có dịch vụ nào. Anh/chị hãy chọn từ danh mục phía trên.
                  </td>
                </tr>
              ) : (
                selectedServices.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-2.5 font-medium text-white">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateService(item.id, "name", e.target.value)}
                        className="w-full bg-transparent border-b border-transparent focus:border-gray-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="number"
                        step="50000"
                        value={item.price}
                        onChange={(e) => updateService(item.id, "price", Number(e.target.value))}
                        className="w-full bg-[#0d1017] border border-gray-700 rounded px-2 py-1 font-mono text-gray-200 focus:outline-none focus:border-[#d4af37]"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateService(item.id, "quantity", Number(e.target.value) || 1)}
                        className="w-16 bg-[#0d1017] border border-gray-700 rounded px-2 py-1 font-mono text-center text-gray-200 focus:outline-none focus:border-[#d4af37]"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-400">
                      {formatMoney(item.price * item.quantity)}
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="text"
                        value={item.note || ""}
                        onChange={(e) => updateService(item.id, "note", e.target.value)}
                        placeholder="Ghi chú chi tiết..."
                        className="w-full bg-transparent border-b border-transparent focus:border-gray-500 text-gray-400 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => removeService(item.id)}
                        className="text-gray-500 hover:text-red-400 text-sm"
                        title="Xóa dòng này"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pricing Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 px-5 sm:px-6 py-5 border-t border-gray-800 bg-black/15">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-gray-400">Thuế GTGT (VAT):</span>
            <select
              value={vatRate}
              onChange={(e) => setVatRate(Number(e.target.value))}
              className="bg-[#0d1017] border border-gray-700 rounded px-3 py-1.5 text-xs text-gray-200 focus:outline-none"
            >
              <option value={0}>0% (Không chịu thuế)</option>
              <option value={8}>8% (VAT ưu đãi)</option>
              <option value={10}>10% (VAT tiêu chuẩn)</option>
            </select>
          </div>

          <div className="text-right space-y-1">
            <div className="text-xs text-gray-400">
              Tổng tiền dịch vụ: <span className="font-mono text-white">{formatMoney(subtotal)}</span>
            </div>
            {vatRate > 0 && (
              <div className="text-xs text-gray-400">
                Tiền thuế VAT ({vatRate}%): <span className="font-mono text-white">{formatMoney(vatAmount)}</span>
              </div>
            )}
            <div className="text-base font-bold text-white pt-2 mt-2 border-t border-gray-700">
              TỔNG CỘNG: <span className="text-2xl font-mono text-emerald-400 ml-2">{formatMoney(totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Documents Checklist */}
      <div className="quanly-card space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-800">
          <h2 className="text-base font-bold text-[#d4af37]">
            4. Hồ sơ thủ tục cần chuẩn bị (Đính kèm báo giá)
          </h2>
          <button
            type="button"
            onClick={addDocument}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-700 hover:bg-gray-800 text-gray-300"
          >
            + Thêm giấy tờ
          </button>
        </div>

        <div className="space-y-2">
          {documents.map((doc, idx) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0d1017] border border-gray-800 text-xs"
            >
              <span className="text-gray-500 font-mono w-6">{idx + 1}.</span>
              <input
                type="text"
                value={doc.name}
                onChange={(e) => {
                  setDocuments(
                    documents.map((d) => (d.id === doc.id ? { ...d, name: e.target.value } : d))
                  );
                }}
                className="flex-1 bg-transparent text-gray-200 focus:outline-none"
              />
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500 text-[11px]">SL:</span>
                <input
                  type="number"
                  min="1"
                  value={doc.quantity}
                  onChange={(e) => {
                    setDocuments(
                      documents.map((d) => (d.id === doc.id ? { ...d, quantity: Number(e.target.value) || 1 } : d))
                    );
                  }}
                  className="w-12 bg-black/40 border border-gray-700 rounded text-center text-gray-200 py-0.5 focus:outline-none"
                />
              </div>
              <input
                type="text"
                value={doc.note || ""}
                onChange={(e) => {
                  setDocuments(
                    documents.map((d) => (d.id === doc.id ? { ...d, note: e.target.value } : d))
                  );
                }}
                placeholder="Ghi chú (bản chính / công chứng)..."
                className="w-48 bg-transparent text-gray-400 text-xs focus:outline-none border-b border-transparent focus:border-gray-700"
              />
              <button
                type="button"
                onClick={() => removeDocument(doc.id)}
                className="text-gray-500 hover:text-red-400 p-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-gray-400 mb-1 text-xs">Điều khoản & Ghi chú chung ở cuối báo giá</label>
          <textarea
            rows={2}
            value={quoteNotes}
            onChange={(e) => setQuoteNotes(e.target.value)}
            className="w-full bg-[#0d1017] border border-gray-700 rounded-lg p-2.5 text-xs text-gray-200 focus:outline-none"
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end gap-4 pt-4 border-t border-gray-800">
        <Link href="/quanly/quotes" className="quanly-btn-secondary">
          Hủy bỏ
        </Link>
        {!isIssuedQuote && (
          <button
            onClick={() => void handleSaveQuote("draft")}
            disabled={saving}
            className="quanly-btn-secondary"
          >
            Lưu bản nháp
          </button>
        )}
        <button
          onClick={handlePrimaryPdfAction}
          disabled={saving}
          className="quanly-btn-gold"
        >
          {saving ? "Đang xử lý..." : isIssuedQuote ? "↻ Tải lại báo giá PDF" : "✓ Phát Hành Báo Giá & Xuất PDF"}
        </button>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-3 backdrop-blur-sm sm:p-6">
          <div className="mx-auto max-w-5xl">
            <div className="sticky top-2 z-10 mb-3 flex items-center justify-between rounded-xl border border-white/10 bg-[#141923]/95 px-4 py-3 shadow-xl backdrop-blur">
              <div>
                <div className="text-sm font-bold text-white">Xem trước báo giá</div>
                <div className="text-xs text-gray-400">Kiểm tra nội dung trước khi phát hành bản chính thức.</div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-white/5"
              >
                Đóng
              </button>
            </div>
            <QuotePreview
              quoteData={buildPdfQuoteData(quoteNumber || "BẢN NHÁP", quoteStatus)}
              onPrev={() => setShowPreview(false)}
              onNext={handlePrimaryPdfAction}
            />
          </div>
        </div>
      )}

      {pendingPdf && pdfQuoteData && (
        <div className="pointer-events-none fixed left-[-10000px] top-0" aria-hidden="true">
          <QuotePreview quoteData={pdfQuoteData} onPrev={() => {}} onNext={() => {}} />
        </div>
      )}
    </div>
  );
}
