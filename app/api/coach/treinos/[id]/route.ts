import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || user.role !== 'personal') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await context.params;

    const treino = await prisma.treino.findUnique({
      where: {
        id,
        personalId: user.id,
      },
      include: {
        exercicios: {
          include: {
            sections: true,
          },
        },
      },
    });

    if (!treino) {
      return NextResponse.json({ error: 'Treino não encontrado' }, { status: 404 });
    }

    return NextResponse.json(treino);
  } catch (error) {
    console.error('Erro ao buscar treino por ID:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}