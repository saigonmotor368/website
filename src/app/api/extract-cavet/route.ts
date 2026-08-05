import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { images } = await req.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: 'Vui lòng cung cấp ít nhất một hình ảnh (base64) trong mảng images' },
        { status: 400 }
      );
    }

    // Chuẩn bị parts cho Gemini
    const parts = images.map((base64String: string) => {
      // Bỏ phần tiền tố data:image/jpeg;base64, nếu có
      const base64Data = base64String.replace(/^data:image\/\w+;base64,/, "");
      return {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        }
      };
    });

    const prompt = `Bạn là một trợ lý AI chuyên nghiệp giúp trích xuất thông tin từ Giấy đăng ký xe (Cà vẹt) hoặc Sổ đăng kiểm của Việt Nam. 
Hãy đọc kỹ các hình ảnh được cung cấp (có thể bao gồm mặt trước, mặt sau hoặc nhiều trang) và trích xuất các thông tin sau.
Trả về dữ liệu dưới định dạng JSON chính xác như cấu trúc sau, không kèm theo bất kỳ văn bản nào khác. BẮT BUỘC SỬ DỤNG CÁC TÊN TRƯỜNG BẰNG TIẾNG ANH NHƯ SAU:
{
  "licensePlate": "Biển số xe (ví dụ: 51H-123.45)",
  "ownerName": "Tên chủ xe (ví dụ: NGUYEN VAN A)",
  "brand": "Nhãn hiệu (ví dụ: TOYOTA, HONDA, KIA)",
  "model": "Số loại (ví dụ: VIOS, SH 150i)",
  "vehicleType": "Phân loại xe (chỉ trả về 'car' nếu là ô tô/xe tải, 'motorbike' nếu là xe máy/mô tô)",
  "frameNumber": "Số khung",
  "yearOfManufacture": "Năm sản xuất (chỉ ghi số nguyên, ví dụ: 2021. Nếu không thấy thì để 2020)",
  "registeredProvince": "Tỉnh/Thành phố đăng ký (Rút trích từ Địa chỉ)",
  "originalPrice": "Dựa vào Nhãn hiệu (brand), Số loại (model) và Năm sản xuất, hãy TỰ ĐỘNG tra cứu/ước lượng giá trị mua mới của chiếc xe này tại Việt Nam (theo VNĐ). Chỉ trả về số nguyên (ví dụ: 45000000). Trả về 0 nếu hoàn toàn không thể đoán."
}
Nếu không tìm thấy thông tin cho một trường nào đó, hãy để giá trị là chuỗi rỗng "". Riêng yearOfManufacture là số.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            ...parts
          ],
        }
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    let resultText = response.text || "{}";
    resultText = resultText.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(resultText);

    return NextResponse.json(data);

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    return NextResponse.json(
      { error: 'Không thể trích xuất thông tin. Vui lòng kiểm tra lại hình ảnh và thử lại.' },
      { status: 500 }
    );
  }
}
