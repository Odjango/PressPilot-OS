
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs-extra';
import path from 'path';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Create uploads dir absolute path
        const uploadsDir = path.join(process.cwd(), 'public/uploads');
        await fs.ensureDir(uploadsDir);

        // Generate safe filename
        const ext = path.extname(file.name) || '.png';
        const filename = `logo-${randomUUID()}${ext}`;
        const filePath = path.join(uploadsDir, filename);

        await fs.writeFile(filePath, buffer);

        // Return path relative to public (for <img src>) AND absolute path (for generator)
        // Generator needs Absolute Path to extract colors
        return NextResponse.json({
            success: true,
            url: `/uploads/${filename}`,
            absolutePath: filePath
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
