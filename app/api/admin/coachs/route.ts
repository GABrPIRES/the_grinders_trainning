import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const coachs = await prisma.user.findMany({
      where: { role: 'personal' },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json({ coachs });
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao buscar coachs' }, { status: 500 });
  }
}
