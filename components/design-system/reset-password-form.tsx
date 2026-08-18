"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/design-system/form-field";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { resetPassword } from "@/server/actions/auth";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [invalidToken, setInvalidToken] = useState(!token);
  const [success, setSuccess] = useState(false);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: token ?? "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetPasswordInput) {
    // Client validation (zodResolver) already covers password rules, so a
    // failure here only happens when the token is invalid, expired or used.
    const result = await resetPassword(values);

    if (!result.ok) {
      setInvalidToken(true);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 2500);
  }

  if (invalidToken) {
    return (
      <Card role="alert">
        <CardHeader>
          <CardTitle className="font-display text-xl">Link inválido</CardTitle>
          <CardDescription>
            Este link de redefinição é inválido ou expirou. Solicite um novo link para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/esqueci-senha">Solicitar novo link</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card role="status">
        <CardHeader>
          <div className="flex size-10 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="size-5" />
          </div>
          <CardTitle className="font-display text-xl">Senha alterada</CardTitle>
          <CardDescription>
            Sua senha foi redefinida com sucesso. Você será levado para o login em instantes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login" className="text-sm font-medium text-accent hover:underline">
            Ir para o login agora
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">Redefinir senha</CardTitle>
        <CardDescription>Crie uma nova senha para acessar sua conta.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <input type="hidden" {...form.register("token")} />

          <FormField
            label="Nova senha"
            htmlFor="password"
            error={form.formState.errors.password?.message}
          >
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!form.formState.errors.password}
              aria-describedby={form.formState.errors.password ? "password-error" : undefined}
              {...form.register("password")}
            />
          </FormField>

          <FormField
            label="Confirmar nova senha"
            htmlFor="confirmPassword"
            error={form.formState.errors.confirmPassword?.message}
          >
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              aria-invalid={!!form.formState.errors.confirmPassword}
              aria-describedby={
                form.formState.errors.confirmPassword ? "confirmPassword-error" : undefined
              }
              {...form.register("confirmPassword")}
            />
          </FormField>

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Redefinir senha
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
