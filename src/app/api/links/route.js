import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateCode, isValidUrl, isValidCode } from '@/lib/utils';

export async function GET() {
  try {
    const links = await prisma.link.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(links);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    let { url, code } = body;

    if (!url || !isValidUrl(url)) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    if (code) {
      if (!isValidCode(code)) {
        return NextResponse.json({ error: 'Invalid code format. Must be 6-8 alphanumeric characters.' }, { status: 400 });
      }
      
      const existing = await prisma.link.findUnique({ where: { code } });
      if (existing) {
        return NextResponse.json({ error: 'Code already exists' }, { status: 409 });
      }
    } else {
     
      let retries = 0;
      while (retries < 5) {
        const newCode = generateCode();
        const existing = await prisma.link.findUnique({ where: { code: newCode } });
        if (!existing) {
          code = newCode;
          break;
        }
        retries++;
      }
      if (!code) {
        return NextResponse.json({ error: 'Failed to generate unique code' }, { status: 500 });
      }
    }

    const link = await prisma.link.create({
      data: {
        originalUrl: url,
        code,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
