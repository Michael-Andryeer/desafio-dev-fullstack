import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { CreateLeadUseCase } from './use-cases/create-lead.use-case';
import { ListLeadsUseCase } from './use-cases/list-leads.use-case';
import { GetLeadByIdUseCase } from './use-cases/get-lead-by-id.use-case';
import { ZodValidationPipe } from '../../shared/pipes/zod-validation.pipe';
import { createLeadSchema } from './dto/request/create-lead.dto';
import { listLeadsQuerySchema } from './dto/request/list-leads-query.dto';

@ApiTags('Leads')
@Controller('leads')
export class LeadController {
  constructor(
    private readonly createLeadUseCase: CreateLeadUseCase,
    private readonly listLeadsUseCase: ListLeadsUseCase,
    private readonly getLeadByIdUseCase: GetLeadByIdUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Registrar uma nova simulação de compensação' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Lead criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 409, description: 'Email ou código UC já cadastrado' })
  @UseInterceptors(FilesInterceptor('files'))
  async create(
    @Body(new ZodValidationPipe(createLeadSchema))
    body: { nomeCompleto: string; email: string; telefone: string },
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.createLeadUseCase.execute({
      ...body,
      files: files.map((f) => ({
        buffer: f.buffer,
        originalName: f.originalname,
      })),
    });
  }

  @Get()
  @ApiOperation({ summary: 'Listar simulações com filtros opcionais' })
  @ApiResponse({ status: 200, description: 'Lista de leads' })
  async findAll(
    @Query(new ZodValidationPipe(listLeadsQuerySchema))
    query: {
      nome?: string;
      email?: string;
      codigoDaUnidadeConsumidora?: string;
      page: number;
      limit: number;
    },
  ) {
    return this.listLeadsUseCase.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar simulação por ID' })
  @ApiResponse({ status: 200, description: 'Lead encontrado' })
  @ApiResponse({ status: 404, description: 'Lead não encontrado' })
  async findById(@Param('id') id: string) {
    return this.getLeadByIdUseCase.execute(id);
  }
}
