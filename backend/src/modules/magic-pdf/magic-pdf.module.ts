import { Module } from '@nestjs/common';
import { MagicPdfService } from './magic-pdf.service';

@Module({
  providers: [MagicPdfService],
  exports: [MagicPdfService],
})
export class MagicPdfModule {}
