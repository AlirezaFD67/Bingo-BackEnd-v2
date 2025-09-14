# راهنمای پیاده‌سازی API

این سند دستورات لازم برای پیاده‌سازی endpointهای API در پروژه‌های NestJS را مشخص می‌کند.

## فهرست محتوا
- [۱. تنظیمات اولیه](#۱-تنظیمات-اولیه)
- [۲. تعریف کنترلرهای API](#۲-تعریف-کنترلرهای-API)
- [۳. عملیات CRUD](#۳-عملیات-CRUD)
- [۴. مدیریت مسیرهای API](#۴-مدیریت-مسیرهای-API)
- [۵. تایپ‌ها و DTOها](#۵-تایپ‌ها-و-DTOها)
- [۶. نکات](#۶-نکات)
- [منابع مرتبط](#منابع-مرتبط)

---

## ۱. تنظیمات اولیه
- فایل `src/common/interceptors/api-client.interceptor.ts` را برای مدیریت هدرها و خطاها ایجاد کنید.
- **قابلیت‌ها**:
  - افزودن Authorization header با JWT.
  - مدیریت refresh token (اگر `ENABLE_REFRESH_TOKEN` در `src/constants/index.ts` true باشد).

---

## ۲. تعریف کنترلرهای API
- **کنترلرها** در `src/modules/[moduleName]/[moduleName].controller.ts`.
- از **دکوراتورهای** `@ApiTags` و `@ApiBearerAuth` طبق SWAGGER_GUIDELINES.markdown استفاده کنید.

**مثال پایه**: تعریف کنترلر برای احراز هویت
```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
```

---

## ۳. عملیات CRUD
- **توابع CRUD** در `src/modules/[moduleName]/[moduleName].service.ts`.
- **ساختار**:
  - GET: دریافت داده.
  - POST: ایجاد آیتم.
  - PUT: به‌روزرسانی.
  - DELETE: حذف.

**مثال پایه**: پیاده‌سازی سرویس CRUD برای کاربران
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}
  async getUsers(): Promise<User[]> {
    return this.userRepository.find();
  }
  async createUser(data: CreateUserDto): Promise<User> {
    return this.userRepository.save(data);
  }
  // سایر متدها...
}
```

---

## ۴. مدیریت مسیرهای API
- **مسیرها** در `src/constants/endpoints.ts` با پیشوند نقش‌ها:
  - عمومی: `/api/general/...`
  - نقش‌محور: `/api/admin/...`, `/api/user/...`.

**مثال پایه**: تعریف endpointها
```typescript
export const ENDPOINTS = {
  AUTH: { LOGIN: '/api/auth/login' },
  ADMIN_USERS: { BASE: '/api/admin/users' },
};
```

---

## ۵. تایپ‌ها و DTOها
- **تایپ‌ها** در `src/types/`.
- **DTOها** در `src/modules/[moduleName]/dto/`.

**مثال پایه**: تعریف DTO
```typescript
export class CreateUserDto {
  email: string;
  password: string;
}
```

---

## ۶. نکات
- برای **مستندسازی** به SWAGGER_GUIDELINES.markdown مراجعه کنید.
- از **تایپ‌های دقیق** استفاده کنید و از `any` پرهیز کنید.
- برای **تسک‌ها** به TASK_DOCUMENTATION_GUIDELINES.markdown مراجعه کنید.
- برای **اقدامات قبل و بعد تسک** به before_task.md و after_task.md مراجعه کنید.

---

## منابع مرتبط
- [AUTH_GUIDELINES.markdown](./AUTH_GUIDELINES.markdown) - احراز هویت
- [SWAGGER_GUIDELINES.markdown](./SWAGGER_GUIDELINES.markdown) - مستندسازی
- [TESTING_GUIDELINES.markdown](./TESTING_GUIDELINES.markdown) - تست‌نویسی
- [TASK_DOCUMENTATION_GUIDELINES.markdown](./TASK_DOCUMENTATION_GUIDELINES.markdown) - مستندسازی تسک‌ها