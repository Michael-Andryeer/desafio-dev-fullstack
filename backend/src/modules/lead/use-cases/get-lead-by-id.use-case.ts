import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  LEAD_REPOSITORY,
  type LeadRepository,
  LeadWithRelations,
} from '../repositories/lead.repository';

@Injectable()
export class GetLeadByIdUseCase {
  constructor(
    @Inject(LEAD_REPOSITORY)
    private readonly leadRepository: LeadRepository,
  ) {}

  async execute(id: string): Promise<LeadWithRelations> {
    const lead = await this.leadRepository.findById(id);

    if (!lead) {
      throw new NotFoundException(`Lead com id "${id}" não encontrado`);
    }
    return lead;
  }
}
