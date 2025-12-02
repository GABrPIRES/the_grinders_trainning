// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('jwt')?.value; // Nome do cookie que definimos no Rails
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  const isCoachRoute = pathname.startsWith('/coach');
  const isAlunoRoute = pathname.startsWith('/aluno');
  const isLoginRoute = pathname === '/login';

  // 1. Se não tem token e tenta acessar área protegida -> Login
  if (!token && (isAdminRoute || isCoachRoute || isAlunoRoute)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Se tem token, vamos verificar a integridade e a ROLE real
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
      const { payload } = await jwtVerify(token, secret);
      const role = payload.role as string; // 'admin', 'personal', 'aluno'

      // Proteção de Rotas baseada na Role REAL do Token
      if (isAdminRoute && role !== 'admin') {
        return redirectBasedOnRole(role, request);
      }
      if (isCoachRoute && role !== 'personal') {
        return redirectBasedOnRole(role, request);
      }
      if (isAlunoRoute && role !== 'aluno') {
        return redirectBasedOnRole(role, request);
      }

      // Se já está logado e tenta ir pro login, manda pro dashboard
      if (isLoginRoute) {
        return redirectBasedOnRole(role, request);
      }

    } catch (err) {
      // Token inválido ou adulterado (Assinatura não bate)
      // Remove o cookie e manda pro login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('jwt');
      return response;
    }
  }

  return NextResponse.next();
}

function redirectBasedOnRole(role: string, request: NextRequest) {
    if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
    if (role === 'personal') return NextResponse.redirect(new URL('/coach', request.url));
    if (role === 'aluno') return NextResponse.redirect(new URL('/aluno', request.url));
    return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico).*)'],
};