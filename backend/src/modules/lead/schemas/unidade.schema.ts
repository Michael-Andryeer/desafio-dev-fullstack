import {
  mysqlTable,
  varchar,
  mysqlEnum,
  decimal,
  date,
  timestamp,
} from 'drizzle-orm/mysql-core';
import { leads } from './lead.schema';

export const unidades = mysqlTable('unidades', {
  id: varchar('id', { length: 36 }).primaryKey(),
  leadId: varchar('lead_id', { length: 36 })
    .notNull()
    .references(() => leads.id, { onDelete: 'cascade' }),
  codigoDaUnidadeConsumidora: varchar('codigo_da_unidade_consumidora', {
    length: 50,
  })
    .notNull()
    .unique(),
  modeloFasico: mysqlEnum('modelo_fasico', [
    'monofasico',
    'bifasico',
    'trifasico',
  ]).notNull(),
  enquadramento: mysqlEnum('enquadramento', ['AX', 'B1', 'B2', 'B3']).notNull(),
  consumoEmReais: decimal('consumo_em_reais', {
    precision: 10,
    scale: 2,
  }).notNull(),
  mesDeReferencia: date('mes_de_referencia').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
