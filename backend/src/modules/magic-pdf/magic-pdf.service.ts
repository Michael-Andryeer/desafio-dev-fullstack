import { Injectable } from '@nestjs/common';
import {
  magicPdfResponseSchema,
  MagicPdfResponseDto,
} from './dto/magic-pdf.dto';
import { env } from '../../shared/config/env';

@Injectable()
export class MagicPdfService {
  async decodePdf(
    fileBuffer: Buffer,
    fileName: string,
  ): Promise<MagicPdfResponseDto> {
    const formData = new FormData();
    const blob = new Blob([new Uint8Array(fileBuffer)], {
      type: 'application/pdf',
    });
    formData.append('file', blob, fileName);

    const response = await fetch(env.MAGIC_PDF_API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(
        `Erro ao decodificar PDF: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    const parsed = magicPdfResponseSchema.parse(data);

    return parsed;
  }
}
