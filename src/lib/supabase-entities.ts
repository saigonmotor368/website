// Saigon Motor — Real Supabase Entity Data Layer
// Connects strictly to relational tables: customers, vehicles, cases, case_items, case_vehicles,
// case_documents, case_files, invoices, invoice_items, payments, case_costs, audit_logs.
// Zero mock data in RAM. Zero storing cases/invoices in quotes.data. Zero simulated fallback.

import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 600): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      if (
        i < retries - 1 &&
        (msg.includes("fetch failed") ||
          msg.includes("ECONNRESET") ||
          msg.includes("ETIMEDOUT") ||
          msg.includes("Failed to fetch") ||
          msg.includes("network"))
      ) {
        await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

export interface CustomerData {
  id: string;
  name: string;
  phone: string;
  type: "individual" | "company";
  company_name?: string;
  tax_id?: string;
  zalo_name?: string;
  email?: string;
  address?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VehicleData {
  id: string;
  customer_id?: string;
  vehicle_type: "car" | "motorbike" | "other";
  license_plate?: string;
  owner_name?: string;
  chassis_number?: string;
  engine_number?: string;
  brand?: string;
  model?: string;
  color?: string;
  manufacturing_year?: number;
  registered_province?: string;
  free_description?: string;
  raw_ai_data?: Record<string, unknown> | null;
  ai_confidence?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CaseItemData {
  id: string;
  case_id?: string;
  service_name: string;
  quoted_price: number;
  adjusted_price: number;
  quantity: number;
  adjustment_reason?: string;
  final_price: number;
  sort_order?: number;
  created_at?: string;
}

export interface CaseVehicleData {
  id: string;
  case_id?: string;
  vehicle_id?: string;
  license_plate?: string;
  owner_name?: string;
  brand?: string;
  model?: string;
  engine_number?: string;
  chassis_number?: string;
  address?: string;
  fleet_description?: string;
  vehicle_count: number;
  created_at?: string;
}

export interface CaseDocumentData {
  id: string;
  case_id?: string;
  document_name: string;
  status: "required" | "received" | "missing";
  note?: string;
  verified_by?: string;
  verified_at?: string;
  created_at?: string;
}

export interface CaseFileData {
  id: string;
  case_id: string;
  vehicle_id?: string;
  storage_path: string;
  file_type: string;
  file_size?: number;
  file_hash?: string;
  uploaded_by?: string;
  ocr_result?: Record<string, unknown> | null;
  expires_at?: string;
  deleted_at?: string;
  created_at?: string;
}

export interface CaseCostData {
  id: string;
  case_id?: string;
  cost_group: string;
  description: string;
  amount: number;
  incurred_date: string;
  status: "draft" | "approved" | "rejected";
  submitted_by?: string;
  approved_by?: string;
  approved_at?: string;
  receipt_url?: string;
  created_at?: string;
}

export interface AuditLogRecord {
  id: string;
  action: string;
  actor_name: string;
  timestamp: string;
  details?: string;
  old_data?: Record<string, unknown> | null;
  new_data?: Record<string, unknown> | null;
}

export interface CaseRecord {
  id: string;
  case_number: string;
  quote_id?: string;
  quote_number?: string;
  customer_id?: string;
  customer: CustomerData;
  vehicles: CaseVehicleData[];
  items: CaseItemData[];
  documents: CaseDocumentData[];
  files?: CaseFileData[];
  costs: CaseCostData[];
  status: "new" | "processing" | "completed";
  received_at: string;
  completed_at?: string;
  notes?: string;
  estimated_amount: number;
  final_amount: number;
  is_locked: boolean;
  locked_at?: string;
  assigned_to?: string;
  assigned_name?: string;
  created_at: string;
  updated_at: string;
  audit_logs: AuditLogRecord[];
}

export interface InvoiceItemData {
  id: string;
  invoice_id?: string;
  item_name: string;
  unit_price: number;
  quantity: number;
  total_price: number;
  created_at?: string;
}

export interface PaymentData {
  id: string;
  invoice_id: string;
  payment_date: string;
  amount: number;
  payment_method: "cash" | "bank_transfer" | "other";
  reference_code?: string;
  notes?: string;
  recorded_by?: string;
  recorded_name?: string;
  created_at?: string;
}

export interface InvoiceRecord {
  id: string;
  invoice_number: string;
  case_id: string;
  case_number: string;
  customer_id?: string;
  customer: CustomerData;
  status: "draft" | "issued" | "cancelled";
  issued_at?: string;
  due_date?: string;
  total_amount: number;
  paid_amount: number;
  balance: number;
  notes?: string;
  items: InvoiceItemData[];
  payments: PaymentData[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const SupabaseEntities = {
  // ==========================================
  // 1. CUSTOMERS (Table: customers)
  // ==========================================
  async getCustomers(filters?: { q?: string; phone?: string; limit?: number }): Promise<CustomerData[]> {
    const admin = getSupabaseAdmin();
    let query = admin
      .from("customers")
      .select("id, type, name, company_name, phone, zalo_name, email, tax_id, address, notes, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(filters?.limit || 50);

    if (filters?.phone) {
      query = query.eq("phone", filters.phone.trim());
    } else if (filters?.q) {
      const q = filters.q.trim();
      query = query.or(
        `name.ilike.%${q}%,phone.ilike.%${q}%,zalo_name.ilike.%${q}%,company_name.ilike.%${q}%,tax_id.ilike.%${q}%`
      );
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Lỗi truy vấn danh sách khách hàng từ Supabase: ${error.message}`);
    }

    return (data || []).map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      type: (c.type as "individual" | "company") || "individual",
      company_name: c.company_name || undefined,
      tax_id: c.tax_id || undefined,
      zalo_name: c.zalo_name || undefined,
      email: c.email || undefined,
      address: c.address || undefined,
      notes: c.notes || undefined,
      created_at: c.created_at,
      updated_at: c.updated_at,
    }));
  },

  async getCustomerById(id: string): Promise<CustomerData | null> {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("customers")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Lỗi truy vấn khách hàng từ Supabase: ${error.message}`);
    }
    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      type: (data.type as "individual" | "company") || "individual",
      company_name: data.company_name || undefined,
      tax_id: data.tax_id || undefined,
      zalo_name: data.zalo_name || undefined,
      email: data.email || undefined,
      address: data.address || undefined,
      notes: data.notes || undefined,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  },

  async saveCustomer(c: Partial<CustomerData> & { name: string; phone: string; created_by?: string }): Promise<CustomerData> {
    const admin = getSupabaseAdmin();
    // 1. Canonical phone normalization
    let cleanPhone = (c.phone || "").replace(/[^0-9+]/g, "");
    if (cleanPhone.startsWith("+84")) {
      cleanPhone = "0" + cleanPhone.slice(3);
    } else if (cleanPhone.startsWith("84") && cleanPhone.length >= 11) {
      cleanPhone = "0" + cleanPhone.slice(2);
    }
    const now = new Date().toISOString();
    const defaultActorId = "d18cc40a-4400-41bf-89ed-6d9d167af747"; // Owner UUID

    // 2. Anti-duplication lookup
    let customerId = c.id;
    if (!customerId) {
      // Số điện thoại có thể để trống khi khách chỉ liên hệ qua Zalo.
      // Không đối chiếu chuỗi rỗng vì sẽ gộp nhầm nhiều khách hàng khác nhau.
      const { data: existingPhone } = cleanPhone
        ? await admin
            .from("customers")
            .select("id")
            .eq("phone", cleanPhone)
            .maybeSingle()
        : { data: null };

      if (existingPhone?.id) {
        customerId = existingPhone.id;
      } else if (c.tax_id && c.tax_id.trim()) {
        // Check existing by tax_id for company customers
        const { data: existingTax } = await admin
          .from("customers")
          .select("id")
          .eq("tax_id", c.tax_id.trim())
          .maybeSingle();

        if (existingTax?.id) {
          customerId = existingTax.id;
        }
      }

      if (!customerId) {
        customerId = crypto.randomUUID();
      }
    }

    const customerRow = {
      id: customerId,
      type: c.type || "individual",
      name: c.name.trim(),
      phone: cleanPhone,
      company_name: c.company_name?.trim() || null,
      tax_id: c.tax_id?.trim() || null,
      zalo_name: c.zalo_name?.trim() || null,
      email: c.email?.trim() || null,
      address: c.address?.trim() || null,
      notes: c.notes?.trim() || null,
      created_by: c.created_by || defaultActorId,
      updated_at: now,
    };

    const { data, error } = await admin
      .from("customers")
      .upsert(customerRow)
      .select()
      .single();

    if (error) {
      throw new Error(`Lỗi lưu khách hàng vào Supabase: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      type: (data.type as "individual" | "company") || "individual",
      company_name: data.company_name || undefined,
      tax_id: data.tax_id || undefined,
      zalo_name: data.zalo_name || undefined,
      email: data.email || undefined,
      address: data.address || undefined,
      notes: data.notes || undefined,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  },

  // ==========================================
  // 2. VEHICLES (Table: vehicles)
  // ==========================================
  async getVehicles(filters?: { customerId?: string; plate?: string; limit?: number }): Promise<VehicleData[]> {
    const admin = getSupabaseAdmin();
    let query = admin
      .from("vehicles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(filters?.limit || 50);

    if (filters?.customerId) {
      query = query.eq("customer_id", filters.customerId);
    }
    if (filters?.plate) {
      query = query.ilike("license_plate", `%${filters.plate.trim().toUpperCase()}%`);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(`Lỗi truy vấn phương tiện từ Supabase: ${error.message}`);
    }

    return (data || []).map((v) => ({
      id: v.id,
      customer_id: v.customer_id || undefined,
      vehicle_type: (v.vehicle_type as "car" | "motorbike" | "other") || "car",
      license_plate: v.license_plate || undefined,
      owner_name: v.owner_name || undefined,
      chassis_number: v.chassis_number || undefined,
      engine_number: v.engine_number || undefined,
      brand: v.brand || undefined,
      model: v.model || undefined,
      color: v.color || undefined,
      manufacturing_year: v.manufacturing_year || undefined,
      registered_province: v.registered_province || undefined,
      free_description: v.free_description || undefined,
      raw_ai_data: v.raw_ai_data || null,
      ai_confidence: v.ai_confidence ? Number(v.ai_confidence) : undefined,
      created_at: v.created_at,
      updated_at: v.updated_at,
    }));
  },

  async getVehicleById(id: string): Promise<VehicleData | null> {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("vehicles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Lỗi truy vấn phương tiện từ Supabase: ${error.message}`);
    }
    if (!data) return null;

    return {
      id: data.id,
      customer_id: data.customer_id || undefined,
      vehicle_type: (data.vehicle_type as "car" | "motorbike" | "other") || "car",
      license_plate: data.license_plate || undefined,
      owner_name: data.owner_name || undefined,
      chassis_number: data.chassis_number || undefined,
      engine_number: data.engine_number || undefined,
      brand: data.brand || undefined,
      model: data.model || undefined,
      color: data.color || undefined,
      manufacturing_year: data.manufacturing_year || undefined,
      registered_province: data.registered_province || undefined,
      free_description: data.free_description || undefined,
      raw_ai_data: data.raw_ai_data || null,
      ai_confidence: data.ai_confidence ? Number(data.ai_confidence) : undefined,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  },

  async saveVehicle(v: Partial<VehicleData> & { license_plate?: string }): Promise<VehicleData> {
    const admin = getSupabaseAdmin();
    const now = new Date().toISOString();
    let vehicleId = v.id;

    if (!vehicleId && v.license_plate) {
      const cleanPlate = v.license_plate.trim().toUpperCase();
      const { data: existing } = await admin
        .from("vehicles")
        .select("id")
        .eq("license_plate", cleanPlate)
        .maybeSingle();
      vehicleId = existing?.id || crypto.randomUUID();
    } else if (!vehicleId) {
      vehicleId = crypto.randomUUID();
    }

    const vehicleRow = {
      id: vehicleId,
      customer_id: v.customer_id || null,
      vehicle_type: v.vehicle_type || "car",
      license_plate: v.license_plate?.trim().toUpperCase() || null,
      owner_name: v.owner_name?.trim() || null,
      chassis_number: v.chassis_number?.trim() || null,
      engine_number: v.engine_number?.trim() || null,
      brand: v.brand?.trim() || null,
      model: v.model?.trim() || null,
      color: v.color?.trim() || null,
      manufacturing_year: v.manufacturing_year || null,
      registered_province: v.registered_province?.trim() || null,
      free_description: v.free_description?.trim() || null,
      raw_ai_data: v.raw_ai_data || null,
      ai_confidence: v.ai_confidence || null,
      updated_at: now,
    };

    const { data, error } = await admin
      .from("vehicles")
      .upsert(vehicleRow)
      .select()
      .single();

    if (error) {
      throw new Error(`Lỗi lưu phương tiện vào Supabase: ${error.message}`);
    }

    return {
      id: data.id,
      customer_id: data.customer_id || undefined,
      vehicle_type: (data.vehicle_type as "car" | "motorbike" | "other") || "car",
      license_plate: data.license_plate || undefined,
      owner_name: data.owner_name || undefined,
      chassis_number: data.chassis_number || undefined,
      engine_number: data.engine_number || undefined,
      brand: data.brand || undefined,
      model: data.model || undefined,
      color: data.color || undefined,
      manufacturing_year: data.manufacturing_year || undefined,
      registered_province: data.registered_province || undefined,
      free_description: data.free_description || undefined,
      raw_ai_data: data.raw_ai_data || null,
      ai_confidence: data.ai_confidence ? Number(data.ai_confidence) : undefined,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  },

  // ==========================================
  // 3. CASES (Tables: cases, case_items, case_vehicles, case_documents, case_files, case_costs)
  // ==========================================
  async getCases(filters?: { status?: string; q?: string; limit?: number }): Promise<CaseRecord[]> {
    const admin = getSupabaseAdmin();

    let query = admin
      .from("cases")
      .select(`
        id, case_number, quote_id, customer_id, status, received_at, completed_at,
        notes, estimated_amount, final_amount, is_locked, locked_at, assigned_to,
        created_at, updated_at,
        customer:customers(id, type, name, company_name, phone, zalo_name, email, tax_id, address, notes),
        items:case_items(id, case_id, service_name, quoted_price, adjusted_price, quantity, adjustment_reason, final_price, sort_order),
        case_vehicles(id, case_id, vehicle_id, fleet_description, vehicle_count, vehicle:vehicles(license_plate, owner_name, brand, model, engine_number, chassis_number)),
        documents:case_documents(id, case_id, document_name, status, note, verified_by, verified_at)
      `)
      .order("created_at", { ascending: false })
      .limit(filters?.limit || 100);

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    const { data: rows, error } = await query;
    if (error) {
      throw new Error(`Lỗi truy vấn danh sách hồ sơ từ Supabase: ${error.message}`);
    }

    const cases: CaseRecord[] = (rows || []).map((r) => this.mapDbCaseToRecord(r));

    if (filters?.q) {
      const q = filters.q.toLowerCase().trim();
      return cases.filter(
        (c) =>
          c.case_number.toLowerCase().includes(q) ||
          c.customer.name.toLowerCase().includes(q) ||
          c.customer.phone.includes(q) ||
          c.customer.company_name?.toLowerCase().includes(q) ||
          c.vehicles?.some((v) => v.license_plate?.toLowerCase().includes(q))
      );
    }

    return cases;
  },

  async getCaseById(id: string): Promise<CaseRecord | null> {
    const admin = getSupabaseAdmin();

    const { data: row, error } = await admin
      .from("cases")
      .select(`
        *,
        customer:customers(*),
        items:case_items(*),
        case_vehicles(*, vehicle:vehicles(*)),
        documents:case_documents(*),
        files:case_files(*),
        costs:case_costs(*)
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Lỗi truy vấn hồ sơ từ Supabase: ${error.message}`);
    }

    if (!row) return null;

    // Fetch related audit logs
    const { data: logs } = await admin
      .from("audit_logs")
      .select("*")
      .eq("entity_type", "case")
      .eq("entity_id", id)
      .order("created_at", { ascending: false });

    const record = this.mapDbCaseToRecord(row);
    if (logs && logs.length > 0) {
      record.audit_logs = logs.map((l) => {
        const newData = (l.new_data || {}) as Record<string, unknown>;
        return {
          id: l.id,
          action: l.action,
          actor_name: (newData.actor_name as string) || "Hệ thống",
          timestamp: l.created_at,
          details: (newData.details as string) || l.action,
          old_data: l.old_data,
          new_data: l.new_data,
        };
      });
    }

    return record;
  },

  async saveCase(c: CaseRecord, options?: { actorId?: string }): Promise<CaseRecord> {
    const admin = getSupabaseAdmin();
    const now = new Date().toISOString();
    const caseId = c.id || crypto.randomUUID();
    const actorId = options?.actorId || c.assigned_to || "d18cc40a-4400-41bf-89ed-6d9d167af747";

    // Resolve customer_id — passes existing ID or customer jsonb directly into RPC
    // The RPC handles deduplication (canonical phone + tax_id) within the same transaction.
    const customerId = c.customer_id || c.customer?.id || null;

    // Execute via Supabase RPC Transaction (atomic, no fallback)
    const { data: rpcRes, error: rpcErr } = await admin.rpc("rpc_create_case", {
      p_case: {
        id: caseId,
        case_number: c.case_number,
        customer_id: customerId,
        quote_id: c.quote_id || null,
        status: c.status || "new",
        assigned_to: c.assigned_to || actorId,
        created_by: actorId,
        received_at: c.received_at || now,
        notes: c.notes || null,
        estimated_amount: Math.round(Number(c.estimated_amount) || 0),
        final_amount: Math.round(Number(c.final_amount) || 0),
        is_locked: !!c.is_locked,
      },
      // Pass customer object directly so RPC handles dedup in same transaction
      p_customer: (c.customer && c.customer.name && c.customer.phone)
        ? {
            id: customerId,
            type: c.customer.type || "individual",
            name: c.customer.name,
            phone: c.customer.phone,
            company_name: c.customer.company_name || null,
            tax_id: c.customer.tax_id || null,
            zalo_name: c.customer.zalo_name || null,
            email: c.customer.email || null,
            address: c.customer.address || null,
            notes: c.customer.notes || null,
          }
        : null,
      p_items: (c.items || []).map((i, idx) => ({
        id: i.id || crypto.randomUUID(),
        service_name: i.service_name,
        quoted_price: Math.round(Number(i.quoted_price) || 0),
        adjusted_price: Math.round(Number(i.adjusted_price) || 0),
        quantity: Math.max(1, Math.round(Number(i.quantity) || 1)),
        adjustment_reason: i.adjustment_reason?.trim() || null,
        final_price: Math.round(Number(i.final_price) || 0),
        sort_order: idx + 1,
      })),
      p_vehicles: (c.vehicles || []).map((v) => ({
        id: v.id || crypto.randomUUID(),
        vehicle_id: v.vehicle_id || null,
        license_plate: v.license_plate?.trim()?.toUpperCase() || null,
        owner_name: v.owner_name?.trim() || null,
        brand: v.brand?.trim() || null,
        model: v.model?.trim() || null,
        engine_number: v.engine_number?.trim() || null,
        chassis_number: v.chassis_number?.trim() || null,
        fleet_description: v.fleet_description?.trim() || null,
        vehicle_count: v.vehicle_count || 1,
      })),
      p_documents: (c.documents || []).map((d) => ({
        id: d.id || crypto.randomUUID(),
        document_name: d.document_name,
        status: d.status || "required",
        note: d.note?.trim() || null,
        verified_by: d.verified_by || (d.status === "received" ? actorId : null),
        verified_at: d.verified_at || (d.status === "received" ? now : null),
      })),
      p_audit: {
        id: crypto.randomUUID(),
        actor_id: actorId,
        action: "create_case",
        new_data: { case_number: c.case_number, status: c.status },
      },
    });

    if (rpcErr) {
      throw new Error(`RPC rpc_create_case thất bại: ${rpcErr.message}`);
    }
    if (!rpcRes) {
      throw new Error("RPC rpc_create_case không trả về kết quả");
    }

    // After atomic RPC: save costs and files (table-only, no multi-table transaction needed)
    const savedCaseId: string = (rpcRes as { id: string }).id || caseId;

    if (c.costs && c.costs.length > 0) {
      await admin.from("case_costs").delete().eq("case_id", savedCaseId);
      const costsToInsert = c.costs.map((cost) => ({
        id: cost.id || crypto.randomUUID(),
        case_id: savedCaseId,
        cost_group: cost.cost_group || "Chi phí dịch vụ",
        description: cost.description,
        amount: Math.round(Number(cost.amount) || 0),
        incurred_date: cost.incurred_date || now.slice(0, 10),
        status: cost.status || "draft",
        submitted_by: cost.submitted_by || actorId,
        approved_by: cost.approved_by || (cost.status === "approved" ? actorId : null),
        approved_at: cost.approved_at || (cost.status === "approved" ? now : null),
        receipt_url: cost.receipt_url || null,
      }));
      const { error: costsErr } = await admin.from("case_costs").insert(costsToInsert);
      if (costsErr) {
        throw new Error(`Lỗi lưu chi phí vào bảng case_costs: ${costsErr.message}`);
      }
    }

    if (c.files && c.files.length > 0) {
      for (const f of c.files) {
        await this.saveCaseFile({
          ...f,
          case_id: savedCaseId,
          uploaded_by: f.uploaded_by || actorId,
        });
      }
    }

    const reloaded = await this.getCaseById(savedCaseId);
    if (!reloaded) {
      throw new Error("Không thể tải lại hồ sơ sau khi lưu vào Supabase");
    }
    return reloaded;
  },

  // ==========================================
  // 4. CASE FILES (Table: case_files)
  // ==========================================
  async getCaseFiles(caseId: string): Promise<CaseFileData[]> {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("case_files")
      .select("*")
      .eq("case_id", caseId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Lỗi truy vấn tập tin hồ sơ từ Supabase: ${error.message}`);
    }

    return (data || []).map((f) => ({
      id: f.id,
      case_id: f.case_id,
      vehicle_id: f.vehicle_id || undefined,
      storage_path: f.storage_path,
      file_type: f.file_type,
      file_size: Number(f.file_size) || 0,
      file_hash: f.file_hash || undefined,
      uploaded_by: f.uploaded_by || undefined,
      ocr_result: f.ocr_result || null,
      expires_at: f.expires_at || undefined,
      deleted_at: f.deleted_at || undefined,
      created_at: f.created_at,
    }));
  },

  async saveCaseFile(file: CaseFileData): Promise<CaseFileData> {
    const admin = getSupabaseAdmin();
    const fileId = file.id || crypto.randomUUID();

    const fileRow = {
      id: fileId,
      case_id: file.case_id,
      vehicle_id: file.vehicle_id || null,
      storage_path: file.storage_path,
      file_type: file.file_type || "image/jpeg",
      file_size: Math.round(Number(file.file_size) || 0),
      file_hash: file.file_hash || null,
      uploaded_by: file.uploaded_by || null,
      ocr_result: file.ocr_result || null,
      expires_at: file.expires_at || null,
      deleted_at: file.deleted_at || null,
    };

    const { data, error } = await admin
      .from("case_files")
      .upsert(fileRow)
      .select()
      .single();

    if (error) {
      throw new Error(`Lỗi lưu tập tin hồ sơ vào bảng case_files: ${error.message}`);
    }

    return {
      id: data.id,
      case_id: data.case_id,
      vehicle_id: data.vehicle_id || undefined,
      storage_path: data.storage_path,
      file_type: data.file_type,
      file_size: Number(data.file_size) || 0,
      file_hash: data.file_hash || undefined,
      uploaded_by: data.uploaded_by || undefined,
      ocr_result: data.ocr_result || null,
      expires_at: data.expires_at || undefined,
      deleted_at: data.deleted_at || undefined,
      created_at: data.created_at,
    };
  },

  async deleteCaseFile(id: string): Promise<void> {
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("case_files")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      throw new Error(`Lỗi xoá tập tin hồ sơ: ${error.message}`);
    }
  },

  // ==========================================
  // 5. INVOICES (Tables: invoices, invoice_items, payments)
  // ==========================================
  async getInvoices(filters?: { status?: string; caseId?: string; q?: string; limit?: number }): Promise<InvoiceRecord[]> {
    const admin = getSupabaseAdmin();

    let query = admin
      .from("invoices")
      .select(`
        id, invoice_number, case_id, customer_id, status, issued_at, due_date,
        total_amount, notes, created_by, created_at, updated_at,
        customer:customers(id, type, name, company_name, phone, tax_id, address),
        payments(id, invoice_id, payment_date, amount, payment_method, reference_code, notes),
        case:cases(case_number)
      `)
      .order("created_at", { ascending: false })
      .limit(filters?.limit || 100);

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.caseId) {
      query = query.eq("case_id", filters.caseId);
    }

    const { data: rows, error } = await query;
    if (error) {
      throw new Error(`Lỗi truy vấn phiếu thanh toán từ Supabase: ${error.message}`);
    }

    const invoices: InvoiceRecord[] = (rows || []).map((r) => this.mapDbInvoiceToRecord(r));

    if (filters?.q) {
      const q = filters.q.toLowerCase().trim();
      return invoices.filter(
        (i) =>
          i.invoice_number.toLowerCase().includes(q) ||
          i.case_number.toLowerCase().includes(q) ||
          i.customer.name.toLowerCase().includes(q) ||
          i.customer.phone.includes(q)
      );
    }

    return invoices;
  },

  async getInvoiceById(id: string): Promise<InvoiceRecord | null> {
    const admin = getSupabaseAdmin();

    const { data: row, error } = await admin
      .from("invoices")
      .select(`
        *,
        customer:customers(*),
        items:invoice_items(*),
        payments(*),
        case:cases(case_number)
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Lỗi truy vấn phiếu thanh toán từ Supabase: ${error.message}`);
    }

    if (!row) return null;
    return this.mapDbInvoiceToRecord(row);
  },

  async saveInvoice(inv: InvoiceRecord, options?: { actorId?: string }): Promise<InvoiceRecord> {
    const admin = getSupabaseAdmin();
    const now = new Date().toISOString();
    const invoiceId = inv.id || crypto.randomUUID();
    const actorId = options?.actorId || inv.created_by || "d18cc40a-4400-41bf-89ed-6d9d167af747";
    const customerId = inv.customer_id || inv.customer?.id || null;

    const firstPayment = inv.payments?.[0];

    // Execute via Supabase RPC Transaction (atomic, no fallback)
    const { data: rpcRes, error: rpcErr } = await admin.rpc("rpc_create_invoice", {
      p_invoice: {
        id: invoiceId,
        invoice_number: inv.invoice_number,
        case_id: inv.case_id || null,
        customer_id: customerId,
        status: inv.status || "issued",
        issued_at: inv.issued_at || (inv.status === "issued" ? now : null),
        due_date: inv.due_date || null,
        total_amount: Math.round(Number(inv.total_amount) || 0),
        notes: inv.notes || null,
        created_by: actorId,
      },
      p_customer: null,
      p_items: (inv.items || []).map((item) => ({
        id: item.id || crypto.randomUUID(),
        item_name: item.item_name,
        unit_price: Math.round(Number(item.unit_price) || 0),
        quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
        total_price: Math.round(Number(item.total_price) || 0),
      })),
      p_payment: firstPayment ? {
        id: firstPayment.id || crypto.randomUUID(),
        payment_date: firstPayment.payment_date || now,
        amount: Math.round(Number(firstPayment.amount) || 0),
        payment_method: firstPayment.payment_method || "bank_transfer",
        reference_code: firstPayment.reference_code || null,
        notes: firstPayment.notes || null,
        recorded_by: firstPayment.recorded_by || actorId,
      } : null,
      p_audit: {
        id: crypto.randomUUID(),
        actor_id: actorId,
        action: "create_invoice",
        new_data: { invoice_number: inv.invoice_number, total_amount: inv.total_amount },
      },
    });

    if (rpcErr) {
      throw new Error(`RPC rpc_create_invoice thất bại: ${rpcErr.message}`);
    }
    if (!rpcRes) {
      throw new Error("RPC rpc_create_invoice không trả về kết quả");
    }

    // Additional payments beyond the first (RPC handles first payment)
    if (inv.payments && inv.payments.length > 1) {
      for (const p of inv.payments.slice(1)) {
        await this.recordPayment({
          ...p,
          invoice_id: invoiceId,
          recorded_by: p.recorded_by || actorId,
        }, { actorId });
      }
    }

    const reloaded = await this.getInvoiceById(invoiceId);
    if (!reloaded) {
      throw new Error("Không thể tải lại phiếu thanh toán sau khi lưu vào Supabase");
    }
    return reloaded;
  },

  async recordPayment(p: PaymentData, options?: { actorId?: string }): Promise<PaymentData> {
    const admin = getSupabaseAdmin();
    const now = new Date().toISOString();
    const paymentId = p.id || crypto.randomUUID();
    const actorId = options?.actorId || p.recorded_by || "d18cc40a-4400-41bf-89ed-6d9d167af747";

    // Execute via Supabase RPC (atomic, no fallback)
    const { data: rpcRes, error: rpcErr } = await admin.rpc("rpc_record_payment", {
      p_payment: {
        id: paymentId,
        invoice_id: p.invoice_id,
        payment_date: p.payment_date || now,
        amount: Math.round(Number(p.amount) || 0),
        payment_method: p.payment_method || "bank_transfer",
        reference_code: p.reference_code || null,
        notes: p.notes || null,
        recorded_by: actorId,
      },
      p_audit: {
        id: crypto.randomUUID(),
        actor_id: actorId,
        action: "record_payment",
        new_data: { amount: p.amount, invoice_id: p.invoice_id },
      },
    });

    if (rpcErr) {
      throw new Error(`RPC rpc_record_payment thất bại: ${rpcErr.message}`);
    }
    if (!rpcRes) {
      throw new Error("RPC rpc_record_payment không trả về kết quả");
    }

    return {
      id: paymentId,
      invoice_id: p.invoice_id,
      payment_date: p.payment_date || now,
      amount: Number(p.amount) || 0,
      payment_method: (p.payment_method as "cash" | "bank_transfer" | "other") || "bank_transfer",
      reference_code: p.reference_code || undefined,
      notes: p.notes || undefined,
      recorded_by: actorId,
    };
  },

  async approveCaseCost(costId: string, approverId: string, approverName?: string): Promise<void> {
    const admin = getSupabaseAdmin();
    const realApproverId = approverId || "d18cc40a-4400-41bf-89ed-6d9d167af747"; // Owner UUID

    // Execute via Supabase RPC — enforces owner role check, no fallback
    const { data, error } = await admin.rpc("rpc_approve_cost", {
      p_cost_id: costId,
      p_approver_id: realApproverId,
      p_approver_name: approverName || "Phạm Xuân Định",
    });

    if (error) {
      throw new Error(`RPC rpc_approve_cost thất bại: ${error.message}`);
    }
    if (!data) {
      throw new Error("RPC rpc_approve_cost không trả về kết quả");
    }
  },

  // ==========================================
  // 6. AUDIT LOGS (Table: audit_logs)
  // ==========================================
  async logAudit(params: {
    action: string;
    entityType: string;
    entityId: string;
    actorId?: string;
    actorName?: string;
    details?: unknown;
    oldData?: unknown;
    newData?: unknown;
  }): Promise<void> {
    const admin = getSupabaseAdmin();
    const now = new Date().toISOString();
    const actorId = params.actorId || "d18cc40a-4400-41bf-89ed-6d9d167af747";

    const mergedNewData: Record<string, unknown> = {
      ...(typeof params.newData === "object" && params.newData !== null ? params.newData : {}),
      actor_name: params.actorName || "Phạm Xuân Định",
      details: params.details || params.action,
    };

    try {
      await admin.from("audit_logs").insert({
        id: crypto.randomUUID(),
        actor_id: actorId,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId,
        old_data: (params.oldData as Record<string, unknown>) || null,
        new_data: mergedNewData,
        created_at: now,
      });
    } catch (err) {
      console.warn("Lỗi ghi audit log vào Supabase:", err);
    }
  },

  async getAuditLogs(entityType: string, entityId: string): Promise<AuditLogRecord[]> {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("audit_logs")
      .select("*")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Lỗi truy vấn audit logs: ${error.message}`);
    }

    return (data || []).map((l) => {
      const nd = (l.new_data || {}) as Record<string, unknown>;
      return {
        id: l.id,
        action: l.action,
        actor_name: (nd.actor_name as string) || "Hệ thống",
        timestamp: l.created_at,
        details: (nd.details as string) || l.action,
        old_data: l.old_data,
        new_data: l.new_data,
      };
    });
  },

  // ==========================================
  // 7. FINANCIAL METRICS (Calculated purely from relational Supabase tables)
  // ==========================================
  async getFinancialMetrics() {
    const admin = getSupabaseAdmin();

    const [invoiceResult, costResult, caseResult, quoteResult] = await Promise.all([
      admin.from("invoices").select("id, total_amount, status"),
      admin.from("case_costs").select("amount").eq("status", "approved"),
      admin.from("cases").select("status"),
      admin.from("quotes").select("*", { count: "exact", head: true }),
    ]);

    // 1. Invoices
    const { data: invRows, error: invErr } = invoiceResult;
    if (invErr) throw new Error(`Lỗi tính doanh thu: ${invErr.message}`);

    const validInvoices = (invRows || []).filter((i) => i.status === "issued");
    const validInvoiceIds = validInvoices.map((i) => i.id);
    const issuedRevenue = validInvoices.reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);

    // 2. Real Payments for valid invoices
    let collectedMoney = 0;
    if (validInvoiceIds.length > 0) {
      const { data: payRows, error: payErr } = await admin
        .from("payments")
        .select("amount, invoice_id")
        .in("invoice_id", validInvoiceIds);
      if (payErr) throw new Error(`Lỗi tính thực thu: ${payErr.message}`);
      collectedMoney = (payRows || []).reduce((sum, p) => sum + Number(p.amount || 0), 0);
    }

    const pendingDebt = Math.max(0, issuedRevenue - collectedMoney);

    // 3. Approved Costs
    const { data: costRows, error: costErr } = costResult;
    if (costErr) throw new Error(`Lỗi tính chi phí đã duyệt: ${costErr.message}`);
    const approvedCosts = (costRows || []).reduce((sum, c) => sum + Number(c.amount || 0), 0);

    // 4. Net Profit
    const netProfit = Math.max(0, issuedRevenue - approvedCosts);

    // 5. Counts
    const { data: caseRows } = caseResult;
    const activeCases = (caseRows || []).filter((c) => c.status === "new" || c.status === "processing").length;
    const completedCases = (caseRows || []).filter((c) => c.status === "completed").length;

    const { count: quotesCount } = quoteResult;

    return {
      totalQuotes: quotesCount || 0,
      activeCases,
      completedCases,
      issuedRevenue,
      collectedMoney,
      pendingDebt,
      approvedCosts,
      netProfit,
    };
  },

  // ==========================================
  // Helper Mappers: DB Rows -> Clean Application Records
  // ==========================================
  mapDbCaseToRecord(r: Record<string, unknown>): CaseRecord {
    const cust = (r.customer as Record<string, unknown>) || {};
    const items = ((r.items as Array<Record<string, unknown>>) || []).map((i) => ({
      id: i.id as string,
      case_id: i.case_id as string,
      service_name: (i.service_name as string) || "",
      quoted_price: Number(i.quoted_price) || 0,
      adjusted_price: Number(i.adjusted_price) || 0,
      quantity: Number(i.quantity) || 1,
      adjustment_reason: (i.adjustment_reason as string) || undefined,
      final_price: Number(i.final_price) || 0,
      sort_order: Number(i.sort_order) || 0,
    }));

    const vehicles = ((r.case_vehicles as Array<Record<string, unknown>>) || []).map((cv) => {
      const v = (cv.vehicle as Record<string, unknown>) || {};
      return {
        id: cv.id as string,
        case_id: cv.case_id as string,
        vehicle_id: (cv.vehicle_id as string) || undefined,
        license_plate: (v.license_plate as string) || undefined,
        owner_name: (v.owner_name as string) || undefined,
        brand: (v.brand as string) || undefined,
        model: (v.model as string) || undefined,
        engine_number: (v.engine_number as string) || undefined,
        chassis_number: (v.chassis_number as string) || undefined,
        fleet_description: (cv.fleet_description as string) || undefined,
        vehicle_count: Number(cv.vehicle_count) || 1,
      };
    });

    const documents = ((r.documents as Array<Record<string, unknown>>) || []).map((d) => ({
      id: d.id as string,
      case_id: d.case_id as string,
      document_name: (d.document_name as string) || "",
      status: (d.status as "required" | "received" | "missing") || "required",
      note: (d.note as string) || undefined,
      verified_by: (d.verified_by as string) || undefined,
      verified_at: (d.verified_at as string) || undefined,
    }));

    const files = ((r.files as Array<Record<string, unknown>>) || []).map((f) => ({
      id: f.id as string,
      case_id: (f.case_id as string) || (r.id as string),
      vehicle_id: (f.vehicle_id as string) || undefined,
      storage_path: (f.storage_path as string) || "",
      file_type: (f.file_type as string) || "",
      file_size: Number(f.file_size) || 0,
      file_hash: (f.file_hash as string) || undefined,
      uploaded_by: (f.uploaded_by as string) || undefined,
      ocr_result: (f.ocr_result as Record<string, unknown>) || null,
      expires_at: (f.expires_at as string) || undefined,
      deleted_at: (f.deleted_at as string) || undefined,
      created_at: (f.created_at as string) || "",
    }));

    const costs = ((r.costs as Array<Record<string, unknown>>) || []).map((c) => {
      let submitterName: string | undefined;
      let approverName: string | undefined;
      let receiptUrl: string | undefined;
      if (typeof c.receipt_url === "string" && c.receipt_url.startsWith("{")) {
        try {
          const parsed = JSON.parse(c.receipt_url);
          submitterName = parsed.submitted_by;
          approverName = parsed.approved_by;
          receiptUrl = parsed.receipt_url;
        } catch {
          // ignore
        }
      } else if (typeof c.receipt_url === "string") {
        receiptUrl = c.receipt_url;
      }
      return {
        id: c.id as string,
        case_id: c.case_id as string,
        cost_group: (c.cost_group as string) || "Chi phí",
        description: (c.description as string) || "",
        amount: Number(c.amount) || 0,
        incurred_date: (c.incurred_date as string) || "",
        status: (c.status as "draft" | "approved" | "rejected") || "draft",
        submitted_by: submitterName || "Nhân viên",
        approved_by: approverName,
        approved_at: (c.approved_at as string) || undefined,
        receipt_url: receiptUrl,
        created_at: (c.created_at as string) || "",
      };
    });

    return {
      id: r.id as string,
      case_number: (r.case_number as string) || "",
      quote_id: (r.quote_id as string) || undefined,
      customer_id: (r.customer_id as string) || undefined,
      customer: {
        id: (cust.id as string) || (r.customer_id as string) || "",
        name: (cust.name as string) || "",
        phone: (cust.phone as string) || "",
        type: (cust.type as "individual" | "company") || "individual",
        company_name: (cust.company_name as string) || undefined,
        tax_id: (cust.tax_id as string) || undefined,
        zalo_name: (cust.zalo_name as string) || undefined,
        email: (cust.email as string) || undefined,
        address: (cust.address as string) || undefined,
        notes: (cust.notes as string) || undefined,
      },
      vehicles,
      items,
      documents,
      files,
      costs,
      status: (r.status as "new" | "processing" | "completed") || "new",
      received_at: (r.received_at as string) || "",
      completed_at: (r.completed_at as string) || undefined,
      notes: (r.notes as string) || undefined,
      estimated_amount: Number(r.estimated_amount) || 0,
      final_amount: Number(r.final_amount) || 0,
      is_locked: !!r.is_locked,
      locked_at: (r.locked_at as string) || undefined,
      assigned_to: (r.assigned_to as string) || undefined,
      assigned_name: "Phạm Xuân Định",
      created_at: (r.created_at as string) || "",
      updated_at: (r.updated_at as string) || "",
      audit_logs: [],
    };
  },

  mapDbInvoiceToRecord(r: Record<string, unknown>): InvoiceRecord {
    const cust = (r.customer as Record<string, unknown>) || {};
    const kase = (r.case as Record<string, unknown>) || {};
    const items = ((r.items as Array<Record<string, unknown>>) || []).map((i) => ({
      id: i.id as string,
      invoice_id: i.invoice_id as string,
      item_name: (i.item_name as string) || "",
      unit_price: Number(i.unit_price) || 0,
      quantity: Number(i.quantity) || 1,
      total_price: Number(i.total_price) || 0,
    }));

    const payments = ((r.payments as Array<Record<string, unknown>>) || []).map((p) => ({
      id: p.id as string,
      invoice_id: p.invoice_id as string,
      payment_date: (p.payment_date as string) || (p.created_at as string) || "",
      amount: Number(p.amount) || 0,
      payment_method: (p.payment_method as "cash" | "bank_transfer" | "other") || "bank_transfer",
      reference_code: (p.reference_code as string) || undefined,
      notes: (p.notes as string) || undefined,
    }));

    const totalAmount = Number(r.total_amount) || 0;
    const paidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = Math.max(0, totalAmount - paidAmount);

    return {
      id: r.id as string,
      invoice_number: (r.invoice_number as string) || "",
      case_id: (r.case_id as string) || "",
      case_number: (kase.case_number as string) || "",
      customer_id: (r.customer_id as string) || undefined,
      customer: {
        id: (cust.id as string) || (r.customer_id as string) || "",
        name: (cust.name as string) || "",
        phone: (cust.phone as string) || "",
        type: (cust.type as "individual" | "company") || "individual",
        company_name: (cust.company_name as string) || undefined,
        tax_id: (cust.tax_id as string) || undefined,
        address: (cust.address as string) || undefined,
      },
      status: (r.status as "draft" | "issued" | "cancelled") || "draft",
      issued_at: (r.issued_at as string) || undefined,
      due_date: (r.due_date as string) || undefined,
      total_amount: totalAmount,
      paid_amount: paidAmount,
      balance,
      notes: (r.notes as string) || undefined,
      items,
      payments,
      created_by: (r.created_by as string) || undefined,
      created_at: (r.created_at as string) || "",
      updated_at: (r.updated_at as string) || "",
    };
  },
};
