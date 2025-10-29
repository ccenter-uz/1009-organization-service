import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RmqConfig } from './../../common/config/rmq.config';
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CLIENT_GATEWAY', // name for injection
        transport: Transport.RMQ,
        options: {
          urls: [RmqConfig.getConnectionUrl()],
          queue: RmqConfig.clientQueue, // 👈 your target callback queue
          queueOptions: {
            durable: true,
            arguments: {
              'x-dead-letter-exchange': 'amq.topic',
              'x-dead-letter-routing-key': 'client.dlq',
            },
          },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RmqModule {}
