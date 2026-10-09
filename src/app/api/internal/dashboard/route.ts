import { NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/staff-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { SupabaseEntities } from "@/lib/supabase-entities";

export async function GET() {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();

  try {
    const metricsPromise = SupabaseEntities.getFinancialMetrics();
    const quotesPromise = admin
      .from("quotes")
      .select("id, quote_number, status, total_amount, created_at, customer_snapshot, data")
      .is("data->>_entity_type", null)
      .order("created_at", { ascending: false })
      .limit(5);
    const casesPromise = admin
      .from("cases")
      .select("id, case_number, status, final_amount, created_at, customer:customers(name, phone)")
      .order("created_at", { ascending: false })
      .limit(5);

    const [metrics, quotesResult, casesResult] = await Promise.all([
      metricsPromise,
      quotesPromise,
      casesPromise,
    ]);

    if (quotesResult.error) throw quotesResult.error;
    if (casesResult.error) throw casesResult.error;

    const recentQuotes = (quotesResult.data || []).map((item) => {
      const legacyData = (item.data || {}) as {
        customer?: { name?: string; phone?: string };
        services?: Array<{ price: number; quantity: number }>;
        vatRate?: number;
      };
      const snapshot = (item.customer_snapshot || {}) as { name?: string; phone?: string };
      let totalAmount = Number(item.total_amount) || 0;

      if (!totalAmount && legacyData.services) {
        const subtotal = legacyData.services.reduce(
          (sum, service) => sum + service.price * service.quantity,
          0
        );
        totalAmount = subtotal + subtotal * ((legacyData.vatRate || 0) / 100);
      }

      return {
        id: item.id,
        quote_number: item.quote_number || item.id,
        customer_name: snapshot.name || legacyData.customer?.name || "Khách hàng",
        customer_phone: snapshot.phone || legacyData.customer?.phone || "",
        total_amount: totalAmount,
        status: item.status || "draft",
        created_at: item.created_at,
      };
    });

    const recentCases = (casesResult.data || []).map((item) => {
      const customer = Array.isArray(item.customer) ? item.customer[0] : item.customer;
      return {
        id: item.id,
        case_number: item.case_number,
        customer: {
          name: customer?.name || "Khách hàng",
          phone: customer?.phone || "",
        },
        status: item.status,
        final_amount: Number(item.final_amount) || 0,
        created_at: item.created_at,
      };
    });

    return NextResponse.json(
      { metrics, recentQuotes, recentCases },
      { headers: { "Cache-Control": "private, no-store" } }
    );
  } catch (error) {
    console.error("Lỗi tải dashboard từ Supabase:", error);
    return NextResponse.json(
      { error: "Không thể tải dữ liệu tổng quan. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
