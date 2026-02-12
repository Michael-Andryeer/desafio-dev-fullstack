import { mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';
import { unidades } from './unidade.schema';

export const leads = mysqlTable('leads', {
  id: varchar('id', { length: 36 }).primaryKey(),
  nomeCompleto: varchar('nome_completo', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  telefone: varchar('telefone', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const leadsRelations = relations(leads, ({ many }) => ({
  unidades: many(unidades),
}));
