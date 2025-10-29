// organization-service/src/rmq/rmq.module.ts
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ORG_EVENT_BUS',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5672'],
          // The "queue" here is required by Nest, but publishing goes to amq.topic with routing keys
          queue: 'organization-service.q.emitter',
          queueOptions: { durable: true },
          persistent: true,
          // exchange: 'amq.topic' ,  // topic exchange
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class RmqModule {}
