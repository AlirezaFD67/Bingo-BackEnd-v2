import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiClientInterceptor implements NestInterceptor {
  constructor(private configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Add request timestamp
    request.startTime = Date.now();

    // Log request
    console.log(
      `[${new Date().toISOString()}] ${request.method} ${request.url}`,
    );

    return next.handle().pipe(
      // Add response metadata
      map((data) => {
        // If data is an array, wrap it properly
        if (Array.isArray(data)) {
          return {
            data,
            timestamp: new Date().toISOString(),
            duration: Date.now() - request.startTime,
          };
        }

        // If data is an object, spread it
        return {
          ...data,
          timestamp: new Date().toISOString(),
          duration: Date.now() - request.startTime,
        };
      }),
    );
  }
}
