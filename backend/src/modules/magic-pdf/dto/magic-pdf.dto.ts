import { z } from 'zod/v4';

export const magicPdfResponseSchema = z.object({
  valor: z.number(),
  barcode: z.string().optional(),
  chargingModel: z.enum(['AX', 'B1', 'B2', 'B3']),
  phaselModel: z.enum(['monofasico', 'bifasico', 'trifasico']),
  unit_key: z.string(),
  invoice: z
    .array(
      z.object({
        consumo_date: z.string().datetime(),
        consumo_fp: z.number(),
        consumo_pf: z.number(),
      }),
    )
    .min(12, 'A fatura deve conter pelo menos 12 meses de histórico'),
  energy_company_id: z.string().optional(),
});

export type MagicPdfResponseDto = z.infer<typeof magicPdfResponseSchema>;
