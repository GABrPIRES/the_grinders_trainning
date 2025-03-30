import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'segredo_super_secreto');

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const { payload }: any = await jwtVerify(token, JWT_SECRET);
    const { id, name, email, role } = payload;
    return NextResponse.json({ user: { id, name, email, role } });
  } catch (err) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
