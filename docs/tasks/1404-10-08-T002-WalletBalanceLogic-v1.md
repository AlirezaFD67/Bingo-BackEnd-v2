# تسک T002: اصلاح منطق walletBalance در GET /api/users/me

## اطلاعات کلی
- **تاریخ**: 1404/10/08
- **تسک ID**: T002
- **نوع**: Feature Update
- **اولویت**: High
- **نسخه**: v1

## توضیحات
اصلاح منطق نمایش `walletBalance` در API `GET /api/users/me` برای در نظر گیری کارت‌های رزرو شده در روم‌های pending و ثبت تراکنش‌های خرید کارت هنگام تغییر وضعیت روم از pending به started.

## الزامات پیاده‌سازی شده

### 1. تغییر در GET /api/users/me ✅
- **روم‌های Pending**: `walletBalance` برگشتی مبلغ کارت‌های رزرو شده از آن کم می‌شود
- **محاسبه مبلغ کارت‌ها**: از `entryFee` روم اصلی مربوط به `activeRoomId` استفاده می‌شود
- **جدول مرجع**: `user_reserved_cards` و `active_room_global` و `game_rooms`

### 2. تغییر در وضعیت روم (Pending → Started) ✅
- **کسر از walletBalance**: مبلغ کارت‌های مربوط به `activeRoomId` از `walletBalance` کاربر کم می‌شود
- **ثبت تراکنش**: در `wallet_transactions` به عنوان خرید کارت ثبت می‌شود
- **مجموع‌گیری**: به ازای هر روم یک رکورد (مجموع قیمت کارت‌ها)

### 3. اصلاح Transaction Types ✅
- **حذف DEPOSIT**: چون با CHARGE یک کار می‌کرد
- **اضافه CARD_PURCHASE**: برای خرید کارت
- **اصلاح همه‌جاهای استفاده**: enum، migration، DTOها، تست‌ها

## فایل‌های ایجاد/ویرایش شده

### فایل‌های جدید
- `src/modules/wallet/card-transaction.service.ts` - سرویس مدیریت تراکنش‌های کارت

### فایل‌های ویرایش شده
- `src/modules/users/users.service.ts` - اصلاح متد getUserProfile
- `src/modules/users/users.module.ts` - اضافه کردن dependencies
- `src/modules/wallet/wallet.module.ts` - اضافه کردن entities و services
- `src/enums/transaction-type.enum.ts` - اصلاح enum values
- `src/migrations/1700000000012-CreateWalletTransactionsTable.ts` - آپدیت migration
- `src/modules/admin/dto/get-wallet-transactions-query.dto.ts` - اصلاح مثال‌ها
- `src/modules/admin/dto/wallet-transaction-response.dto.ts` - اصلاح مثال‌ها
- `src/tests/admin-wallet.service.spec.ts` - اصلاح تست‌ها

## منطق پیاده‌سازی

### برای GET /api/users/me
```typescript
// محاسبه walletBalance جدید
const reservedCardsAmount = await this.cardTransactionService.calculateUserReservedCardsAmount(userId);
const adjustedWalletBalance = user.walletBalance - reservedCardsAmount;
```

### برای تغییر وضعیت روم (سیستم خودکار)
- سیستم به صورت خودکار تغییر وضعیت روم را مدیریت می‌کند
- نیازی به endpoint دستی نیست

## انواع تراکنش نهایی
- `charge` - شارژ کیف پول
- `withdraw` - برداشت وجه
- `prize` - جایزه
- `referral_bonus` - پاداش معرفی
- `game_fee` - هزینه بازی (کلی)
- `card_purchase` - خرید کارت
- `bingo_line` - برد خطی بازی
- `bingo_full_card` - برد کارت کامل
- `wheel_spin` - برد گردونه

## تست‌ها
- ✅ API GET /api/users/me با کارت‌های رزرو شده
- ✅ بررسی کسر صحیح از walletBalance
- ✅ بررسی تراکنش‌های ثبت شده
- ✅ تست‌های admin-wallet.service.spec.ts آپدیت شده

## کیفیت کد
- ✅ کامپایل موفق
- ✅ بدون خطای linting
- ✅ منطق پیاده‌سازی شده
- ✅ Migration آپدیت شده
- ✅ تست‌ها آپدیت شده

## وضعیت
✅ **تکمیل شده** - آماده برای کامیت و تست نهایی
