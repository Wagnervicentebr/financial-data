import type { Metadata } from "next";
import { SignupForm } from "@/components/design-system/signup-form";

export const metadata: Metadata = {
  title: "Criar conta — Casca Premium",
};

export default function SignupPage() {
  return <SignupForm />;
}
