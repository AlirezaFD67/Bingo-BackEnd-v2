# راهنمای قبل از شروع پیاده‌سازی سوکت

این سند چک‌لیست اقدامات لازم قبل از شروع پیاده‌سازی سوکت‌ها را ارائه می‌دهد. این فایل مستقل است و تمام استانداردها را پوشش می‌دهد.

## چک‌لیست قبل از شروع
- [ ] **بررسی نسخه‌ها**:
  - Node.js: 18+.
  - NestJS: از `package.json`.
  - پکیج‌ها: `@nestjs/websockets`, `socket.io`, `socket.io-client` (با `npm install @nestjs/websockets socket.io socket.io-client`).
- [ ] **بررسی معماری سوکت**:
  - ساختار فولدرها: `src/modules/socket/`, `src/modules/socket-mock/`, `docs/tasks/socket/`.
  - namespaceها: `/socket/admin/...`, `/socket/user/...`.
  - وابستگی‌ها: `@nestjs/websockets`, `socket.io`, `socket.io-client`.
- [ ] **بررسی فایل‌های تنظیمات**:
  - `.env` برای `SOCKET_PORT`, `JWT_SECRET`.
  - `nest-cli.json`, `tsconfig.json`.
  - `.gitignore`.
- [ ] **مطالعه مستندات**:
  - CODING_GUIDELINES.markdown
  - AUTH_GUIDELINES.markdown
  - TESTING_GUIDELINES.markdown
  - SWAGGER_GUIDELINES.markdown
- [ ] **شناسایی منطق کاری**:
  - eventها و namespaceها (مثل `/socket/admin/general`, `/socket/user/general`) را مشخص کنید.
  - ورودی/خروجی‌ها را از صاحب پروژه دریافت کنید.
- [ ] **بررسی کدنویسی سوکت**:
  - محل فایل‌ها: `src/modules/socket/` برای ماژول سوکت، `src/modules/socket-mock/` برای mockها.
  - نام‌گذاری: فایل‌ها با PascalCase، فولدرها با kebab-case.
  - استفاده از ابزارها: `@nestjs/websockets`, `@nestjs/jwt` برای احراز هویت سوکت.
- [ ] **ساخت برنچ**:
  - فرمت: `[نوع تغییر]-[TaskID]-[توضیح مختصر]` (مثل `Feat-T123-Add-socket-general`).
  - دستور:
    ```bash
    git checkout develop
    git pull
    git checkout -b Feat-T123-Add-socket-general
    ```
- [ ] **تأیید کاربر**:
  - تأیید صاحب پروژه را دریافت کنید.

## نکات
- namespaceها با پیشوند نقش (مثل `/socket/admin/...`).
- برای مستندسازی به SWAGGER_GUIDELINES.markdown مراجعه کنید.
- با ARCHITECTURE.markdown هم‌خوانی داشته باشد.