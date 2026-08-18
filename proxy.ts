import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Instância própria (config sem Prisma Adapter/bcrypt): a doc do Next.js 16
// recomenda que o Proxy faça apenas checagem "otimista" via cookie/JWT, sem
// bater no banco, para não pesar em toda rota (inclusive prefetch). A
// instância completa, com acesso ao banco, vive em auth.ts e é usada por
// Server Actions/Server Components (defesa em profundidade — ver CVE-2025-29927
// na techspec).
const { auth } = NextAuth(authConfig);

// Rotas do grupo app/(auth)/ — o grupo em si não aparece na URL.
const publicRoutes = ["/login", "/cadastro", "/esqueci-senha", "/redefinir-senha"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const session = req.auth;
  // Cookie ainda válido (teto de 30 dias), mas a claim "lembrar-me" (1 ou 30
  // dias, calculada no login) já venceu — trata como não autenticado.
  const isExpired =
    typeof session?.expiresAt === "number" && session.expiresAt < Date.now();

  if (!session || isExpired) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
