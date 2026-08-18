import { z } from "zod";

export const demoItemSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Informe pelo menos 2 caracteres.")
    .max(80, "Máximo de 80 caracteres."),
  description: z
    .string()
    .trim()
    .max(240, "Máximo de 240 caracteres.")
    .optional()
    .or(z.literal("")),
});

export type DemoItemInput = z.infer<typeof demoItemSchema>;
