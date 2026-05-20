import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { MAPS } from '@/lib/maps';
import { put } from '@vercel/blob';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'You must be logged in to upload.' }, { status: 401 });
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const mapName = formData.get('mapName') as string;
    const siteName = formData.get('siteName') as string;
    const files = formData
      .getAll('files')
      .filter((value): value is File => value instanceof File && value.size > 0);
    const legacyFile = formData.get('file');

    if (files.length === 0 && legacyFile instanceof File && legacyFile.size > 0) {
      files.push(legacyFile);
    }

    if (!title || !mapName || !siteName || files.length === 0) {
      return NextResponse.json({ error: 'Title, map, site, and at least one file are required.' }, { status: 400 });
    }

    // Validate map and site
    const mapKey = Object.keys(MAPS).find((k) => k.toLowerCase() === mapName.toLowerCase());
    if (!mapKey || !MAPS[mapKey].includes(siteName.toUpperCase())) {
      return NextResponse.json({ error: 'Invalid map or site.' }, { status: 400 });
    }

    const mediaItems = [];
    for (const [index, file] of files.entries()) {
      const mimeType = file.type;
      let mediaType: string;
      if (mimeType.startsWith('image/')) {
        mediaType = 'image';
      } else if (mimeType.startsWith('video/')) {
        mediaType = 'video';
      } else {
        return NextResponse.json({ error: 'Only image and video files are allowed.' }, { status: 400 });
      }

      const ext = path.extname(file.name) || (mediaType === 'image' ? '.png' : '.mp4');
      const fileName = `${Date.now()}-${index}-${Math.random().toString(36).substring(2, 8)}${ext}`;
      const pathname = `uploads/${mapKey.toLowerCase()}/${siteName.toUpperCase()}/${fileName}`;
      
      // Upload file directly to Vercel Blob
      const blob = await put(pathname, file, {
        access: 'public',
      });

      mediaItems.push({
        url: blob.url,
        type: mediaType,
        order: index,
      });
    }

    const coverMedia = mediaItems[0];

    const post = await prisma.post.create({
      data: {
        title,
        description: description || '',
        mediaUrl: coverMedia.url,
        mediaType: coverMedia.type,
        mapName: mapKey,
        siteName: siteName.toUpperCase(),
        userId: session.userId,
        media: {
          create: mediaItems,
        },
      },
      include: { media: { orderBy: { order: 'asc' } } },
    });

    return NextResponse.json({ message: 'Upload successful.', post }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
