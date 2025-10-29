import 'dotenv/config'; // optional, for .env loading

export class RmqConfig {
  static host = process.env.RMQ_HOST || 'localhost';
  static port = Number(process.env.RMQ_PORT) || 5672;
  static login = process.env.RMQ_LOGIN || 'guest';
  static password = process.env.RMQ_PASSWORD || 'guest';

  static adminQueue = process.env.ADMIN_RMQ_QUEUE_NAME || 'admin';
  static orgQueue = process.env.ORGANIZATION_RMQ_QUEUE_NAME || 'organization';
  static clientQueue = process.env.CLIENT_RMQ_QUEUE_NAME || 'client';

  static getConnectionUrl(): string {
    return `amqp://${this.login}:${this.password}@${this.host}:${this.port}`;
  }
}
