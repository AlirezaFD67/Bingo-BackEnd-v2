# راهنمای عمومی پروژه

این سند دستورات عمومی برای مدیریت خطاها، لاگ‌گیری، و نصب پکیج‌ها را مشخص می‌کند.

## فهرست محتوا
- [۱. نصب پکیج‌ها](#۱-نصب-پکیج‌ها)
- [۲. متغیرهای محیطی](#۲-متغیرهای-محیطی)
- [۳. مدیریت خطاها](#۳-مدیریت-خطاها)
- [۴. لاگ‌گیری](#۴-لاگ‌گیری)
- [۵. نکات](#۵-نکات)
- [منابع مرتبط](#منابع-مرتبط)

---

## ۱. نصب پکیج‌ها
- **نصب با pnpm**:
  ```bash
  pnpm install @nestjs/core @nestjs/common @nestjs/typeorm @nestjs/jwt @nestjs/passport winston @nestjs/swagger
  pnpm install --save-dev jest @types/jest ts-jest
  ```

---

## ۲. متغیرهای محیطی
- در `.env`:
  ```env
  DATABASE_URL=postgres://user:pass@localhost:5432/db
  JWT_SECRET=your_jwt_secret
  ```
- در `src/constants/index.ts`:
  ```typescript
  export const DATABASE_URL = process.env.DATABASE_URL || 'postgres://user:pass@localhost:5432/db';
  ```

## ۳. مدیریت خطاها
- فایل `src/common/filters/http-exception.filter.ts` برای مدیریت خطاها.
- پیام‌های خطا در `src/common/constants/error-messages.ts`:
  ```typescript
  export const ERROR_MESSAGES = {
    INVALID_CREDENTIALS: { error: 'Invalid credentials', status: 401 },
    INVALID_MESSAGE: { error: 'Invalid message', status: 400 },
  };
  ```
- مثال فیلتر:
  ```typescript
  import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';

  @Catch(HttpException)
  export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const status = exception.getStatus();
      const message = exception.message || 'Internal server error';
      response.status(status).json({ error: message, status });
    }
  }
  ```

## ۴. لاگ‌گیری
- در `src/common/utils/logger.ts` با Winston:
  ```typescript
  import { createLogger, transports, format } from 'winston';

  export const logger = createLogger({
    transports: [new transports.Console()],
    format: format.combine(format.timestamp(), format.json()),
  });
  ```

## ۵. نکات
- برای **مستندسازی** به SWAGGER_GUIDELINES.markdown مراجعه کنید.
- برای **تسک‌ها** به TASK_DOCUMENTATION_GUIDELINES.markdown مراجعه کنید.

---

## منابع مرتبط
- [ARCHITECTURE.markdown](./ARCHITECTURE.markdown) - معماری پروژه
- [SWAGGER_GUIDELINES.markdown](./SWAGGER_GUIDELINES.markdown) - مستندسازی
- [TASK_DOCUMENTATION_GUIDELINES.markdown](./TASK_DOCUMENTATION_GUIDELINES.markdown) - مستندسازی تسک‌ها