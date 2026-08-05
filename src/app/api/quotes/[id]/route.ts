import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dbPath = path.join(process.cwd(), 'src', 'data', 'quotes.json');

async function getQuotes() {
  try {
    const data = await fs.readFile(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function saveQuotes(quotes: any[]) {
  await fs.writeFile(dbPath, JSON.stringify(quotes, null, 2), 'utf8');
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const updateData = await req.json();
    
    const quotes = await getQuotes();
    const index = quotes.findIndex((q: any) => q.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    quotes[index] = {
      ...quotes[index],
      ...updateData,
      id, // ensure ID is not overwritten
      updatedAt: new Date().toISOString()
    };

    await saveQuotes(quotes);

    return NextResponse.json({ success: true, data: quotes[index] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    let quotes = await getQuotes();
    
    const initialLength = quotes.length;
    quotes = quotes.filter((q: any) => q.id !== id);
    
    if (quotes.length === initialLength) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    await saveQuotes(quotes);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 });
  }
}
