import { NextRequest, NextResponse } from "next/server";
import { getCurrentStaff } from "@/lib/staff-auth";

export async function POST(request: NextRequest) {
  const staff = await getCurrentStaff();
  if (!staff) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  let body: { imageBase64?: string; mimeType?: string; caseId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu JSON không hợp lệ" }, { status: 400 });
  }

  if (!body.imageBase64) {
    return NextResponse.json({ error: "Vui lòng chọn hoặc tải lên hình ảnh giấy đăng ký xe" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Hệ thống AI Gemini chưa được cấu hình GEMINI_API_KEY trên server (.env.local hoặc Vercel)." },
      { status: 503 }
    );
  }

  // Strip prefix
  const base64Data = body.imageBase64.replace(/^data:image\/\w+;base64,/, "");
  const mime = body.mimeType || "image/jpeg";

  // Step 2: Attempt to persist image to Supabase Storage private bucket if available
  let storagePath: string | null = null;
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase-admin");
    const admin = getSupabaseAdmin();
    const fileName = `cavet_${body.caseId || "temp"}_${Date.now()}.jpg`;
    const buffer = Buffer.from(base64Data, "base64");
    const { data: uploadData, error: uploadErr } = await admin.storage
      .from("case-documents")
      .upload(fileName, buffer, { contentType: mime, upsert: true });

    if (!uploadErr && uploadData?.path) {
      storagePath = uploadData.path;
    }
  } catch {
    // Graceful fallback if storage bucket has not been provisioned yet
    storagePath = null;
  }

  // Step 3: Call Gemini AI Vision to extract structured vehicle details
  const prompt = `Bạn là chuyên gia trích xuất thông tin giấy đăng ký xe (Cà vẹt) hoặc sổ kiểm định phương tiện của Việt Nam.
Hãy đọc kỹ hình ảnh và trích xuất các thông tin sau.
CHỈ trả về một JSON object hợp lệ duy nhất, KHÔNG bọc trong markdown code fence, KHÔNG giải thích gì thêm:
{
  "licensePlate": "Biển số xe (ví dụ: 51K-123.45 hoặc 59A-987.65)",
  "ownerName": "Tên chủ xe (viết in hoa, ví dụ: NGUYỄN VĂN A)",
  "brand": "Nhãn hiệu (ví dụ: TOYOTA, HONDA, HYUNDAI)",
  "model": "Số loại / Model (ví dụ: INNOVA, VIOS, ACCENT)",
  "engineNumber": "Số máy",
  "chassisNumber": "Số khung",
  "address": "Địa chỉ ghi trên giấy đăng ký xe"
}
Nếu không đọc được trường nào, hãy để chuỗi rỗng "".`;

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mime,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.1,
        },
      }),
    });

    if (!res.ok) {
      // Security: DO NOT log sensitive customer image or vehicle PII in server log
      console.warn("Gemini API returned status code:", res.status);
      return NextResponse.json(
        { error: `Lỗi kết nối Gemini API (${res.status}): Không thể xử lý ảnh.` },
        { status: 502 }
      );
    }

    const resultJson = await res.json();
    const candidateText =
      resultJson.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

    let parsedData: {
      licensePlate?: string;
      ownerName?: string;
      brand?: string;
      model?: string;
      engineNumber?: string;
      chassisNumber?: string;
      address?: string;
    } = {};

    try {
      parsedData = JSON.parse(candidateText.replace(/```json|```/g, "").trim());
    } catch {
      return NextResponse.json(
        { error: "AI không thể đọc được cấu trúc thông tin từ ảnh này. Vui lòng kiểm tra độ nét của ảnh hoặc nhập tay." },
        { status: 422 }
      );
    }

    const hasPlate = !!parsedData.licensePlate?.trim();
    const hasOwner = !!parsedData.ownerName?.trim();
    const confidenceScore = hasPlate && hasOwner ? 0.95 : hasPlate || hasOwner ? 0.75 : 0.5;
    const confidenceLevel = hasPlate && hasOwner ? "high" : hasPlate || hasOwner ? "medium" : "low";

    if (storagePath && body.caseId) {
      try {
        const { SupabaseEntities } = await import("@/lib/supabase-entities");
        await SupabaseEntities.saveCaseFile({
          id: crypto.randomUUID(),
          case_id: body.caseId,
          storage_path: storagePath,
          file_type: mime,
          file_size: Buffer.from(base64Data, "base64").length,
          uploaded_by: staff.user.id,
          ocr_result: { ...parsedData, confidence: confidenceScore },
        });
      } catch (fErr) {
        console.warn("Could not register case file:", fErr);
      }
    }

    return NextResponse.json({
      ok: true,
      storagePath,
      confidence: confidenceLevel,
      confidenceScore,
      data: {
        licensePlate: parsedData.licensePlate?.trim() || "",
        ownerName: parsedData.ownerName?.trim() || "",
        brand: parsedData.brand?.trim() || "",
        model: parsedData.model?.trim() || "",
        engineNumber: parsedData.engineNumber?.trim() || "",
        chassisNumber: parsedData.chassisNumber?.trim() || "",
        address: parsedData.address?.trim() || "",
      },
    });
  } catch {
    console.warn("Gemini OCR exception occurred");
    return NextResponse.json(
      { error: "Đã xảy ra lỗi khi kết nối tới dịch vụ nhận diện OCR." },
      { status: 500 }
    );
  }
}
