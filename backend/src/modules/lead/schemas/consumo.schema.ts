import {
  mysqlTable,
  varchar,
  decimal,
  date,
  timestamp,
  unique,
} from 'drizzle-orm/mysql-core';
import { unidades } from './unidade.schema';

export const consumos = mysqlTable(
  'consumos',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    unidadeId: varchar('unidade_id', { length: 36 })
      .notNull()
      .references(() => unidades.id, { onDelete: 'cascade' }),
    consumoForaPontaEmKWH: decimal('consumo_fora_ponta_em_kwh', {
      precision: 10,
      scale: 2,
    }).notNull(),
    mesDoConsumo: date('mes_do_consumo').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [unique('uq_unidade_mes').on(table.unidadeId, table.mesDoConsumo)],
);
