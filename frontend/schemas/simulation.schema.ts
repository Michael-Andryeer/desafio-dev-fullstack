import { z } from "zod/v4";

export const simulationFormSchema = z.object({
  nomeCompleto: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  telefone: z
    .string()
    .min(10, "Telefone deve ter pelo menos 10 dígitos")
    .max(15, "Telefone deve ter no máximo 15 dígitos"),
  files: z
    .array(z.instanceof(File))
    .min(1, "Envie pelo menos uma conta de energia")
    .refine(
      (files) => files.every((f) => f.type === "application/pdf"),
      "Apenas arquivos PDF são aceitos",
    ),
});

export type SimulationFormData = z.infer<typeof simulationFormSchema>;
