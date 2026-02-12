import { Module } from '@nestjs/common';
import { MagicPdfModule } from '../magic-pdf/magic-pdf.module';
import { LEAD_REPOSITORY } from './repositories/lead.repository';
import { DrizzleLeadRepository } from './repositories/drizzle-lead.repository';
import { CreateLeadUseCase } from './use-cases/create-lead.use-case';
import { ListLeadsUseCase } from './use-cases/list-leads.use-case';
import { GetLeadByIdUseCase } from './use-cases/get-lead-by-id.use-case';
import { LeadController } from './lead.controller';

@Module({
  imports: [MagicPdfModule],
  controllers: [LeadController],
  providers: [
    {
      provide: LEAD_REPOSITORY,
      useClass: DrizzleLeadRepository,
    },
    CreateLeadUseCase,
    ListLeadsUseCase,
    GetLeadByIdUseCase,
  ],
  exports: [CreateLeadUseCase, ListLeadsUseCase, GetLeadByIdUseCase],
})
export class LeadModule {}
