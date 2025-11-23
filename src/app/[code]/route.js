import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, context) {
  try {
    const params = await context.params;
    const code = params.code;

    const link = await prisma.link.findUnique({
      where: { code },
    });

    if (!link) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Increment clicks
    await prisma.link.update({
      where: { code },
      data: {
        clicks: { increment: 1 },
        lastClickedAt: new Date(),
      },
    });

    return NextResponse.redirect(link.originalUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
