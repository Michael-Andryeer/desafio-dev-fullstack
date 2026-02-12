import { z } from 'zod/v4';

const envSchema = z.object({
  DATABASE_HOST: z.string(),
  DATABASE_PORT: z.coerce.number().default(3306),
  DATABASE_USER: z.string(),
  DATABASE_PASSWORD: z.string(),
  DATABASE_NAME: z.string(),
  PORT: z.coerce.number().default(3000),
  MAGIC_PDF_API_URL: z
    .string()
    .url()
    .default('https://magic-pdf.solarium.newsun.energy/v1/magic-pdf'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Varíaveis de ambiente inválidas', result.error.format());
    process.exit(1);
  }
  return result.data;
}

export const env = validateEnv();
