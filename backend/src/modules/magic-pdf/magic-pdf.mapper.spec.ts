import { mapMagicPdfToUnidade } from './magic-pdf.mapper';
import { MagicPdfResponseDto } from './dto/magic-pdf.dto';

const buildFakeResponse = (invoiceCount = 13): MagicPdfResponseDto => ({
  valor: 802.72,
  chargingModel: 'B3',
  phaseModel: 'trifasico',
  unit_key: '14476614',
  invoice: Array.from({ length: invoiceCount }, (_, i) => ({
    consumo_date: new Date(2025, 9 - i, 5).toISOString(),
    consumo_fp: 5000 + i * 100,
    consumo_p: 0,
  })),
});

describe('mapMagicPdfToUnidade', () => {
  it('deve mapear os campos da API para o dominio corretamente', () => {
    const response = buildFakeResponse();
    const result = mapMagicPdfToUnidade(response);

    expect(result.codigoDaUnidadeConsumidora).toBe('14476614');
    expect(result.modeloFasico).toBe('trifasico');
    expect(result.enquadramento).toBe('B3');
    expect(result.consumoEmReais).toBe(802.72);
  });

  it('deve pegar apenas os 12 meses mais recentes quando API retorna 13', () => {
    const response = buildFakeResponse(13);
    const result = mapMagicPdfToUnidade(response);

    expect(result.historicoDeConsumo).toHaveLength(12);
  });

  it('deve definir o mes de referencia como o mais recente', () => {
    const response = buildFakeResponse();
    const result = mapMagicPdfToUnidade(response);

    expect(result.mesDeReferencia).toBe('2025-10-05');
  });

  it('deve ordenar os invoices por data descendente', () => {
    const response = buildFakeResponse();
    response.invoice.reverse();

    const result = mapMagicPdfToUnidade(response);

    const dates = result.historicoDeConsumo.map((c) => c.mesDoConsumo);
    const sorted = [...dates].sort((a, b) => b.localeCompare(a));
    expect(dates).toEqual(sorted);
  });

  it('deve converter consumo_date ISO para formato YYYY-MM-DD', () => {
    const response = buildFakeResponse();
    const result = mapMagicPdfToUnidade(response);

    result.historicoDeConsumo.forEach((consumo) => {
      expect(consumo.mesDoConsumo).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  it('deve mapear consumo_fp para consumoForaPontaEmKWH', () => {
    const response = buildFakeResponse();
    const result = mapMagicPdfToUnidade(response);

    expect(result.historicoDeConsumo[0].consumoForaPontaEmKWH).toBe(5000);
  });

  it('nao deve mutar o array de invoice original', () => {
    const response = buildFakeResponse();
    const originalFirst = response.invoice[0].consumo_date;

    mapMagicPdfToUnidade(response);

    expect(response.invoice[0].consumo_date).toBe(originalFirst);
  });
});
