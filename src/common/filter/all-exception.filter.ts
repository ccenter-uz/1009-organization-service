import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const contextType = host.getType<'rmq' | 'http'>();
    const code = exception?.response?.statusCode ?? 500;
    const error = exception?.response?.message ?? 'Internal server error';

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const body = {
      code: code,
      error: error,
    };

    if (contextType === 'http') {
      return response.status(code).json(body);
    }

    return new RpcException(body);
  }
}
