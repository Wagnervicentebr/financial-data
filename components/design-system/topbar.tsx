"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/design-system/theme-toggle";
import { Brand, NavList } from "@/components/design-system/sidebar";

export function Topbar() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir navegação">
            <Menu className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navegação</SheetTitle>
          <div className="flex h-full flex-col bg-sidebar">
            <Brand />
            <div className="flex-1 overflow-y-auto py-2">
              <NavList onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex-1" />

      <ThemeToggle />
      <Avatar className="size-7">
        <AvatarFallback className="bg-accent-secondary/15 text-xs font-medium text-accent-secondary">
          CP
        </AvatarFallback>
      </Avatar>
    </header>
  );
}
