import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src', 'data', 'quotes.json');

async function getQuotes() {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Nếu file chưa có hoặc lỗi parse, trả về mảng rỗng
    return [];
  }
}

async function saveQuotes(quotes: any[]) {
  await fs.writeFile(dbPath, JSON.stringify(quotes, null, 2), 'utf8');
}

export async function GET() {
  try {
    const quotes = await getQuotes();
    // Sort by createdAt desc
    quotes.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(quotes);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const quoteData = await req.json();
    
    // Validate
    if (!quoteData.quoteNumber) {
      return NextResponse.json({ error: 'Invalid quote data' }, { status: 400 });
    }

    const quotes = await getQuotes();
    
    // Add unique ID if not exists
    const newQuote = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...quoteData,
      createdAt: quoteData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    quotes.push(newQuote);
    await saveQuotes(quotes);

    return NextResponse.json({ success: true, data: newQuote });
  } catch (error) {
    console.error('Error saving quote:', error);
    return NextResponse.json({ error: 'Failed to save quote' }, { status: 500 });
  }
}
