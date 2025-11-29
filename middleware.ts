// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Pega o token e a role dos cookies
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;

  const { pathname } = request.nextUrl;

  // 2. Define as rotas protegidas
  const isAdminRoute = pathname.startsWith('/admin');
  const isCoachRoute = pathname.startsWith('/coach');
  const isAlunoRoute = pathname.startsWith('/aluno');

  // 3. Se estiver tentando acessar uma rota protegida SEM token, manda pro login
  if ((isAdminRoute || isCoachRoute || isAlunoRoute) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. Proteção baseada em Role (Papel do usuário)
  
  // Se tentar acessar Admin e não for admin
  if (isAdminRoute && role !== 'admin') {
    return redirectBasedOnRole(role, request);
  }

  // Se tentar acessar Coach e não for personal (coach)
  if (isCoachRoute && role !== 'personal') {
    return redirectBasedOnRole(role, request);
  }

  // Se tentar acessar Aluno e não for aluno
  if (isAlunoRoute && role !== 'aluno') {
    return redirectBasedOnRole(role, request);
  }

  // 5. Se estiver logado e tentar acessar o login, manda pro dashboard dele
  if (pathname === '/login' && token) {
      return redirectBasedOnRole(role, request);
  }

  // Se passou por tudo, deixa passar
  return NextResponse.next();
}

// Função auxiliar para redirecionar o usuário para o lugar certo se ele estiver perdido
function redirectBasedOnRole(role: string | undefined, request: NextRequest) {
    if (role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
    } else if (role === 'personal') {
        return NextResponse.redirect(new URL('/coach', request.url));
    } else if (role === 'aluno') {
        return NextResponse.redirect(new URL('/aluno', request.url));
    }
    // Se não tiver role reconhecida, manda pro login limpo
    return NextResponse.redirect(new URL('/login', request.url));
}

// Configuração: Diz ao Next.js em quais rotas esse middleware deve rodar
export const config = {
  matcher: [
    /*
     * Corresponde a todos os caminhos de solicitação, exceto:
     * 1. /api (rotas de API)
     * 2. /_next (arquivos estáticos do Next.js)
     * 3. /_static (arquivos estáticos dentro da pasta public)
     * 4. /images (suas imagens)
     * 5. /favicon.ico, /sitemap.xml (arquivos raiz)
     */
    '/((?!api|_next/static|_next/image|images|favicon.ico).*)',
  ],
};