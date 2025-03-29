import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Chave secreta para verificar o token (convertida em Uint8Array)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "segredo_super_secreto");

const rotasProtegidas = ["/admin", "/coach", "/aluno"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
