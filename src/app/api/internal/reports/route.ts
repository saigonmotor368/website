import { NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/staff-auth";
import { SupabaseEntities } from "@/lib/supabase-entities";

export async function GET() {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  try {
    const metrics = await SupabaseEntities.getFinancialMetrics();
    const cases = await SupabaseEntities.getCases();
    const invoices = await SupabaseEntities.getInvoices();

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

    // Compile all real costs across cases from Supabase
    const allCosts = [];
    for (const c of cases) {
      for (const cost of c.costs || []) {
        allCosts.push({
          ...cost,
          case_number: c.case_number,
          customer_name: c.customer.name,
        });
      }
    }

    return NextResponse.json({
      metrics,
      profitAllocations,
      recentInvoices: invoices.slice(0, 10),
      costs: allCosts.sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      ),
    });
  } catch (err) {
    console.error("Lỗi tính toán báo cáo tài chính từ Supabase:", err);
    return NextResponse.json(
      { error: "Không thể tải số liệu báo cáo tài chính từ Supabase" },
      { status: 500 }
    );
  }
}
