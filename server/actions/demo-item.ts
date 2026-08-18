"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { demoItemSchema } from "@/lib/validations/demo-item";

export type ActionResult =
  | { ok: true }
  | { ok: false; message: string };

export async function listDemoItems() {
  return prisma.demoItem.findMany({ orderBy: { createdAt: "desc" } });
}

export async function countDemoItems() {
  return prisma.demoItem.count();
}

export async function createDemoItem(
  input: unknown
): Promise<ActionResult> {
  const parsed = demoItemSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await prisma.demoItem.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
    },
  });

  revalidatePath("/");
  return { ok: true };
}

export async function updateDemoItem(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const parsed = demoItemSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await prisma.demoItem.update({
    where: { id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
    },
  });

  revalidatePath("/");
  return { ok: true };
}

export async function deleteDemoItem(id: string): Promise<ActionResult> {
  await prisma.demoItem.delete({ where: { id } });
  revalidatePath("/");
  return { ok: true };
}
