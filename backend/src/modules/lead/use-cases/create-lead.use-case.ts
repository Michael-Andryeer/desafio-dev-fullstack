import { Inject, Injectable } from '@nestjs/common';
import { MagicPdfService } from '../../magic-pdf/magic-pdf.service';
import { mapMagicPdfToUnidade } from '../../magic-pdf/magic-pdf.mapper';
import {
  LEAD_REPOSITORY,
  type LeadRepository,
  LeadWithRelations,
} from '../repositories/lead.repository';
import { EmailAlreadyExistsError } from '../../../shared/errors/email-already-exists.error';
import { UnitCodeAlreadyExistsError } from '../../../shared/errors/unit-code-already-exists.error';

interface CreateLeadInput {
  nomeCompleto: string;
  email: string;
  telefone: string;
  files: { buffer: Buffer; originalName: string }[];
}

@Injectable()
export class CreateLeadUseCase {
  constructor(
    @Inject(LEAD_REPOSITORY)
    private readonly leadRepository: LeadRepository,
    private readonly magicPdfService: MagicPdfService,
  ) {}

  async execute(input: CreateLeadInput): Promise<LeadWithRelations> {
    const emailExists = await this.leadRepository.existsByEmail(input.email);
    if (emailExists) throw new EmailAlreadyExistsError(input.email);

    const unidades = await Promise.all(
      input.files.map(async (file) => {
        const pdfData = await this.magicPdfService.decodePdf(
          file.buffer,
          file.originalName,
        );
        return mapMagicPdfToUnidade(pdfData);
      }),
    );

    for (const unidade of unidades) {
      const codeExists = await this.leadRepository.existsByUnitCode(
        unidade.codigoDaUnidadeConsumidora,
      );
      if (codeExists)
        throw new UnitCodeAlreadyExistsError(
          unidade.codigoDaUnidadeConsumidora,
        );
    }

    const lead = await this.leadRepository.create({
      nomeCompleto: input.nomeCompleto,
      email: input.email,
      telefone: input.telefone,
      unidades,
    });

    return lead;
  }
}
