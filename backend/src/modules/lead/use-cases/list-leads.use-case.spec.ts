import { ListLeadsUseCase } from './list-leads.use-case';
import { LeadRepository } from '../repositories/lead.repository';

const mockRepository: jest.Mocked<LeadRepository> = {
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  existsByEmail: jest.fn(),
  existsByUnitCode: jest.fn(),
};

describe('ListLeadsUseCase', () => {
  let useCase: ListLeadsUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new ListLeadsUseCase(mockRepository);
  });

  it('deve retornar todos os leads sem filtros', async () => {
    mockRepository.findAll.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(mockRepository.findAll).toHaveBeenCalledWith(undefined);
    expect(result).toEqual([]);
  });

  it('deve passar filtros para o repository', async () => {
    const filters = { nome: 'Joao', email: 'joao@test.com' };
    mockRepository.findAll.mockResolvedValue([]);

    await useCase.execute(filters);

    expect(mockRepository.findAll).toHaveBeenCalledWith(filters);
  });

  it('deve retornar a lista de leads do repository', async () => {
    const fakeLead = {
      id: '123',
      nomeCompleto: 'Joao',
      email: 'joao@test.com',
      telefone: '11999999999',
      createdAt: new Date(),
      updatedAt: new Date(),
      unidades: [],
    };
    mockRepository.findAll.mockResolvedValue([fakeLead]);

    const result = await useCase.execute();

    expect(result).toHaveLength(1);
    expect(result[0].nomeCompleto).toBe('Joao');
  });
});
