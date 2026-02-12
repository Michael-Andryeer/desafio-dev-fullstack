import { Inject, Injectable } from '@nestjs/common';
import { eq, like, sql } from 'drizzle-orm';
import { DATABASE_CONNECTION } from '../../../shared/config/database.module';
import type { Database } from '../../../shared/config/database';
import { leads } from '../schemas/lead.schema';
import { unidades } from '../schemas/unidade.schema';
import { consumos } from '../schemas/consumo.schema';
import {
  LeadRepository,
  CreateLeadData,
  LeadFilters,
  LeadWithRelations,
} from './lead.repository';

@Injectable()
export class DrizzleLeadRepository implements LeadRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  async create(data: CreateLeadData): Promise<LeadWithRelations> {
    const leadId = crypto.randomUUID();

    await this.db.transaction(async (tx) => {
      await tx.insert(leads).values({
        id: leadId,
        nomeCompleto: data.nomeCompleto,
        email: data.email,
        telefone: data.telefone,
      });

      for (const unidade of data.unidades) {
        const unidadeId = crypto.randomUUID();

        await tx.insert(unidades).values({
          id: unidadeId,
          leadId,
          codigoDaUnidadeConsumidora: unidade.codigoDaUnidadeConsumidora,
          modeloFasico: unidade.modeloFasico,
          enquadramento: unidade.enquadramento,
          consumoEmReais: String(unidade.consumoEmReais),
          mesDeReferencia: new Date(unidade.mesDeReferencia),
        });

        const consumoValues = unidade.historicoDeConsumo.map((consumo) => ({
          id: crypto.randomUUID(),
          unidadeId,
          consumoForaPontaEmKWH: String(consumo.consumoForaPontaEmKWH),
          mesDoConsumo: new Date(consumo.mesDoConsumo),
        }));

        await tx.insert(consumos).values(consumoValues);
      }
    });

    const created = await this.findById(leadId);
    return created!;
  }

  async findAll(filters?: LeadFilters): Promise<LeadWithRelations[]> {
    const result = await this.db.query.leads.findMany({
      with: {
        unidades: {
          with: {
            consumos: true,
          },
        },
      },
      where: filters ? this.buildWhereClause(filters) : undefined,
    });

    return result as unknown as LeadWithRelations[];
  }

  async findById(id: string): Promise<LeadWithRelations | null> {
    const result = await this.db.query.leads.findFirst({
      where: eq(leads.id, id),
      with: {
        unidades: {
          with: {
            consumos: true,
          },
        },
      },
    });

    return (result as unknown as LeadWithRelations) ?? null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(leads)
      .where(eq(leads.email, email));

    return result[0].count > 0;
  }

  async existsByUnitCode(code: string): Promise<boolean> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(unidades)
      .where(eq(unidades.codigoDaUnidadeConsumidora, code));

    return result[0].count > 0;
  }

  private buildWhereClause(filters: LeadFilters) {
    const conditions: ReturnType<typeof eq>[] = [];

    if (filters.nome) {
      conditions.push(like(leads.nomeCompleto, `%${filters.nome}%`));
    }

    if (filters.email) {
      conditions.push(like(leads.email, `%${filters.email}%`));
    }

    if (conditions.length === 0) return undefined;

    return conditions.length === 1
      ? conditions[0]
      : sql`${conditions.reduce(
          (acc, cond, i) => (i === 0 ? cond : sql`${acc} AND ${cond}`),
          conditions[0],
        )}`;
  }
}
