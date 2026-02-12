import { z } from 'zod/v4';

export const createLeadSchema = z.object({
  nomeCompleto: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  telefone: z
    .string()
    .min(10, 'Telefone inválido')
    .max(15, 'Telefone inválido'),
});

export type CreateLeadDto = z.infer<typeof createLeadSchema>;
