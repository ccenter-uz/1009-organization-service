import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const contextType = host.getType<'rmq' | 'http'>();
    let code = exception?.response?.statusCode ?? 500;
    let error = exception?.response?.message ?? 'Internal server error';

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Prisma error handling block
    if (
      exception &&
      exception.constructor.name == 'PrismaClientKnownRequestError'
    ) {
      code = HttpStatus.BAD_REQUEST;
      error = `PrismaError: ${exception.meta.cause} ${exception.meta.modelName}!`;
    }

    const body = {
      code,
      error,
    };

    if (contextType === 'http') {
      return response.status(code).json(body);
    }

    return new RpcException(body);
  }
}
