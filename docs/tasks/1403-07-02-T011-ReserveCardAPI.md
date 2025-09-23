# T011 - Reserve Card API

## توضیحات تسک
پیاده‌سازی API برای رزرو کارت در بازی بینگو.

## مسیر API
- **Method**: POST
- **URL**: `/api/reservation/reserve`
- **Authentication**: JWT Required

## ورودی
```json
{
  "activeRoomId": 1,
  "cardCount": 2
}
```

## خروجی موفق
```json
{
  "id": 123
}
```

## منطق پیاده‌سازی
1. بررسی وجود `active_room_global` با شناسه داده‌شده
2. بررسی وضعیت روم (باید `pending` باشد)
3. دریافت `entryFee` از `game_rooms` مرتبط
4. ایجاد رکورد جدید در جدول `reservations`
5. امکان عضویت همزمان در چند روم

## فایل‌های ایجاد/تغییر شده
- `src/entities/active-room-global.entity.ts` - موجودیت جدید
- `src/modules/reservation/` - ماژول جدید
  - `reservation.module.ts`
  - `reservation.controller.ts`
  - `reservation.service.ts`
  - `dto/reserve-request.dto.ts`
- `src/app.module.ts` - اضافه کردن ReservationModule

## تاریخ ایجاد
1403/07/02

## وضعیت
✅ تکمیل شده

