# تسک T009 - API شارژ کیف پول

## اطلاعات کلی
- **شناسه تسک**: T009
- **تاریخ**: 1403/06/26
- **نوع**: Feature
- **اولویت**: متوسط

## شرح تسک
پیاده‌سازی API شارژ کیف پول برای کاربران که امکان شارژ مستقیم کیف پول بدون اتصال به درگاه پرداخت را فراهم می‌کند.

## اهداف
- ایجاد API endpoint برای شارژ کیف پول
- ثبت تراکنش‌های شارژ در دیتابیس
- به‌روزرسانی موجودی کاربر
- آماده‌سازی برای اتصال درگاه پرداخت در آینده

## تغییرات انجام شده

### 1. به‌روزرسانی Enum
- **فایل**: `src/enums/transaction-type.enum.ts`
- **تغییر**: اضافه شدن `CHARGE = 'charge'` به TransactionType

### 2. به‌روزرسانی Migration
- **فایل**: `src/migrations/1700000000012-CreateWalletTransactionsTable.ts`
- **تغییر**: اضافه شدن `'charge'` به enum دیتابیس

### 3. ایجاد Wallet Module
- **فایل**: `src/modules/wallet/wallet.module.ts`
- **توضیح**: Module جدید برای مدیریت کیف پول

### 4. ایجاد DTOها
- **فایل**: `src/modules/wallet/dto/charge-wallet.dto.ts`
  - DTO برای درخواست شارژ با validation
- **فایل**: `src/modules/wallet/dto/charge-wallet-response.dto.ts`
  - DTO برای پاسخ API

### 5. ایجاد Wallet Service
- **فایل**: `src/modules/wallet/wallet.service.ts`
- **قابلیت‌ها**:
  - متد `chargeWallet()` برای شارژ کیف پول
  - استفاده از database transaction
  - به‌روزرسانی موجودی کاربر
  - ثبت تراکنش

### 6. ایجاد Wallet Controller
- **فایل**: `src/modules/wallet/wallet.controller.ts`
- **Endpoint**: `POST /api/wallet/charge`
- **قابلیت‌ها**:
  - احراز هویت با JWT
  - مستندسازی Swagger
  - مدیریت خطا

### 7. اضافه کردن فیلد walletBalance
- **فایل‌ها**:
  - `src/modules/users/dto/user-profile-response.dto.ts`
  - `src/modules/users/dto/admin-user-response.dto.ts`
  - `src/modules/users/users.service.ts`
- **تغییر**: اضافه شدن فیلد `walletBalance` به APIهای کاربران

### 8. به‌روزرسانی App Module
- **فایل**: `src/app.module.ts`
- **تغییر**: اضافه شدن WalletModule به imports

### 9. به‌روزرسانی مستندات
- **فایل‌ها**:
  - `docs/api/endpoints/admin-users.md`
  - `docs/api/endpoints/referral-system.md`
- **تغییر**: اضافه شدن فیلد `walletBalance` به نمونه‌های پاسخ

## API Endpoints

### POST /api/wallet/charge
**درخواست**:
```json
{
  "amount": 100000
}
```

**پاسخ**:
```json
{
  "id": 1,
  "userId": 2,
  "amount": 100000,
  "type": "charge",
  "status": "confirmed",
  "createdAt": "2024-06-20T12:34:56.789Z"
}
```

## نکات فنی
- استفاده از database transaction برای اطمینان از یکپارچگی داده
- تبدیل `walletBalance` از BigInt به Number برای نمایش
- آماده برای اتصال درگاه پرداخت در آینده
- احراز هویت با JWT Bearer token

## تست‌ها
- API endpoint تست شده
- Validation کار می‌کند
- Database transaction صحیح عمل می‌کند

## وضعیت
✅ **تکمیل شده**

## یادداشت‌ها
- در حال حاضر بدون درگاه پرداخت کار می‌کند
- در آینده می‌توان درگاه پرداخت را اضافه کرد
- فیلد `walletBalance` به تمام APIهای کاربران اضافه شده است
