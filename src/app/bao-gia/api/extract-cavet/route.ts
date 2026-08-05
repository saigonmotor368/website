import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageBase64 } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
       console.error("GEMINI_API_KEY is not set in environment variables.");
       // Tạm thời trả về mock data để test UI nếu chưa có API key
       return NextResponse.json({
         vehicleInfo: {
            ownerName: "NGUYỄN VĂN A",
            licensePlate: "59A1-123.45",
            frameNumber: "RLCXXXXXXXXXX",
            engineNumber: "JFXXXXXXX",
            brand: "HONDA",
            model: "VISION",
            color: "Đỏ",
            yearOfManufacture: 2022,
            vehicleType: "motorbike",
            registeredProvince: "TP.HCM",
         }
       });
    }

    // Prepare the prompt
    const prompt = `Đây là ảnh giấy chứng nhận đăng ký xe (cà vẹt) của Việt Nam. 
    Hãy trích xuất các thông tin sau và CHỈ trả về một JSON object hợp lệ (không có markdown backticks):
    {
      "ownerName": "tên chủ xe (viết HOA)",
      "licensePlate": "biển số xe",
      "frameNumber": "số khung",
      "engineNumber": "số máy",
      "brand": "nhãn hiệu xe",
      "model": "số loại (model)",
      "color": "màu sơn",
      "yearOfManufacture": năm sản xuất (số nguyên, nếu không thấy để 2020),
      "vehicleType": "motorbike" hoặc "car",
      "registeredProvince": "tỉnh/thành phố đăng ký"
    }`;

    // Strip the "data:image/jpeg;base64," prefix if it exists
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: "image/jpeg",
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
            responseMimeType: "application/json",
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
        console.error("Gemini API Error:", data);
        throw new Error(data.error?.message || 'Failed to extract information');
    }

    const text = data.candidates[0].content.parts[0].text;
    
    // Attempt to parse JSON safely
    let extractedInfo;
    try {
        extractedInfo = JSON.parse(text);
    } catch (e) {
        console.error("Failed to parse Gemini response as JSON:", text);
        // Clean up markdown if Gemini ignored responseMimeType
        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        extractedInfo = JSON.parse(cleanedText);
    }

    return NextResponse.json({ vehicleInfo: extractedInfo });

  } catch (error: any) {
    console.error('Error processing image:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
