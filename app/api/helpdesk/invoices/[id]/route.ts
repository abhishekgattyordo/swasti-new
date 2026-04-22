import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // this is the appointment UUID
    const { status, method, amount } = await req.json();

    if (!status && !method && !amount) {
      return NextResponse.json(
        { success: false, message: 'Nothing to update' },
        { status: 400 }
      );
    }

    // Start transaction
    await query('BEGIN');

    try {
      const updates: string[] = [];
      const values: any[] = [];

      // Update appointment fields
      if (status) {
        updates.push(`payment_status = $${values.length + 1}`);
        values.push(status);
      }
      if (method !== undefined) {
        updates.push(`payment_method = $${values.length + 1}`);
        values.push(method);
      }
      values.push(id);

      // Update the appointment
      await query(
        `UPDATE appointments SET ${updates.join(', ')} WHERE id = $${values.length}`,
        values
      );

      // ✅ If payment status is 'paid', also update appointment status to COMPLETED
      if (status === 'paid') {
        await query(
          `UPDATE appointments 
           SET status = 'COMPLETED', 
               updated_at = NOW()
           WHERE id = $1`,
          [id]
        );

        // ✅ Also create/update invoice record if amount is provided
        if (amount) {
          // Check if invoice already exists
          const existingInvoice = await query(
            `SELECT id FROM invoices WHERE appointment_id = $1`,
            [id]
          );

          if (existingInvoice.rows.length === 0) {
            // Create new invoice
            await query(
              `INSERT INTO invoices (appointment_id, amount, status, method, created_at, updated_at)
               VALUES ($1, $2, 'paid', $3, NOW(), NOW())`,
              [id, amount, method || 'Cash']
            );
          } else {
            // Update existing invoice
            await query(
              `UPDATE invoices 
               SET amount = $1, status = 'paid', method = $2, updated_at = NOW()
               WHERE appointment_id = $3`,
              [amount, method || 'Cash', id]
            );
          }
        }
      }

      // Commit transaction
      await query('COMMIT');

      return NextResponse.json({ 
        success: true, 
        message: status === 'paid' ? 'Payment processed and appointment completed' : 'Invoice updated' 
      });

    } catch (error) {
      // Rollback on error
      await query('ROLLBACK');
      throw error;
    }

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
    
    // Start transaction
    await query('BEGIN');

    try {
      // Instead of deleting, set consultation_fee to 0
      await query(
        `UPDATE appointments SET consultation_fee = 0, payment_status = NULL, payment_method = NULL WHERE id = $1`,
        [id]
      );

      // Also reset appointment status back to BOOKED if it was COMPLETED
      await query(
        `UPDATE appointments SET status = 'BOOKED', updated_at = NOW() WHERE id = $1 AND status = 'COMPLETED'`,
        [id]
      );

      // Delete or void the invoice
      await query(
        `UPDATE invoices SET status = 'cancelled', updated_at = NOW() WHERE appointment_id = $1`,
        [id]
      );

      // Commit transaction
      await query('COMMIT');

      return NextResponse.json({ success: true, message: 'Invoice deleted and appointment reset' });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}