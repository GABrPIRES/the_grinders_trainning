import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'aluno' },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json({ students });
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao buscar students' }, { status: 500 });
  }
}
