import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcrypt'

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

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // Verificar se todos os dados necessários foram passados
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nome, email e senha são obrigatórios.' }, { status: 400 });
    }

    // Verificar se o e-mail já está cadastrado
    const existingStudent = await prisma.user.findUnique({ where: { email } });
    if (existingStudent) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 400 });
    }

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar um novo Student
    const newStudent = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'aluno',  // Definindo a role como 'aluno' para este exemplo
      },
    });

    return NextResponse.json({ message: 'Student criado com sucesso!', student: newStudent });
  } catch (error) {
    console.error('Erro ao criar student:', error);
    return NextResponse.json({ error: 'Erro ao criar student.' }, { status: 500 });
  }
}