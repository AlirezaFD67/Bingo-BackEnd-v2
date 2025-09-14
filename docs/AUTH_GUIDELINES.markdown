# راهنمای Authentication و کنترل دسترسی

این سند دستورات لازم برای احراز هویت و مدیریت دسترسی در پروژه‌های NestJS را مشخص می‌کند.

## فهرست محتوا
- [۱. تنظیم احراز هویت](#۱-تنظیم-احراز-هویت)
- [۲. تنظیم گارد](#۲-تنظیم-گارد)
- [۳. مدیریت نقش‌های کاربری](#۳-مدیریت-نقش‌های-کاربری)
- [۴. نکات](#۴-نکات)
- [منابع مرتبط](#منابع-مرتبط)

---

## ۱. تنظیم احراز هویت
- **ماژول `auth`** در `src/modules/auth/`.
- از `@nestjs/jwt` و `@nestjs/passport` برای JWT.

**مثال پایه**: پیاده‌سازی سرویس احراز هویت
```typescript
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '@/modules/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  async login(loginDto: LoginDto) {
    const user = await this.usersService.validateUser(loginDto.email, loginDto.password);
    return {
      token: this.jwtService.sign({ sub: user.id, role: user.role }),
      user: { id: user.id, email: user.email, role: user.role },
    };
  }
}
```

---

## ۲. تنظیم گارد
- **گارد `JwtAuthGuard`** برای REST در `src/modules/auth/jwt-auth.guard.ts`.

**مثال پایه**: استفاده از گارد در کنترلر
```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';

@Controller('api/admin/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  @Get()
  getUsers() {
    // منطق
  }
}
```

---

## ۳. مدیریت نقش‌های کاربری
- **نقش‌ها** (مثل admin، user) در `src/types/user.ts`.
- از **دکوراتور `@Roles`**:
```typescript
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

import { SetMetadata } from '@nestjs/common';
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

---

## ۴. نکات
- برای **مستندسازی Swagger** به SWAGGER_GUIDELINES.markdown مراجعه کنید.
- برای **تسک‌ها** به TASK_DOCUMENTATION_GUIDELINES.markdown مراجعه کنید.

---

## منابع مرتبط
- [API_GUIDELINES.markdown](./API_GUIDELINES.markdown) - پیاده‌سازی APIها
- [SWAGGER_GUIDELINES.markdown](./SWAGGER_GUIDELINES.markdown) - مستندسازی
- [TESTING_GUIDELINES.markdown](./TESTING_GUIDELINES.markdown) - تست‌نویسی