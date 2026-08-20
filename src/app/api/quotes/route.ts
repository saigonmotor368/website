import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('quotes')
      .select('data')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Trích xuất lại mảng JSON từ cột data
    const quotes = data.map((row: any) => row.data);
    return NextResponse.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes from Supabase:', error);
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const quoteData = await req.json();
    
    if (!quoteData.quoteNumber) {
      return NextResponse.json({ error: 'Invalid quote data' }, { status: 400 });
    }

    const newId = `q_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    const newQuote = {
      ...quoteData,
      id: newId,
      createdAt: quoteData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { error } = await supabase
      .from('quotes')
      .insert({
        id: newId,
        created_at: newQuote.createdAt,
        data: newQuote
      });

    if (error) throw error;

    return NextResponse.json({ success: true, data: newQuote });
  } catch (error) {
    console.error('Error saving quote to Supabase:', error);
    return NextResponse.json({ error: 'Failed to save quote' }, { status: 500 });
  }
}
