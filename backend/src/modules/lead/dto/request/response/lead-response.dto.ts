import { z } from 'zod/v4';

const consumoResponseSchema = z.object({
  id: z.string(),
  mesDoConsumo: z.string(),
  consumoForaPontaEmKWH: z.string(),
});

const unidadeResponseSchema = z.object({
  id: z.string(),
  codigoDaUnidadeConsumidora: z.string(),
  modeloFasico: z.enum(['monofasico', 'bifasico', 'trifasico']),
  enquadramento: z.enum(['AX', 'B1', 'B2', 'B3']),
  consumoEmReais: z.string(),
  mesDeReferencia: z.string(),
  consumos: z.array(consumoResponseSchema),
});

export const leadResponseSchema = z.object({
  id: z.string(),
  nomeCompleto: z.string(),
  email: z.string(),
  telefone: z.string(),
  createdAt: z.coerce.string(),
  updatedAt: z.coerce.string(),
  unidades: z.array(unidadeResponseSchema),
});

export type LeadResponseDto = z.infer<typeof leadResponseSchema>;
