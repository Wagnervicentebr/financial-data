"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/nav-items";

function Brand() {
  return (
    <div className="flex h-14 shrink-0 items-center gap-2.5 px-5">
      <div className="flex size-7 items-center justify-center rounded-md bg-accent text-accent-foreground">
        <span className="font-display text-sm font-semibold">C</span>
      </div>
      <span className="font-display text-[15px] font-semibold tracking-tight text-foreground">
        Casca Premium
      </span>
    </div>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 px-3">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.label}
            href={item.disabled ? "#" : item.href}
            aria-disabled={item.disabled}
            aria-current={isActive ? "page" : undefined}
            onClick={(event) => {
              if (item.disabled) {
                event.preventDefault();
                return;
              }
              onNavigate?.();
            }}
            className={cn(
              "group relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
              item.disabled
                ? "cursor-not-allowed text-muted-foreground/50"
                : isActive
                  ? "text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            {isActive && (
              <motion.span
                layoutId="sidebar-active"
                className="absolute inset-0 rounded-md bg-sidebar-accent ring-1 ring-accent/30"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <Icon className="relative z-10 size-4 shrink-0" />
            <span className="relative z-10">{item.label}</span>
            {item.disabled && (
              <span className="relative z-10 ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                em breve
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <Brand />
      <div className="flex-1 overflow-y-auto py-2">
        <NavList />
      </div>
      <div className="border-t border-sidebar-border p-3">
        <p className="px-2 text-xs text-sidebar-foreground/40">
          v0.1.0 · base do produto
        </p>
      </div>
    </aside>
  );
}

export { Brand, NavList };
