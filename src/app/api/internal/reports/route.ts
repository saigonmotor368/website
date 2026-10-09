import { NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/staff-auth";
import { SupabaseEntities } from "@/lib/supabase-entities";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  try {
    const admin = getSupabaseAdmin();
    const [metrics, costsResult] = await Promise.all([
      SupabaseEntities.getFinancialMetrics(),
      admin
        .from("case_costs")
        .select("*, case:cases(case_number, customer:customers(name))")
        .order("created_at", { ascending: false }),
    ]);

    if (costsResult.error) throw costsResult.error;

    // 50/50 Profit Split calculation as a configured business rule
    // (Doanh thu đã phát hành - Chi phí thực tế đã duyệt)
    const totalNetProfit = metrics.netProfit;
    const split50 = Math.round(totalNetProfit / 2);

    const profitAllocations = [
      {
        beneficiary_name: "Phạm Xuân Định",
        role: "Chủ hệ thống",
        percentage: 50,
        allocated_amount: split50,
      },
      {
        beneficiary_name: "Quỹ Hoạt động & Nhân sự",
        role: "Quy tắc cấu hình 50%",
        percentage: 50,
        allocated_amount: totalNetProfit - split50,
      },
    ];

    const allCosts = (costsResult.data || []).map((cost) => {
      const caseData = Array.isArray(cost.case) ? cost.case[0] : cost.case;
      const customer = Array.isArray(caseData?.customer)
        ? caseData.customer[0]
        : caseData?.customer;

      return {
        ...cost,
        case_number: caseData?.case_number || "",
        customer_name: customer?.name || "Khách hàng",
      };
    });

    return NextResponse.json({
      metrics,
      profitAllocations,
      costs: allCosts,
    });
  } catch (err) {
    console.error("Lỗi tính toán báo cáo tài chính từ Supabase:", err);
    return NextResponse.json(
      { error: "Không thể tải số liệu báo cáo tài chính từ Supabase" },
      { status: 500 }
    );
  }
}
