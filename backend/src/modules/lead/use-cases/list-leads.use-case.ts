import {
  LEAD_REPOSITORY,
  type LeadFilters,
  type LeadRepository,
  type LeadWithRelations,
} from './../repositories/lead.repository';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ListLeadsUseCase {
  constructor(
    @Inject(LEAD_REPOSITORY)
    private readonly leadRepository: LeadRepository,
  ) {}

  async execute(filters?: LeadFilters): Promise<LeadWithRelations[]> {
    return this.leadRepository.findAll(filters);
  }
}
