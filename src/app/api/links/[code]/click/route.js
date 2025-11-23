import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request, context) {
  try {
    const params = await context.params;
    const code = params.code;

    const link = await prisma.link.findUnique({
      where: { code },
    });

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

   
    const updated = await prisma.link.update({
      where: { code },
      data: {
        clicks: { increment: 1 },
        lastClickedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error incrementing click:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
