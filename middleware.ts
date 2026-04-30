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
  const isRootRoute  = pathname === '/';

  // 1. Sem token: protege rotas privadas
  if (!token && (isAdminRoute || isCoachRoute || isAlunoRoute)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Com token: verifica integridade e faz roteamento
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);
      const { payload } = await jwtVerify(token, secret);
      const role = payload.role as string;

      // Segurança por Role em rotas protegidas
      if (isAdminRoute && role !== 'admin') return redirectBasedOnRole(role, request);
      if (isCoachRoute && role !== 'personal') return redirectBasedOnRole(role, request);
      if (isAlunoRoute && role !== 'aluno') return redirectBasedOnRole(role, request);

      // Usuário logado indo para /login ou / (landing page) → manda pro dashboard.
      // Isso garante que o PWA (start_url="/") entre direto no dashboard.
      if (isLoginRoute || isRootRoute) {
        return redirectBasedOnRole(role, request);
      }

    } catch (err) {
      // Token inválido ou expirado — limpa cookies
      if (isLoginRoute || isRootRoute) {
        // Já está numa rota pública: não redireciona (evita loop), apenas limpa
        const response = NextResponse.next();
        response.cookies.delete('jwt');
        response.cookies.delete('role');
        return response;
      }

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
