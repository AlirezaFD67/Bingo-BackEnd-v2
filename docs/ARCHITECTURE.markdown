# معماری پروژه

این سند ساختار و اصول معماری پروژه‌های مبتنی بر NestJS را مشخص می‌کند.

## فهرست محتوا
- [۱. معماری پروژه](#۱-معماری-پروژه)
- [۲. وابستگی‌های پروژه](#۲-وابستگی‌های-پروژه)
- [۳. ساختار پروژه](#۳-ساختار-پروژه)
- [۴. تنظیمات دیتابیس](#۴-تنظیمات-دیتابیس)
- [۵. نکات](#۵-نکات)
- [منابع مرتبط](#منابع-مرتبط)

---

## ۱. معماری پروژه
- **تکنولوژی‌ها**:
  - NestJS با TypeScript.
  - TypeORM/Prisma برای دیتابیس.
  - JWT برای احراز هویت.
  - Winston برای لاگ‌گیری.
  - Swagger برای مستندسازی.
- **اصول**:
  - ماژولار: هر فیچر در ماژول جدا (مثل `users`, `auth`).
  - سادگی: برای پروژه‌های کوچک تا متوسط.
  - جداسازی: API عمومی در `/api/`, داشبورد در `/api/dashboard/`.

---

## ۲. وابستگی‌های پروژه
- **پکیج‌ها**: `@nestjs/core`, `@nestjs/common`, `@nestjs/typeorm` (PostgreSQL), `@nestjs/jwt`, `@nestjs/passport`, `winston`, `@nestjs/swagger`.
- **دیتابیس**: PostgreSQL به عنوان دیتابیس اصلی (توصیه می‌شود).

---

## ۳. ساختار پروژه
```
project-root/
├── src/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   ├── common/
│   ├── entities/
│   ├── prisma/
│   ├── constants/
│   ├── types/
│   ├── tests/
│   └── main.ts
├── docs/
│   ├── api/
│   │   ├── endpoints/
│   │   ├── swagger.md
│   ├── tasks/
│   ├── before_task.md
│   ├── after_task.md
│   ├── before_update.md
│   ├── after_update.md
├── .env
├── nest-cli.json
├── tsconfig.json
└── package.json
```

---

## ۴. تنظیمات دیتابیس
- **پیکربندی استاندارد** در `src/app.module.ts`:
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
- **متغیرهای محیطی ضروری**:
  - `DB_HOST`: آدرس سرور دیتابیس
  - `DB_PORT`: پورت دیتابیس (پیش‌فرض: 5432)
  - `DB_USER`: نام کاربری دیتابیس
  - `DB_PASS`: رمز عبور دیتابیس
  - `DB_NAME`: نام دیتابیس
- **نکته امنیتی**: در محیط production مقدار `synchronize` را روی `false` تنظیم کنید

---

## ۵. نکات
- برای **مستندسازی Swagger** به SWAGGER_GUIDELINES.markdown مراجعه کنید.
- برای **APIها** به API_GUIDELINES.markdown مراجعه کنید.
- برای **تست‌ها** به TESTING_GUIDELINES.markdown مراجعه کنید.

---

## منابع مرتبط
- [CODING_GUIDELINES.markdown](./CODING_GUIDELINES.markdown) - راهنمای کدنویسی
- [API_GUIDELINES.markdown](./API_GUIDELINES.markdown) - پیاده‌سازی APIها
- [SWAGGER_GUIDELINES.markdown](./SWAGGER_GUIDELINES.markdown) - مستندسازی
- [TESTING_GUIDELINES.markdown](./TESTING_GUIDELINES.markdown) - تست‌نویسی