import type { LucideIcon } from "lucide-react";
import { Activity, LayoutDashboard, Settings } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
};

/**
 * Placeholder shell navigation. Generic SaaS sections only — no domain
 * screens should be added here until the product's actual scope is defined.
 */
export const navItems: NavItem[] = [
  { label: "Visão geral", href: "/", icon: LayoutDashboard },
  { label: "Atividade", href: "#", icon: Activity, disabled: true },
  { label: "Configurações", href: "#", icon: Settings, disabled: true },
];
