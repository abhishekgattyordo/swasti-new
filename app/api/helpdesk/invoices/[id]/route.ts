import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;          // this is the appointment UUID
    const { status, method } = await req.json();

    if (!status && !method) {
      return NextResponse.json(
        { success: false, message: 'Nothing to update' },
        { status: 400 }
      );
    }

    const updates: string[] = [];
    const values: any[] = [];
    if (status) {
      updates.push(`payment_status = $${values.length + 1}`);
      values.push(status);
    }
    if (method !== undefined) {
      updates.push(`payment_method = $${values.length + 1}`);
      values.push(method);
    }
    values.push(id);

    await query(
      `UPDATE appointments SET ${updates.join(', ')} WHERE id = $${values.length}`,
      values
    );

    return NextResponse.json({ success: true, message: 'Invoice updated' });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Instead of deleting, set consultation_fee to 0
    await query(
      `UPDATE appointments SET consultation_fee = 0 WHERE id = $1`,
      [id]
    );
    return NextResponse.json({ success: true, message: 'Invoice deleted' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}