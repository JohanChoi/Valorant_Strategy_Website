import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('postId');

  if (!postId) {
    return NextResponse.json({ error: 'postId is required.' }, { status: 400 });
  }

  const comments = await prisma.comment.findMany({
    where: { postId, parentCommentId: null },
    include: {
      user: { select: { username: true } },
      replies: {
        include: {
          user: { select: { username: true } },
          replies: {
            include: {
              user: { select: { username: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ comments });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'You must be logged in to comment.' }, { status: 401 });
    }

    const { postId, content, parentCommentId } = await request.json();

    if (!postId || !content?.trim()) {
      return NextResponse.json({ error: 'Post ID and content are required.' }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        userId: session.userId,
        parentCommentId: parentCommentId || null,
      },
      include: {
        user: { select: { username: true } },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error('Comment error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
