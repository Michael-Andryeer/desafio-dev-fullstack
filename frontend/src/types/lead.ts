export interface Consumo {
  id: string;
  mesDoConsumo: string;
  consumoForaPontaEmKWH: string;
}

export interface Unidade {
  id: string;
  codigoDaUnidadeConsumidora: string;
  modeloFasico: "monofasico" | "bifasico" | "trifasico";
  enquadramento: "AX" | "B1" | "B2" | "B3";
  consumoEmReais: string;
  mesDeReferencia: string;
  consumos: Consumo[];
}

export interface Lead {
  id: string;
  nomeCompleto: string;
  email: string;
  telefone: string;
  createdAt: string;
  updatedAt: string;
  unidades: Unidade[];
}

export interface LeadFilters {
  nome?: string;
  email?: string;
  codigoDaUnidadeConsumidora?: string;
  page?: number;
  limit?: number;
}
