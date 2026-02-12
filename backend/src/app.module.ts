import { MagicPdfModule } from './modules/magic-pdf/magic-pdf.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './shared/config/database.module';

@Module({
  imports: [DatabaseModule, MagicPdfModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
