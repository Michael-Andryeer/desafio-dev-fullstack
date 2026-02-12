import { UnidadeFromPdf } from 'src/modules/magic-pdf/magic-pdf.mapper';

export interface CreateLeadData {
  nomeCompleto: string;
  email: string;
  telefone: string;
  unidades: UnidadeFromPdf[];
}

export interface LeadFilters {
  nome?: string;
  email?: string;
  codigoDaUnidadeConsumidora?: string;
}

export interface ConsumoResult {
  id: string;
  mesDoConsumo: string;
  consumoForaPontaEmKWH: string;
}

export interface UnidadeResult {
  id: string;
  codigoDaUnidadeConsumidora: string;
  modeloFasico: 'monofasico' | 'bifasico' | 'trifasico';
  enquadramento: 'AX' | 'B1' | 'B2' | 'B3';
  consumoEmReais: string;
  mesDeReferencia: string;
  consumos: ConsumoResult[];
}

export interface LeadWithRelations {
  id: string;
  nomeCompleto: string;
  email: string;
  telefone: string;
  createdAt: Date;
  updatedAt: Date;
  unidades: UnidadeResult[];
}

export interface LeadRepository {
  create(data: CreateLeadData): Promise<LeadWithRelations>;
  findAll(filters?: LeadFilters): Promise<LeadWithRelations[]>;
  findById(id: string): Promise<LeadWithRelations | null>;
  existsByEmail(email: string): Promise<boolean>;
  existsByUnitCode(code: string): Promise<boolean>;
}

export const LEAD_REPOSITORY = Symbol('LEAD_REPOSITORY');
