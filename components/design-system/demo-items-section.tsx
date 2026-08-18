"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Inbox, Pencil, Trash2 } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/design-system/empty-state";
import { DemoItemFormDialog } from "@/components/design-system/demo-item-form-dialog";
import { deleteDemoItem } from "@/server/actions/demo-item";

export type DemoItemRow = {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date;
};

export function DemoItemsSection({ items }: { items: DemoItemRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    await deleteDemoItem(id);
    router.refresh();
    setDeletingId(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Itens de demonstração</CardTitle>
        <CardDescription>
          Mostra o padrão de tabela + formulário do design system, ligado a
          Server Actions e Prisma.
        </CardDescription>
        <CardAction>
          <DemoItemFormDialog mode="create" />
        </CardAction>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Nenhum item ainda"
            description="Os itens criados aqui aparecem nesta lista, demonstrando o fluxo completo de criar, editar e excluir."
          />
        ) : (
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Descrição
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Criado em
                  </TableHead>
                  <TableHead className="w-0 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-foreground">
                      {item.title}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {item.description || "—"}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground tabular-nums md:table-cell">
                      {format(item.createdAt, "d 'de' MMM'.' yyyy", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <DemoItemFormDialog
                          mode="edit"
                          itemId={item.id}
                          defaultValues={{
                            title: item.title,
                            description: item.description ?? "",
                          }}
                          trigger={
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              aria-label={`Editar ${item.title}`}
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                          }
                        />
                        <Button
                          size="icon-sm"
                          variant="danger-subtle"
                          aria-label={`Excluir ${item.title}`}
                          disabled={deletingId === item.id}
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
