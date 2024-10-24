import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    console.log(exception, 'EXCETPTION');
    
    const contextType = host.getType<'rmq' | 'http'>();
    const code = exception?.response?.statusCode ?? 500;
    const error = exception?.response?.message ?? 'Internal server error';
console.log(exception?.meta, 'E filter');

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let prismaError: string;
    if(exception?.meta) {
      prismaError = `${exception?.meta?.cause} ${exception?.meta?.modelName}`
    }

    let prismaStatusCode: number
    if(exception?.code == "P2025") {
      prismaStatusCode = HttpStatus.NOT_FOUND
    }

    const body = {
      code: prismaStatusCode || code,
      error: prismaError || error,
    };

    if (contextType === 'http') {
      return response.status(code).json(body);
    }

    return new RpcException(body);
  }
}
