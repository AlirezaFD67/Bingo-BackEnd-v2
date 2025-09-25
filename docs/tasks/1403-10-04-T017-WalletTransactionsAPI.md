# T017: پیاده‌سازی API لیست تراکنش‌های کیف پول

## تاریخ شمسی
1403/10/04

## توضیح کلی
- **هدف تسک**: پیاده‌سازی API برای دریافت لیست تراکنش‌های کیف پول کاربر با قابلیت فیلتر
- **ابزارها و کتابخانه‌ها**: NestJS, TypeORM, JWT, Swagger
- **قواعد و مستندهای مرتبط**: API_GUIDELINES.markdown, SWAGGER_GUIDELINES.markdown

## رفتار دقیق تسک (Behavior)

### ۱. دریافت درخواست API
- کاربر احراز هویت شده درخواست GET به `/api/wallet/transactions` ارسال می‌کند
- فیلترهای اختیاری: `type`, `status`, `days`

### ۲. اعتبارسنجی و بررسی کاربر
- بررسی وجود کاربر با `userId` از JWT token
- اگر کاربر وجود نداشته باشد، خطای 404 برمی‌گردد

### ۳. ساخت کوئری با فیلترها
- کوئری اصلی: `WHERE userId = ? ORDER BY createdAt DESC`
- فیلتر نوع: `AND type = ?` (در صورت ارسال)
- فیلتر وضعیت: `AND status = ?` (در صورت ارسال)
- فیلتر روزهای گذشته: `AND createdAt >= ?` (محاسبه تاریخ شروع)

### ۴. تبدیل نتایج به DTO
- هر تراکنش به `WalletTransactionResponseDto` تبدیل می‌شود
- شامل: `id`, `userId`, `amount`, `type`, `status`, `createdAt`, `description`

## جداول و ارتباطات

### جدول اصلی
- **`wallet_transactions`**: جدول تراکنش‌های کیف پول
  - `id`: شناسه یکتا (Primary Key)
  - `userId`: شناسه کاربر (Foreign Key)
  - `amount`: مبلغ تراکنش (bigint)
  - `type`: نوع تراکنش (enum)
  - `status`: وضعیت تراکنش (enum)
  - `description`: توضیحات (varchar, nullable)
  - `createdAt`: تاریخ ایجاد (timestamp)

### ارتباطات
- **`users`**: ارتباط با جدول کاربران از طریق `userId`
- **هیچ تغییر در دیتابیس**: از ساختار موجود استفاده شده

## APIها و Endpointها

### GET /api/wallet/transactions
- **روش**: GET
- **احراز هویت**: JWT Bearer Token
- **ورودی (Query Parameters)**:
  - `type?`: نوع تراکنش (اختیاری)
  - `status?`: وضعیت تراکنش (اختیاری)
  - `days?`: تعداد روزهای گذشته (اختیاری)
- **خروجی**: آرایه‌ای از `WalletTransactionResponseDto`
- **نمونه پاسخ**:
```json
[
  {
    "id": 1,
    "userId": 2,
    "amount": 100000,
    "type": "charge",
    "status": "confirmed",
    "createdAt": "2024-06-20T12:34:56.789Z",
    "description": null
  }
]
```

## مراحل انجام (Step by Step)

1. **ایجاد DTOها**:
   - `GetWalletTransactionsDto`: برای پارامترهای ورودی
   - `WalletTransactionResponseDto`: برای پاسخ API

2. **پیاده‌سازی سرویس**:
   - متد `getWalletTransactions` در `WalletService`
   - استفاده از QueryBuilder برای فیلترها

3. **پیاده‌سازی کنترلر**:
   - endpoint `GET /transactions` در `WalletController`
   - مستندسازی Swagger

4. **تست و بررسی**:
   - کامپایل موفق پروژه
   - عدم وجود خطای linting

## تست‌ها
- **مسیر فایل تست**: `src/tests/WalletTransactions.spec.ts` (نیاز به ایجاد)
- **سناریوهای تست**:
  - دریافت لیست بدون فیلتر
  - فیلتر بر اساس نوع تراکنش
  - فیلتر بر اساس وضعیت
  - فیلتر بر اساس تعداد روزها
  - ترکیب فیلترها
  - کاربر غیرموجود
- **پوشش تست**: نیاز به پیاده‌سازی

## نکات تکمیلی
- **محدودیت‌ها**: تمام فیلترها اختیاری هستند
- **اعتبارسنجی**: `days` باید عدد مثبت باشد
- **امنیت**: فقط تراکنش‌های کاربر احراز هویت شده برگردانده می‌شود
- **ترتیب**: نتایج بر اساس تاریخ ایجاد (جدیدترین ابتدا)

## تغییرات نسبت به نسخه قبلی
- **فایل‌های جدید**:
  - `src/modules/wallet/dto/get-wallet-transactions.dto.ts`
  - `src/modules/wallet/dto/wallet-transaction-response.dto.ts`
- **فایل‌های تغییر یافته**:
  - `src/modules/wallet/wallet.service.ts` (متد جدید)
  - `src/modules/wallet/wallet.controller.ts` (endpoint جدید)
- **API جدید**: `GET /api/wallet/transactions`
