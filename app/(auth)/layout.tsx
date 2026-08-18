import Link from "next/link";
import { ThemeToggle } from "@/components/design-system/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-md bg-accent text-accent-foreground">
            <span className="font-display text-sm font-semibold">C</span>
          </div>
          <span className="font-display text-[15px] font-semibold tracking-tight text-foreground">
            Casca Premium
          </span>
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
