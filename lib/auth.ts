import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'segredo_super_secreto');

export async function verifyToken(token?: string) {
  if (!token) throw new Error('Token ausente');
  const { payload }: any = await jwtVerify(token, JWT_SECRET);
  return payload;
}
