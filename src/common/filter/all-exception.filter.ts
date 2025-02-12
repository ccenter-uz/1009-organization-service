import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const contextType = host.getType();
    let code = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';

    // === Если это RpcException, извлекаем данные ===
    if (exception instanceof RpcException) {
      const errorResponse: any = exception.getError();
      if (typeof errorResponse === 'object' && errorResponse !== null) {
        code = errorResponse.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;
        message = errorResponse.message ?? 'Internal server error';
      }
    }

    // === Если это NestJS HttpException ===
    else if (exception instanceof HttpException) {
      code = exception.getStatus();
      const response = exception.getResponse();
      if (typeof response === 'object' && response !== null) {
        message = response['message'] ?? 'Internal server error';
      } else {
        message = response;
      }
    }

    // === Prisma error handling block ===
    else if (
      exception &&
      exception.constructor.name === 'PrismaClientKnownRequestError' &&
      exception.meta
    ) {
      code = HttpStatus.BAD_REQUEST;
      message = `PrismaError: ${exception.meta.cause ?? 'Unknown cause'} in model ${
        exception.meta.modelName ?? 'Unknown model'
      }`;
    }

    const body = {
      statusCode: code,
      message: message,
    };

    // === HTTP CONTEXT (Express) ===
    if (contextType === 'http') {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();
      return response.status(code).json(body);
    }

    // === RMQ CONTEXT ===
    if (contextType === 'rpc') {
      throw new RpcException(body);
    }
  }
}
