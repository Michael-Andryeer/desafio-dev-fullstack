import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DomainErrorFilter } from './shared/filters/domain-error.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
  });

  app.useGlobalFilters(new DomainErrorFilter());

  const config = new DocumentBuilder()
    .setTitle('Desafio Dev Fullstack - Backend')
    .setDescription('API para simulação de compensação energética')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
