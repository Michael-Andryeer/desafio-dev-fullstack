jest.mock('../../shared/config/env', () => ({
  env: { MAGIC_PDF_API_URL: 'http://mock-url' },
}));

import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { LeadController } from './lead.controller';
import { CreateLeadUseCase } from './use-cases/create-lead.use-case';
import { ListLeadsUseCase } from './use-cases/list-leads.use-case';
import { GetLeadByIdUseCase } from './use-cases/get-lead-by-id.use-case';
import { DomainErrorFilter } from '../../shared/filters/domain-error.filter';
import { NoFilesProvidedError } from '../../shared/errors/no-files-provided.error';
import { EmailAlreadyExistsError } from '../../shared/errors/email-already-exists.error';
import { NotFoundException } from '@nestjs/common';

const mockCreateLead = { execute: jest.fn() };
const mockListLeads = { execute: jest.fn() };
const mockGetLeadById = { execute: jest.fn() };

describe('LeadController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [LeadController],
      providers: [
        { provide: CreateLeadUseCase, useValue: mockCreateLead },
        { provide: ListLeadsUseCase, useValue: mockListLeads },
        { provide: GetLeadByIdUseCase, useValue: mockGetLeadById },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalFilters(new DomainErrorFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /leads', () => {
    const fakeLead = {
      id: '123',
      nomeCompleto: 'Joao Silva',
      email: 'joao@test.com',
      telefone: '11999999999',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      unidades: [],
    };

    it('deve retornar 201 com dados validos e arquivo', async () => {
      mockCreateLead.execute.mockResolvedValue(fakeLead);

      const res = await request(app.getHttpServer())
        .post('/leads')
        .field('nomeCompleto', 'Joao Silva')
        .field('email', 'joao@test.com')
        .field('telefone', '11999999999')
        .attach('files', Buffer.from('fake-pdf'), 'conta.pdf');

      expect(res.status).toBe(201);
      expect(res.body.id).toBe('123');
      expect(mockCreateLead.execute).toHaveBeenCalledTimes(1);
    });

    it('deve retornar 400 quando email e invalido', async () => {
      const res = await request(app.getHttpServer())
        .post('/leads')
        .field('nomeCompleto', 'Joao Silva')
        .field('email', 'email-invalido')
        .field('telefone', '11999999999')
        .attach('files', Buffer.from('fake-pdf'), 'conta.pdf');

      expect(res.status).toBe(400);
      expect(mockCreateLead.execute).not.toHaveBeenCalled();
    });

    it('deve retornar 400 quando nome tem menos de 3 caracteres', async () => {
      const res = await request(app.getHttpServer())
        .post('/leads')
        .field('nomeCompleto', 'Jo')
        .field('email', 'joao@test.com')
        .field('telefone', '11999999999')
        .attach('files', Buffer.from('fake-pdf'), 'conta.pdf');

      expect(res.status).toBe(400);
      expect(mockCreateLead.execute).not.toHaveBeenCalled();
    });

    it('deve retornar 400 quando use case lanca NoFilesProvidedError', async () => {
      mockCreateLead.execute.mockRejectedValue(new NoFilesProvidedError());

      const res = await request(app.getHttpServer())
        .post('/leads')
        .field('nomeCompleto', 'Joao Silva')
        .field('email', 'joao@test.com')
        .field('telefone', '11999999999')
        .attach('files', Buffer.from('fake-pdf'), 'conta.pdf');

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        'Envie pelo menos uma conta de energia',
      );
    });

    it('deve retornar 409 quando use case lanca EmailAlreadyExistsError', async () => {
      mockCreateLead.execute.mockRejectedValue(
        new EmailAlreadyExistsError('joao@test.com'),
      );

      const res = await request(app.getHttpServer())
        .post('/leads')
        .field('nomeCompleto', 'Joao Silva')
        .field('email', 'joao@test.com')
        .field('telefone', '11999999999')
        .attach('files', Buffer.from('fake-pdf'), 'conta.pdf');

      expect(res.status).toBe(409);
      expect(res.body.statusCode).toBe(409);
    });
  });

  describe('GET /leads/:id', () => {
    it('deve retornar 200 quando lead existe', async () => {
      const fakeLead = {
        id: '123',
        nomeCompleto: 'Joao Silva',
        email: 'joao@test.com',
        telefone: '11999999999',
        unidades: [],
      };
      mockGetLeadById.execute.mockResolvedValue(fakeLead);

      const res = await request(app.getHttpServer()).get('/leads/123');

      expect(res.status).toBe(200);
      expect(res.body.id).toBe('123');
    });

    it('deve retornar 404 quando lead nao existe', async () => {
      mockGetLeadById.execute.mockRejectedValue(
        new NotFoundException('Lead com id "999" nao encontrado'),
      );

      const res = await request(app.getHttpServer()).get('/leads/999');

      expect(res.status).toBe(404);
    });
  });

  describe('GET /leads', () => {
    it('deve retornar 200 com lista de leads', async () => {
      mockListLeads.execute.mockResolvedValue([]);

      const res = await request(app.getHttpServer()).get('/leads');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('deve passar filtros de query para o use case', async () => {
      mockListLeads.execute.mockResolvedValue([]);

      await request(app.getHttpServer())
        .get('/leads')
        .query({ nome: 'Joao', page: 2, limit: 10 });

      expect(mockListLeads.execute).toHaveBeenCalledWith(
        expect.objectContaining({ nome: 'Joao', page: 2, limit: 10 }),
      );
    });
  });
});
