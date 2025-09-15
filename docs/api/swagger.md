# راهنمای مستندسازی با Swagger

این سند دستورات لازم برای مستندسازی APIها با Swagger در پروژه‌های NestJS را مشخص می‌کند تا مستندات منظم، خوانا، و جامع باشند.

## فهرست محتوا
- [۱. تنظیمات اولیه Swagger](#۱-تنظیمات-اولیه-Swagger)
- [۲. مستندسازی APIهای REST](#۲-مستندسازی-APIهای-REST)
- [۳. بهترین تمرین‌ها](#۳-بهترین-تمرین‌ها)
- [۴. نکات](#۴-نکات)
- [منابع مرتبط](#منابع-مرتبط)

---

## ۱. تنظیمات اولیه Swagger
- **پکیج `@nestjs/swagger`** را نصب کنید:
  ```bash
  npm install @nestjs/swagger
  ```
- در `main.ts`، Swagger را تنظیم کنید:

**مثال پایه**: تنظیم Swagger در main.ts
```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Project API')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(3000);
}
bootstrap();
```

- **مسیر Swagger**: `/api/docs`.

---

## ۲. مستندسازی APIهای REST
- از **دکوراتورهای `@nestjs/swagger`** برای کنترلرها استفاده کنید.
- **دسته‌بندی**: از `@ApiTags('tag-name')` برای گروه‌بندی endpointها استفاده کنید (مثل `@ApiTags('auth')`, `@ApiTags('admin-users')`).
- **احراز هویت**: از `@ApiBearerAuth()` برای endpointهای محافظت‌شده استفاده کنید تا قفل نمایش داده شود.
- **ورودی‌ها**: از `@ApiBody()`, `@ApiParam()`, `@ApiQuery()` برای توصیف ورودی‌ها با مثال‌ها.
- **خروجی‌ها**: از `@ApiResponse({ status: 200, description: 'Success', type: ResponseDto })` برای پاسخ‌های موفق و `@ApiResponse({ status: 400, description: 'Bad Request' })` برای خطاها.
- **خطاها**: تمام کدهای خطا (400، 401، 404، 500) را با مثال مستند کنید.
- **نام‌گذاری مسیرها**: مسیرها منظم باشند:
  - عمومی: `/api/general/...`
  - نقش‌محور: `/api/admin/...`, `/api/user/...`.

**مثال پایه**: مستندسازی کنترلر احراز هویت
  ```typescript
  import { Controller, Post, Body } from '@nestjs/common';
  import { ApiTags, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
  import { LoginDto, AuthResponseDto } from './dto';

  @ApiTags('auth')
  @Controller('api/auth')
  export class AuthController {
    @Post('login')
    @ApiBody({ type: LoginDto, examples: { example: { value: { email: 'user@example.com', password: 'pass123' } } } })
    @ApiResponse({ status: 200, description: 'Successful login', type: AuthResponseDto })
    @ApiResponse({ status: 401, description: 'Invalid credentials', type: ErrorResponseDto })
    login(@Body() dto: LoginDto) {
      // منطق
    }
  }
  ```
- تعریف DTOها:
  ```typescript
  import { ApiProperty } from '@nestjs/swagger';

  export class LoginDto {
    @ApiProperty({ example: 'user@example.com' }) email: string;
    @ApiProperty({ example: 'pass123' }) password: string;
  }

  export class AuthResponseDto {
    @ApiProperty({ example: 'jwt_token' }) token: string;
    @ApiProperty({ example: { id: '123', email: 'user@example.com' } }) user: object;
  }

  export class ErrorResponseDto {
    @ApiProperty({ example: 'Invalid credentials' }) error: string;
    @ApiProperty({ example: 401 }) status: number;
  }
  ```

---

## ۳. بهترین تمرین‌ها
- **جامعیت**: ورودی‌ها، خروجی‌ها، خطاها، و مثال‌ها را مستند کنید.
- **دسته‌بندی**: تگ‌ها برای گروه‌بندی (مثل 'auth', 'admin-users').
- **مثال‌ها**: از ویژگی `examples` استفاده کنید.
- **به‌روزرسانی**: پس از هر تغییر، Swagger را بازسازی کنید.
- **ابزارها**: از `swagger-ui` برای تست interactive.

## ۴. نکات
- برای **جزئیات کد** به CODING_GUIDELINES.markdown مراجعه کنید.
- برای **احراز هویت** به AUTH_GUIDELINES.markdown مراجعه کنید.
- **مستندات** را در `docs/api/swagger.md` ذخیره کنید.

---

## منابع مرتبط
- [API_GUIDELINES.markdown](./API_GUIDELINES.markdown) - پیاده‌سازی APIها
- [AUTH_GUIDELINES.markdown](./AUTH_GUIDELINES.markdown) - احراز هویت
- [CODING_GUIDELINES.markdown](./CODING_GUIDELINES.markdown) - کدنویسی