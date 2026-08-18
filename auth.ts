import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authConfig } from "@/auth.config";
import { verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
        rememberMe: { label: "Lembrar de mim", type: "text" },
      },
      async authorize(credentials) {
        const parsed = loginSchema
          .pick({ email: true, password: true })
          .safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        // Conta 100% Google (sem passwordHash) não autentica por credenciais.
        if (!user?.passwordHash) return null;

        const isValid = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          rememberMe: credentials?.rememberMe === "true",
        };
      },
    }),
    Google({
      // Vincula login Google a uma conta já existente com o mesmo e-mail
      // (requisito 15 do PRD). Seguro aqui porque o Google só emite login
      // OAuth para e-mails que ele mesmo já verificou.
      allowDangerousEmailAccountLinking: true,
    }),
  ],
});
