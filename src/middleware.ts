import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  const currentHost =
    process.env.NODE_ENV === 'production' && process.env.VERCEL === '1'
      ? hostname.replace(`.toothfy.com`, '')
      : hostname.replace(`.localhost:3000`, '');

  const response = NextResponse.next();

  if (currentHost && currentHost !== 'localhost:3000' && currentHost !== 'toothfy.com') {
    // Adiciona o subdomínio no header para que server components/actions possam ler
    response.headers.set('x-tenant-subdomain', currentHost);
  }

  // Rotas que exigem autenticação
  const isAppRoute = pathname.startsWith("/app");
  
  // Rotas exclusivas para não-autenticados (Login, Registro)
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  if (isAppRoute || isAuthRoute) {
    try {
      const authRes = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      });

      const session = await authRes.json().catch(() => null);

      if (isAppRoute && !session) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      if (isAuthRoute && session) {
        return NextResponse.redirect(new URL("/app", request.url));
      }
    } catch (err) {
      if (isAppRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
