import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Chave secreta para verificar o token (convertida em Uint8Array)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "segredo_super_secreto");

const rotasProtegidas = ["/admin", "/coach", "/aluno"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verifica se a requisição é para a rota de criação de coach
  if (pathname.startsWith("/api/admin")) {
    // Pega o token da cookie
    const token = request.cookies.get('token')?.value;

    // Se não houver token, retorna erro 401 (não autorizado)
    if (!token) {
      return NextResponse.json({ error: 'Token não encontrado. Acesso não autorizado.' }, { status: 401 });
    }

    try {
      // Verificando o token JWT
      const { payload }: any = await jwtVerify(token, JWT_SECRET);

      // Verifica se a role do usuário é 'admin'
      if (payload.role !== 'admin') {
        return NextResponse.json({ error: 'Acesso negado. Somente administradores podem criar coachs.' }, { status: 403 });
      }

      // Se a validação passar, permite o acesso à API
      return NextResponse.next();
    } catch (err) {
      // Caso o token seja inválido ou não possa ser verificado
      console.error('Token inválido:', err);
      return NextResponse.json({ error: 'Token inválido ou expirado.' }, { status: 401 });
    }
  }

  if (rotasProtegidas.some((rota) => pathname.startsWith(rota))) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const { payload }: any = await jwtVerify(token, JWT_SECRET);

      if (
        (pathname.startsWith("/admin") && payload.role !== "admin") ||
        (pathname.startsWith("/coach") && payload.role !== "personal") ||
        (pathname.startsWith("/aluno") && payload.role !== "aluno")
      ) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      return NextResponse.next();
    } catch (err) {
      console.error("Token inválido:", err);
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next(); // Rota pública
}

// Middleware válido para Edge Runtime
export const config = {
  matcher: ["/admin/:path*", "/coach/:path*", "/aluno/:path*"],
};
