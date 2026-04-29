import { NextRequest, NextResponse } from 'next/server';
import { query } from "@/lib/db";
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('avatar') as File;
    const staffId = formData.get('staffId') as string;

    console.log('Upload avatar request received:');
    console.log('- staffId:', staffId);
    console.log('- file:', file?.name, file?.type, file?.size);

    if (!file || !staffId) {
      return NextResponse.json(
        { success: false, message: 'File and staff ID are required' },
        { status: 400 }
      );
    }

    // Ensure uploads directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = `avatar-${staffId}-${timestamp}.${extension}`;
    
    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    
    console.log('File saved to:', filePath);

    // Generate the URL path
    const avatarUrl = `/uploads/avatars/${fileName}`;
    console.log('Avatar URL:', avatarUrl);

    // Update staff record with avatar URL
    const updateResult = await query(
      'UPDATE staff SET avatar_url = $1, updated_at = NOW() WHERE id = $2 RETURNING id, avatar_url',
      [avatarUrl, parseInt(staffId)]
    );

    console.log('Database update result:', updateResult.rows[0]);

    return NextResponse.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { 
        avatarUrl,
        staffId: parseInt(staffId),
      },
    });

  } catch (error) {
    console.error('Error uploading avatar:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to upload avatar',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}