import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcrypt';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
      const student = await prisma.user.findUnique({
        where: { id: params.id },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
  
      if (!student) {
        return NextResponse.json({ error: 'Student não encontrado' }, { status: 404 });
      }
  
      return NextResponse.json(student); // Retorna os dados do student
    } catch (error) {
      console.error('Erro ao buscar student:', error);
      return NextResponse.json({ error: 'Erro ao buscar student' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, email, password } = await req.json();

    // Verifique se o student existe
    const student = await prisma.user.findUnique({ where: { id: params.id } });
    if (!student) {
      return NextResponse.json({ error: 'Student não encontrado' }, { status: 404 });
    }

    // Verificar se o e-mail já está cadastrado (evitar duplicação)
    if (email !== student.email) {  // Só verifica a duplicação se o e-mail foi alterado
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json({ error: 'Este e-mail já está cadastrado no sistema.' }, { status: 400 });
      }
    }

    // Atualize o nome e o email
    const updatedStudent = await prisma.user.update({
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

    return NextResponse.json({ message: 'Student atualizado com sucesso', coach: updatedStudent });
  } catch (error) {
    console.error('Erro ao atualizar student:', error);
    return NextResponse.json({ error: 'Erro ao atualizar student' }, { status: 500 });
  }
}