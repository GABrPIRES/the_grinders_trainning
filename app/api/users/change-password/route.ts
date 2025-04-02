import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    const payload = await verifyToken(token);

    const { atual, nova } = await req.json();

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    const senhaOk = await bcrypt.compare(atual, user.password);
    if (!senhaOk) return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 401 });

    const novaHash = await bcrypt.hash(nova, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: novaHash },
    });

    return NextResponse.json({ message: 'Senha atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return NextResponse.json({ error: 'Erro ao alterar senha' }, { status: 500 });
  }
}
