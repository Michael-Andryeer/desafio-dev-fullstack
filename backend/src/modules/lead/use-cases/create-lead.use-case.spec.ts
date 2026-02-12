jest.mock('../../../shared/config/env', () => ({
  env: { MAGIC_PDF_API_URL: 'http://mock-url' },
}));

import { CreateLeadUseCase } from './create-lead.use-case';
import { LeadRepository } from '../repositories/lead.repository';
import { MagicPdfService } from '../../magic-pdf/magic-pdf.service';
import { NoFilesProvidedError } from '../../../shared/errors/no-files-provided.error';
import { EmailAlreadyExistsError } from '../../../shared/errors/email-already-exists.error';
import { UnitCodeAlreadyExistsError } from '../../../shared/errors/unit-code-already-exists.error';

const mockRepository: jest.Mocked<LeadRepository> = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  existsByEmail: jest.fn(),
  existsByUnitCode: jest.fn(),
};

const mockMagicPdfService = {
  decodePdf: jest.fn(),
} as unknown as jest.Mocked<MagicPdfService>;

const fakePdfResponse = {
  valor: 802.72,
  chargingModel: 'B3' as const,
  phaseModel: 'trifasico' as const,
  unit_key: '14476614',
  invoice: Array.from({ length: 13 }, (_, i) => ({
    consumo_date: new Date(2025, 9 - i, 5).toISOString(),
    consumo_fp: 5000 + i * 100,
    consumo_p: 0,
  })),
};

const baseInput = {
  nomeCompleto: 'Joao Silva',
  email: 'joao@test.com',
  telefone: '11999999999',
  files: [{ buffer: Buffer.from('pdf'), originalName: 'conta.pdf' }],
};

describe('CreateLeadUseCase', () => {
  let useCase: CreateLeadUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new CreateLeadUseCase(mockRepository, mockMagicPdfService);

    mockRepository.existsByEmail.mockResolvedValue(false);
    mockRepository.existsByUnitCode.mockResolvedValue(false);
    mockMagicPdfService.decodePdf.mockResolvedValue(fakePdfResponse);
    mockRepository.create.mockResolvedValue({
      id: '123',
      nomeCompleto: baseInput.nomeCompleto,
      email: baseInput.email,
      telefone: baseInput.telefone,
      createdAt: new Date(),
      updatedAt: new Date(),
      unidades: [],
    });
  });

  it('deve criar um lead com sucesso', async () => {
    const result = await useCase.execute(baseInput);

    expect(mockMagicPdfService.decodePdf).toHaveBeenCalledTimes(1);
    expect(mockRepository.existsByEmail).toHaveBeenCalledWith('joao@test.com');
    expect(mockRepository.create).toHaveBeenCalledTimes(1);
    expect(result.id).toBe('123');
  });

  it('deve lancar NoFilesProvidedError quando nao ha arquivos', async () => {
    await expect(
      useCase.execute({ ...baseInput, files: [] }),
    ).rejects.toThrow(NoFilesProvidedError);

    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('deve lancar EmailAlreadyExistsError quando email ja existe', async () => {
    mockRepository.existsByEmail.mockResolvedValue(true);

    await expect(useCase.execute(baseInput)).rejects.toThrow(
      EmailAlreadyExistsError,
    );

    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('deve lancar UnitCodeAlreadyExistsError quando codigo UC ja existe', async () => {
    mockRepository.existsByUnitCode.mockResolvedValue(true);

    await expect(useCase.execute(baseInput)).rejects.toThrow(
      UnitCodeAlreadyExistsError,
    );

    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('deve decodificar multiplos PDFs em paralelo', async () => {
    const inputMultipleFiles = {
      ...baseInput,
      files: [
        { buffer: Buffer.from('pdf1'), originalName: 'conta1.pdf' },
        { buffer: Buffer.from('pdf2'), originalName: 'conta2.pdf' },
      ],
    };

    await useCase.execute(inputMultipleFiles);

    expect(mockMagicPdfService.decodePdf).toHaveBeenCalledTimes(2);
  });

  it('deve verificar unicidade de email antes de decodificar PDFs', async () => {
    mockRepository.existsByEmail.mockResolvedValue(true);

    await expect(useCase.execute(baseInput)).rejects.toThrow();

    expect(mockMagicPdfService.decodePdf).not.toHaveBeenCalled();
  });
});
