"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FormField } from "@/components/design-system/form-field";
import { GoogleAuthButton } from "@/components/design-system/google-auth-button";
import { signUpSchema, type SignUpInput } from "@/lib/validations/auth";
import { registerUser } from "@/server/actions/auth";

export function SignupForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: SignUpInput) {
    setServerError(null);
    const result = await registerUser(values);

    if (!result.ok) {
      setServerError(result.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">Criar conta</CardTitle>
        <CardDescription>Comece a usar o sistema em poucos passos.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <FormField label="Nome" htmlFor="name" error={form.formState.errors.name?.message}>
            <Input
              id="name"
              autoComplete="name"
              aria-invalid={!!form.formState.errors.name}
              aria-describedby={form.formState.errors.name ? "name-error" : undefined}
              {...form.register("name")}
            />
          </FormField>

          <FormField label="E-mail" htmlFor="email" error={form.formState.errors.email?.message}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!form.formState.errors.email}
              aria-describedby={form.formState.errors.email ? "email-error" : undefined}
              {...form.register("email")}
            />
          </FormField>

          <FormField
            label="Senha"
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
            label="Confirmar senha"
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

          {serverError && (
            <p role="alert" className="text-xs text-destructive">
              {serverError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Criar conta
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">ou</span>
          <Separator className="flex-1" />
        </div>

        <GoogleAuthButton label="Cadastrar-se com Google" />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-accent hover:underline">
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
