import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcrypt';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const coach = await prisma.user.findUnique({
        where: { id: params.id },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
  
      if (!coach) {
        return NextResponse.json({ error: 'Coach não encontrado' }, { status: 404 });
      }
  
      return NextResponse.json(coach); // Retorna os dados do coach
    } catch (error) {
      console.error('Erro ao buscar coach:', error);
      return NextResponse.json({ error: 'Erro ao buscar coach' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, email, password } = await req.json();

    // Verifique se o coach existe
    const coach = await prisma.user.findUnique({ where: { id: params.id } });
    if (!coach) {
      return NextResponse.json({ error: 'Coach não encontrado' }, { status: 404 });
    }

    // Verificar se o e-mail já está cadastrado (evitar duplicação)
    if (email !== coach.email) {  // Só verifica a duplicação se o e-mail foi alterado
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json({ error: 'Este e-mail já está cadastrado no sistema.' }, { status: 400 });
      }
    }

    // Atualize o nome e o email
    const updatedCoach = await prisma.user.update({
      where: { id: params.id },
      data: { name, email },
    });

    // Se senha foi fornecida, atualize também
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: params.id },
        data: { password: hashedPassword },
      });
    }

    return NextResponse.json({ message: 'Coach atualizado com sucesso', coach: updatedCoach });
  } catch (error) {
    console.error('Erro ao atualizar coach:', error);
    return NextResponse.json({ error: 'Erro ao atualizar coach' }, { status: 500 });
  }
}
