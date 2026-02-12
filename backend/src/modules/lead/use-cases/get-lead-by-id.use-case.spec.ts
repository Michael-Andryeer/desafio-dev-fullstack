import { NotFoundException } from '@nestjs/common';
import { GetLeadByIdUseCase } from './get-lead-by-id.use-case';
import { LeadRepository } from '../repositories/lead.repository';

const mockRepository: jest.Mocked<LeadRepository> = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  existsByEmail: jest.fn(),
  existsByUnitCode: jest.fn(),
};

describe('GetLeadByIdUseCase', () => {
  let useCase: GetLeadByIdUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetLeadByIdUseCase(mockRepository);
  });

  it('deve retornar o lead quando encontrado', async () => {
    const fakeLead = {
      id: '123',
      nomeCompleto: 'Joao',
      email: 'joao@test.com',
      telefone: '11999999999',
      createdAt: new Date(),
      updatedAt: new Date(),
      unidades: [],
    };
    mockRepository.findById.mockResolvedValue(fakeLead);

    const result = await useCase.execute('123');

    expect(mockRepository.findById).toHaveBeenCalledWith('123');
    expect(result.id).toBe('123');
  });

  it('deve lancar NotFoundException quando lead nao existe', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('inexistente')).rejects.toThrow(
      NotFoundException,
    );
  });
});
