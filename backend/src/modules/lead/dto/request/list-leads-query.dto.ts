import { z } from 'zod/v4';

export const listLeadsQuerySchema = z.object({
  nome: z.string().optional(),
  email: z.string().optional(),
  codigoDaUnidadeConsumidora: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type ListLeadsQueryDto = z.infer<typeof listLeadsQuerySchema>;
