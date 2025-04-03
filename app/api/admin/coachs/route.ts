import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from "bcrypt"

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

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    // Verificar se todos os dados necessários foram passados
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nome, email e senha são obrigatórios.' }, { status: 400 });
    }

    // Verificar se o e-mail já está cadastrado
    const existingCoach = await prisma.user.findUnique({ where: { email } });
    if (existingCoach) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 400 });
    }

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar um novo coach
    const newCoach = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'personal',  // Definindo a role como 'personal' para este exemplo
      },
    });

    return NextResponse.json({ message: 'Coach criado com sucesso!', coach: newCoach });
  } catch (error) {
    console.error('Erro ao criar coach:', error);
    return NextResponse.json({ error: 'Erro ao criar coach.' }, { status: 500 });
  }
}
