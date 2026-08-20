import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://dummy.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const updateData = await req.json();
    
    // Đảm bảo không ghi đè ID trong data JSONB
    updateData.id = id;
    updateData.updatedAt = new Date().toISOString();

    const { error } = await supabase
      .from('quotes')
      .update({
        data: updateData
      })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true, data: updateData });
  } catch (error) {
    console.error('Error updating quote in Supabase:', error);
    return NextResponse.json({ error: 'Failed to update quote' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    
    const { error } = await supabase
      .from('quotes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting quote in Supabase:', error);
    return NextResponse.json({ error: 'Failed to delete quote' }, { status: 500 });
  }
}
