// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('jwt')?.value;
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  const isCoachRoute = pathname.startsWith('/coach');
  const isAlunoRoute = pathname.startsWith('/aluno');
  const isLoginRoute = pathname === '/login';

  // 1. Se não tem token e tenta acessar rota protegida -> Login
  if (!token && (isAdminRoute || isCoachRoute || isAlunoRoute)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Se tem token, vamos verificar a integridade
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
      const { payload } = await jwtVerify(token, secret);
      const role = payload.role as string;

      // Redirecionamento de segurança por Role
      if (isAdminRoute && role !== 'admin') return redirectBasedOnRole(role, request);
      if (isCoachRoute && role !== 'personal') return redirectBasedOnRole(role, request);
      if (isAlunoRoute && role !== 'aluno') return redirectBasedOnRole(role, request);

      // Se já está logado e tenta ir pro login, manda pro dashboard
      if (isLoginRoute) {
        return redirectBasedOnRole(role, request);
      }

    } catch (err) {
      console.error("Erro de validação do JWT:", err);

      // --- AQUI ESTÁ A CORREÇÃO DO LOOP ---
      // Se o token for inválido, precisamos apagá-lo.
      
      // Se eu JÁ estou no login, NÃO redireciono (para evitar loop).
      // Apenas apago o cookie e deixo a página carregar para o usuário tentar de novo.
      if (isLoginRoute) {
        const response = NextResponse.next();
        response.cookies.delete('jwt');
        response.cookies.delete('role');
        return response;
      }

      // Se eu estou em outra página, aí sim mando pro login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('jwt');
      response.cookies.delete('role');
      return response;
    }
  }

  return NextResponse.next();
}

function redirectBasedOnRole(role: string, request: NextRequest) {
    if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
    if (role === 'personal') return NextResponse.redirect(new URL('/coach', request.url));
    if (role === 'aluno') return NextResponse.redirect(new URL('/aluno', request.url));
    // Fallback para evitar loops se a role for desconhecida
    return NextResponse.next(); 
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|images|favicon.ico).*)'],
};