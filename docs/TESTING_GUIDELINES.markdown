# راهنمای تست‌نویسی

این سند دستورات لازم برای نوشتن تست‌ها با Jest را مشخص می‌کند.

## فهرست محتوا
- [۱. تنظیمات اولیه](#۱-تنظیمات-اولیه)
- [۲. محل تست‌ها](#۲-محل-تست‌ها)
- [۳. تست‌نویسی](#۳-تست‌نویسی)
- [۴. پوشش تست](#۴-پوشش-تست)
- [۵. نکات](#۵-نکات)
- [منابع مرتبط](#منابع-مرتبط)

---

## ۱. تنظیمات اولیه
- در `jest.config.js`:

**مثال پایه**: تنظیم Jest
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
};
```

---

## ۲. محل تست‌ها
- در `src/tests/[FeatureName].spec.ts` (مثل `users.service.spec.ts`, `auth.service.spec.ts`).

## ۳. تست‌نویسی
- **تست‌های سرویس‌ها**:
  ```typescript
  import { Test } from '@nestjs/testing';
  import { UsersService } from '@/modules/users/users.service';

  describe('UsersService', () => {
    let service: UsersService;

    beforeEach(async () => {
      const module = await Test.createTestingModule({
        providers: [UsersService],
      }).compile();
      service = module.get<UsersService>(UsersService);
    });

    it('باید کاربران را برگرداند', async () => {
      const result = await service.getUsers();
      expect(result).toBeDefined();
    });
  });
  ```
---

## ۳. پوشش تست
- پوشش 80%+ با:
  ```bash
  npm run test -- --coverage
  ```

## ۴. نکات
- **تست‌ها** مستقل و با in-memory database (مثل SQLite).
- برای **مستندسازی** به SWAGGER_GUIDELINES.markdown مراجعه کنید.

---

## منابع مرتبط
- [API_GUIDELINES.markdown](./API_GUIDELINES.markdown) - پیاده‌سازی APIها
- [SWAGGER_GUIDELINES.markdown](./SWAGGER_GUIDELINES.markdown) - مستندسازی
- [CODING_GUIDELINES.markdown](./CODING_GUIDELINES.markdown) - کدنویسی