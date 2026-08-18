"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  demoItemSchema,
  type DemoItemInput,
} from "@/lib/validations/demo-item";
import { createDemoItem, updateDemoItem } from "@/server/actions/demo-item";

type DemoItemFormDialogProps = {
  mode: "create" | "edit";
  itemId?: string;
  defaultValues?: DemoItemInput;
  trigger?: React.ReactNode;
};

export function DemoItemFormDialog({
  mode,
  itemId,
  defaultValues,
  trigger,
}: DemoItemFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<DemoItemInput>({
    resolver: zodResolver(demoItemSchema),
    defaultValues: defaultValues ?? { title: "", description: "" },
  });

  async function onSubmit(values: DemoItemInput) {
    setServerError(null);
    const result =
      mode === "create"
        ? await createDemoItem(values)
        : await updateDemoItem(itemId as string, values);

    if (!result.ok) {
      setServerError(result.message);
      return;
    }

    setOpen(false);
    form.reset(mode === "create" ? { title: "", description: "" } : values);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setServerError(null);
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="size-4" />
            Novo item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Novo item" : "Editar item"}
            </DialogTitle>
            <DialogDescription>
              Registro de demonstração do padrão de dados do design system.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                autoComplete="off"
                aria-invalid={!!form.formState.errors.title}
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Input
                id="description"
                autoComplete="off"
                aria-invalid={!!form.formState.errors.description}
                {...form.register("description")}
              />
              {form.formState.errors.description && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            {serverError && (
              <p className="text-xs text-destructive">{serverError}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {mode === "create" ? "Criar" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
