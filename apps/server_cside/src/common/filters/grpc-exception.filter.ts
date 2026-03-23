import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import * as grpc from '@grpc/grpc-js';

function isGrpcServiceError(e: unknown): e is grpc.ServiceError {
  return (
    typeof e === 'object' &&
    e !== null &&
    'code' in e &&
    typeof (e as grpc.ServiceError).code === 'number'
  );
}

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GrpcExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      res.status(status).json(
        typeof body === 'string' ? { message: body } : body,
      );
      return;
    }

    if (isGrpcServiceError(exception)) {
      const http = this.mapGrpcCode(exception.code);
      const rpc =
        'coreRpc' in exception && typeof (exception as { coreRpc?: unknown }).coreRpc === 'string'
          ? (exception as { coreRpc: string }).coreRpc
          : undefined;
      this.logger.warn(
        rpc
          ? `Upstream gRPC error rpc=${rpc} code=${exception.code} message=${exception.details}`
          : `Upstream gRPC error code=${exception.code} message=${exception.details}`,
      );
      res.status(http).json({ message: 'Upstream service error' });
      return;
    }

    this.logger.error(exception);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: 'Internal server error' });
  }

  private mapGrpcCode(code: number): number {
    switch (code) {
      case grpc.status.INVALID_ARGUMENT:
        return HttpStatus.BAD_REQUEST;
      case grpc.status.NOT_FOUND:
        return HttpStatus.NOT_FOUND;
      case grpc.status.UNAUTHENTICATED:
        return HttpStatus.UNAUTHORIZED;
      case grpc.status.PERMISSION_DENIED:
        return HttpStatus.FORBIDDEN;
      case grpc.status.DEADLINE_EXCEEDED:
        return HttpStatus.GATEWAY_TIMEOUT;
      case grpc.status.UNAVAILABLE:
        return HttpStatus.BAD_GATEWAY;
      default:
        return HttpStatus.BAD_GATEWAY;
    }
  }
}
