# تسک T001: پیاده‌سازی API مدیریت تراکنش‌های کیف پول برای ادمین

## اطلاعات کلی
- **تاریخ**: 1404/06/30
- **تسک ID**: T001
- **نوع**: Feature
- **اولویت**: Medium

## توضیحات
پیاده‌سازی API برای مدیریت و مشاهده تراکنش‌های کیف پول کاربران توسط ادمین با قابلیت فیلتر بر اساس نوع تراکنش.

## الزامات
- API باید در دسته‌بندی Admin-Wallet قرار گیرد
- مسیر: `GET /api/admin/wallet/transactions`
- فیلتر اختیاری بر اساس `type`
- احراز هویت با JWT
- دسترسی فقط برای نقش ADMIN

## فایل‌های ایجاد شده
- `src/modules/admin/wallet.controller.ts` - کنترلر API
- `src/modules/admin/wallet.service.ts` - سرویس منطق
- `src/modules/admin/dto/get-wallet-transactions-query.dto.ts` - DTO فیلتر
- `src/modules/admin/dto/wallet-transaction-response.dto.ts` - DTO پاسخ

## فایل‌های ویرایش شده
- `src/constants/endpoints.ts` - اضافه کردن endpoint جدید
- `src/modules/admin/admin.module.ts` - اضافه کردن کنترلر و سرویس
- `src/enums/transaction-type.enum.ts` - اصلاح enum values
- `src/migrations/1700000000012-CreateWalletTransactionsTable.ts` - اصلاح migration

## انواع تراکنش پشتیبانی شده
- `deposit` - واریز وجه
- `withdraw` - برداشت وجه
- `prize` - جایزه
- `referral_bonus` - پاداش معرفی
- `game_fee` - هزینه بازی
- `bingo_line` - برد خطی بازی
- `bingo_full_card` - برد کارت کامل
- `wheel_spin` - برد گردونه

## تست
- API با موفقیت تست شده
- فیلتر type کار می‌کند
- احراز هویت و دسترسی درست است

## وضعیت
✅ تکمیل شده
