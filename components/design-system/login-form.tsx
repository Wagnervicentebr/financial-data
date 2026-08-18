"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FormField } from "@/components/design-system/form-field";
import { GoogleAuthButton } from "@/components/design-system/google-auth-button";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { loginWithCredentials } from "@/server/actions/auth";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  // `rememberMe` has a zod `.default()`, so the raw form values (before the
  // resolver applies the default) differ from `LoginInput`: the 3-generic
  // `useForm` overload lets `onSubmit` still receive the resolved `LoginInput`.
  const form = useForm<z.input<typeof loginSchema>, unknown, LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    const result = await loginWithCredentials(values);

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
        <CardTitle className="font-display text-xl">Entrar</CardTitle>
        <CardDescription>Acesse sua conta para ver seus dados financeiros.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" noValidate onSubmit={form.handleSubmit(onSubmit)}>
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
              autoComplete="current-password"
              aria-invalid={!!form.formState.errors.password}
              aria-describedby={form.formState.errors.password ? "password-error" : undefined}
              {...form.register("password")}
            />
          </FormField>

          <div className="flex items-center justify-between gap-4">
            <Controller
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="rememberMe"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <Label htmlFor="rememberMe" className="font-normal text-muted-foreground">
                    Lembrar de mim
                  </Label>
                </div>
              )}
            />
            <Link
              href="/esqueci-senha"
              className="text-sm font-medium text-accent hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>

          {serverError && (
            <p role="alert" className="text-xs text-destructive">
              {serverError}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Entrar
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">ou</span>
          <Separator className="flex-1" />
        </div>

        <GoogleAuthButton label="Entrar com Google" />

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link href="/cadastro" className="font-medium text-accent hover:underline">
            Cadastre-se
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
