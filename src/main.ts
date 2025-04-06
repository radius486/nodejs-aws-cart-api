import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import helmet from 'helmet';

import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const port = configService.get('APP_PORT') || 4000;

  app.use(cors());
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({}));

  await app.listen(port, () => {
    console.log('App is running on %s port', port);
  });
}
bootstrap();
