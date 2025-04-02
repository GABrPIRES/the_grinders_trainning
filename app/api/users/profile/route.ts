import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'segredo_super_secreto';

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const payload = await verifyToken(token); // sua função de verificação

    const { name, email } = await req.json();

    const updated = await prisma.user.update({
      where: { id: payload.id },
      data: { name, email },
    });

    const newToken = jwt.sign(
        {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
        },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

    const response = NextResponse.json({ user: updated });

    response.cookies.set('token', newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 1 dia
    });

    return response;
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json({ error: 'Erro ao atualizar perfil' }, { status: 500 });
  }
}
