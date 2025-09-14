# راهنمای کدنویسی

این سند دستورات لازم برای کدنویسی، نام‌گذاری، و سازمان‌دهی فایل‌ها را مشخص می‌کند.

## فهرست محتوا
- [۱. محل ایجاد فایل‌ها](#۱-محل-ایجاد-فایل‌ها)
- [۲. روش‌های نام‌گذاری](#۲-روش‌های-نام‌گذاری)
- [۳. استفاده از ابزارها](#۳-استفاده-از-ابزارها)
- [۴. نکات TypeScript](#۴-نکات-TypeScript)
- [۵. بهترین روش‌ها](#۵-بهترین-روش‌ها)
- [۶. نکات](#۶-نکات)
- [منابع مرتبط](#منابع-مرتبط)

---

## ۱. محل ایجاد فایل‌ها
- **ماژول‌ها**: در `src/modules/` با kebab-case (مثل `users-management`).
- **کنترلرها**: در `src/modules/[moduleName]/[moduleName].controller.ts`.
- **سرویس‌ها**: در `src/modules/[moduleName]/[moduleName].service.ts`.
- **DTOها**: در `src/modules/[moduleName]/dto/` با PascalCase.
- **مدل‌ها**: در `src/entities/` (TypeORM) یا `src/prisma/schema.prisma` (Prisma).
- **تایپ‌ها**: در `src/types/` با kebab-case.
- **ثابت‌ها**: در `src/constants/`.
- **تست‌ها**: در `src/tests/[FeatureName].spec.ts`.

---

## ۲. روش‌های نام‌گذاری
- **فایل‌ها/کلاس‌ها**: PascalCase (مثل `UsersController.ts`).
- **فولدرها**: kebab-case.
- **توابع/متغیرها**: camelCase.
- **ثابت‌ها**: UPPER_CASE (عمومی) یا camelCase (خاص).
- **تایپ‌ها**: PascalCase.

---

## ۳. استفاده از ابزارها
- **کنترلرها**: فقط برای درخواست/پاسخ.
- **سرویس‌ها**: برای منطق اصلی.
- **DTOها**: برای ورودی/خروجی با `class-validator`.

**مثال پایه**: تعریف DTO برای ایجاد کاربر
```typescript
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString() @IsNotEmpty() @ApiProperty({ example: 'user@example.com' })
  email: string;
  @IsString() @IsNotEmpty() @ApiProperty({ example: 'pass123' })
  password: string;
}
```

---

## ۴. نکات TypeScript
- از **تایپ‌های دقیق** در `src/types/` استفاده کنید.
- تایپ‌ها را در `src/types/index.ts` export کنید.

---

## ۵. بهترین روش‌ها
- **توابع** ساده و تک‌منظوره.
- از **دکوراتورهای NestJS** برای تزریق.

---

## ۶. نکات
- برای **مستندسازی** به SWAGGER_GUIDELINES.markdown مراجعه کنید.
- برای **تسک‌ها** به TASK_DOCUMENTATION_GUIDELINES.markdown مراجعه کنید.

---

## منابع مرتبط
- [API_GUIDELINES.markdown](./API_GUIDELINES.markdown) - پیاده‌سازی APIها
- [SWAGGER_GUIDELINES.markdown](./SWAGGER_GUIDELINES.markdown) - مستندسازی
- [TESTING_GUIDELINES.markdown](./TESTING_GUIDELINES.markdown) - تست‌نویسی
- [TASK_DOCUMENTATION_GUIDELINES.markdown](./TASK_DOCUMENTATION_GUIDELINES.markdown) - مستندسازی تسک‌ها