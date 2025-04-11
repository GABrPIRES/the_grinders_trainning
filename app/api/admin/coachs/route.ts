import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from "bcrypt"
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search')?.toLowerCase() || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      role: 'personal',
    };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.user.count({ where });

    const coachs = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ coachs, total });
  } catch (error) {
    console.error('Erro ao buscar coachs:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
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
        personal: {
          create: {}, // 👈 cria o Personal com id igual ao user.id
        },
      },
      include: {
        personal: true,
      },
    });

    return NextResponse.json({ message: 'Coach criado com sucesso!', coach: newCoach });
  } catch (error) {
    console.error('Erro ao criar coach:', error);
    return NextResponse.json({ error: 'Erro ao criar coach.' }, { status: 500 });
  }
}
