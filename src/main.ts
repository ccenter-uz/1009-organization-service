import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { useContainer } from 'class-validator';
import { ValidationPipe } from '@nestjs/common';
import {
  AppConfig,
  CONFIG_APP_TOKEN,
  CONFIG_RABBITMQ_TOKEN,
  RMQConfig,
  ValidatorConfig,
} from './common/config/configuration';
import { ConfigService } from '@nestjs/config';
import { RmqOptions, Transport } from '@nestjs/microservices';
import { AllExceptionFilter } from './common/filter/all-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalPipes(new ValidationPipe(ValidatorConfig));
  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>(CONFIG_APP_TOKEN);
  const rmqConfig = configService.get<RMQConfig>(CONFIG_RABBITMQ_TOKEN);

  app.connectMicroservice<RmqOptions>(
    {
      transport: Transport.RMQ,
      options: {
        urls: [
          `amqp://${rmqConfig.login}:${rmqConfig.password}@${rmqConfig.host}:${rmqConfig.port}`,
        ],
        queue: rmqConfig.queueName,
        queueOptions: {
          durable: true,
        },
      },
    },
    { inheritAppConfig: true }
  );

  app.useGlobalFilters(new AllExceptionFilter());

  await app.startAllMicroservices();
  await app.listen(appConfig.port, appConfig.host);
}
bootstrap();
