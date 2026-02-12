import { MagicPdfResponseDto } from './dto/magic-pdf.dto';

export interface UnidadeFromPdf {
  codigoDaUnidadeConsumidora: string;
  modeloFasico: 'monofasico' | 'bifasico' | 'trifasico';
  enquadramento: 'AX' | 'B1' | 'B2' | 'B3';
  consumoEmReais: number;
  mesDeReferencia: string;
  historicoDeConsumo: {
    mesDoConsumo: string;
    consumoForaPontaEmKWH: number;
  }[];
}

export function mapMagicPdfToUnidade(
  response: MagicPdfResponseDto,
): UnidadeFromPdf {
  const sortedInvoices = [...response.invoice].sort(
    (a, b) =>
      new Date(b.consumo_date).getTime() - new Date(a.consumo_date).getTime(),
  );

  const last12 = sortedInvoices.slice(0, 12);

  const mesDeReferencia = last12[0].consumo_date.split('T')[0];

  const historicoDeConsumo = last12.map((invoice) => ({
    mesDoConsumo: invoice.consumo_date.split('T')[0],
    consumoForaPontaEmKWH: invoice.consumo_fp,
  }));

  return {
    codigoDaUnidadeConsumidora: response.unit_key,
    modeloFasico: response.phaseModel,
    enquadramento: response.chargingModel,
    consumoEmReais: response.valor,
    mesDeReferencia,
    historicoDeConsumo,
  };
}
