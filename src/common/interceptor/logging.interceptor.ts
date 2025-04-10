import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PrismaService } from 'src/modules/prisma/prisma.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  async saveLog(data: any) {
    console.log('Saving Log:', data);

    await this.prisma.apiLogs.create({
      data: {
        userId: data.userId || null,
        userNumericId: data.numericId || null,
        userFullName: data.fullName || null,
        userRole: data.role || null,
        referenceId: data.referenceId || null,
        organizationId: data.organizationId || null,
        organizationName: data.organizationName || null,
        method: data.method,
        module: data.path?.split('/')[1],
        path: data.path,
        request: JSON.stringify(data.request, null, 2),
        response: JSON.stringify(data.response, null, 2),
        status: data.status,
        duration: data.duration,
      },
    });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    if (!req.logData) {
      return next.handle();
    }

    console.log(req, 'REQ');

    const { logData } = req;
    delete req?.logData;

    console.log(logData, 'LOG DATA');

    const startTime = Date.now();

    console.log(logData.user?.id, 'USER ID IN LOG DATA');

    const logDataComplete = {
      userId: logData.user?.id,
      numericId: logData.user?.numericId,
      fullName: logData.user?.fullName,
      role: logData.user?.role,
      organizationId: null,
      organizationName: null,
      referenceId: null,
      method: logData.method,
      path: logData.path,
      request: req,
      response: null,
      status: null,
      duration: null,
    };

    return next.handle().pipe(
      map((response) => {
        const duration = Date.now() - startTime;

        // Add response details to log data
        logDataComplete.response = response;
        logDataComplete.status = res.statusCode;
        logDataComplete.duration = duration;
        if (logDataComplete.path?.split('/')[1] === 'organization') {
          if (response?.id) logDataComplete.organizationId = response?.id;
          if (response?.name) logDataComplete.organizationName = response?.name;
        }

        if (response?.id) logDataComplete.referenceId = response?.id;
        if (typeof response?.name !== 'object') {
          this.saveLog(logDataComplete).catch((error) => {
            console.error('Error saving log:', error);
          });
        }

        // Save the log asynchronously

        return response;
      })
    );
  }
}
