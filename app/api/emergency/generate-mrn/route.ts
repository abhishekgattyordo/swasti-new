// app/api/emergency/generate-mrn/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

function generateMRN(): string {
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `MRN-${year}${month}${day}-${random}`;
}

async function isMRNUnique(mrn: string): Promise<boolean> {
  const result = await query(
    'SELECT COUNT(*) FROM emergency_assessments WHERE uhid = $1',
    [mrn]
  );
  return parseInt(result.rows[0].count) === 0;
}

export async function GET(request: NextRequest) {
  try {
    let mrn = generateMRN();
    let attempts = 0;
    let isUnique = await isMRNUnique(mrn);
    
    while (!isUnique && attempts < 10) {
      mrn = generateMRN();
      isUnique = await isMRNUnique(mrn);
      attempts++;
    }
    
    return NextResponse.json({ success: true, mrn });
  } catch (error) {
    console.error('Error generating MRN:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate MRN' },
      { status: 500 }
    );
  }
}