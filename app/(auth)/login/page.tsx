import type { Metadata } from "next";
import { LoginForm } from "@/components/design-system/login-form";

export const metadata: Metadata = {
  title: "Entrar — Casca Premium",
};

export default function LoginPage() {
  return <LoginForm />;
}
