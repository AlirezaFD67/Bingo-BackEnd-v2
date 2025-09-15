# راهنمای عمومی پروژه

این سند دستورات عمومی برای مدیریت خطاها، لاگ‌گیری، و نصب پکیج‌ها را مشخص می‌کند.

## فهرست محتوا
- [۱. نصب پکیج‌ها](#۱-نصب-پکیج‌ها)
- [۲. تنظیمات دیتابیس](#۲-تنظیمات-دیتابیس)
- [۳. متغیرهای محیطی](#۳-متغیرهای-محیطی)
- [۴. مدیریت خطاها](#۴-مدیریت-خطاها)
- [۵. لاگ‌گیری](#۵-لاگ‌گیری)
- [۶. نکات](#۶-نکات)
- [منابع مرتبط](#منابع-مرتبط)

---

## ۱. نصب پکیج‌ها
- **نصب با pnpm**:
  ```bash
  pnpm install @nestjs/core @nestjs/common @nestjs/typeorm @nestjs/jwt @nestjs/passport winston @nestjs/swagger
  pnpm install --save-dev jest @types/jest ts-jest
  ```

---

## ۲. تنظیمات دیتابیس
- **استفاده از PostgreSQL** به عنوان دیتابیس اصلی
- **تنظیمات استاندارد** در `src/app.module.ts`:
  ```typescript
  TypeOrmModule.forRoot({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'postgres',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    synchronize: true, // فقط برای development
  })
  ```
- **نکته مهم**: در محیط production مقدار `synchronize` را روی `false` تنظیم کنید

---

## ۳. متغیرهای محیطی
- در `.env`:
  ```env
  # Database Configuration
  DB_HOST=localhost
  DB_PORT=5432
  DB_USER=postgres
  DB_PASS=postgres
  DB_NAME=bingo_backend_v3

  # JWT Configuration
  JWT_SECRET=your-super-secret-jwt-key-here-change-in-production

  # Application Configuration
  NODE_ENV=development
  PORT=3006
  ```
- در `src/constants/index.ts`:
  ```typescript
  export const DB_HOST = process.env.DB_HOST || 'localhost';
  export const DB_PORT = parseInt(process.env.DB_PORT || '5432', 10);
  export const DB_USER = process.env.DB_USER || 'postgres';
  export const DB_PASS = process.env.DB_PASS || 'postgres';
  export const DB_NAME = process.env.DB_NAME || 'postgres';
  ```

## ۴. مدیریت خطاها
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

## ۵. لاگ‌گیری
- در `src/common/utils/logger.ts` با Winston:
  ```typescript
  import { createLogger, transports, format } from 'winston';

  export const logger = createLogger({
    transports: [new transports.Console()],
    format: format.combine(format.timestamp(), format.json()),
  });
  ```

## ۶. نکات
- برای **مستندسازی** به SWAGGER_GUIDELINES.markdown مراجعه کنید.
- برای **تسک‌ها** به TASK_DOCUMENTATION_GUIDELINES.markdown مراجعه کنید.

---

## منابع مرتبط
- [ARCHITECTURE.markdown](./ARCHITECTURE.markdown) - معماری پروژه
- [SWAGGER_GUIDELINES.markdown](./SWAGGER_GUIDELINES.markdown) - مستندسازی
- [TASK_DOCUMENTATION_GUIDELINES.markdown](./TASK_DOCUMENTATION_GUIDELINES.markdown) - مستندسازی تسک‌ها