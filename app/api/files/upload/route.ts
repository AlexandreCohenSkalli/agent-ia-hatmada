import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'Only .xlsx and .xls files are allowed' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file to temporary directory
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);

    // For production, consider using cloud storage like S3
    // For now, we'll just echo back the file info
    
    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileUrl: `/uploads/${fileName}`,
      type: type,
      uploadedAt: new Date().toISOString(),
      // In production, parse the Excel file and extract:
      // - Prospect names
      // - Emails
      // - Company names
      // - Industry/sector
      prospects: [
        {
          name: 'Jean Dupont',
          email: 'jean@company.com',
          company: 'Tech Solutions Inc',
          industry: 'Technology',
        },
        {
          name: 'Marie Bernard',
          email: 'marie@startup.com',
          company: 'Growth Startup',
          industry: 'SaaS',
        },
      ],
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
}
