import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'You must be logged in to edit a comment.' }, { status: 401 });
    }

    const { id } = await context.params;
    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Content is required.' }, { status: 400 });
    }

    const existingComment = await prisma.comment.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found.' }, { status: 404 });
    }

    if (existingComment.userId !== session.userId) {
      return NextResponse.json({ error: 'You can only edit your own comments.' }, { status: 403 });
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: {
        content: content.trim(),
      },
      include: {
        user: { select: { username: true } },
      },
    });

    return NextResponse.json({ message: 'Comment updated.', comment: updatedComment });
  } catch (error) {
    console.error('Comment update error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'You must be logged in to delete a comment.' }, { status: 401 });
    }

    const { id } = await context.params;

    const existingComment = await prisma.comment.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found.' }, { status: 404 });
    }

    if (existingComment.userId !== session.userId) {
      return NextResponse.json({ error: 'You can only delete your own comments.' }, { status: 403 });
    }

    // Set parentCommentId to null for any replies to avoid foreign key errors and preserve the reply thread
    await prisma.comment.updateMany({
      where: { parentCommentId: id },
      data: { parentCommentId: null },
    });

    // Delete the comment itself
    await prisma.comment.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Comment deleted.' });
  } catch (error) {
    console.error('Comment delete error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
