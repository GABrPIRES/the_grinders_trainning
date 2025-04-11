import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcrypt'
import { Prisma } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const user = await verifyToken(token);

    if (!user || user.role !== 'personal') {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      role: 'aluno',
      aluno: {
        personalId: user.id,
      }
    };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.user.count({ where });

    const students = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ students, total });
  } catch (error) {
    console.error('Erro ao buscar coachs:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, phoneNumber, password, coachId } = await req.json();

    if (!name || !email || !phoneNumber || !password || !coachId) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios.' },
        { status: 400 }
      );
    }

    const existingStudent = await prisma.user.findUnique({ where: { email } });
    if (existingStudent) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'aluno',
        aluno: {
          create: {
            phoneNumber: phoneNumber, // valor default obrigatório no schema
            personal: {
              connect: { id: coachId },
            },
          },
        },
      },
      include: {
        aluno: true,
      },
    });

    return NextResponse.json({ message: 'Student criado com sucesso!', student: newStudent });
  } catch (error) {
    console.error('Erro ao criar student:', error);
    return NextResponse.json({ error: 'Erro ao criar student.' }, { status: 500 });
  }
}
