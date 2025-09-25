# T015 - Number Drawn Socket

## توضیحات تسک
پیاده‌سازی سوکت برای دریافت اعداد خوانده شده در بازی بینگو.

## Socket Details
- **Namespace**: `/rooms`
- **Event ارسال**: `numberDrawnRequest`
- **Event دریافت**: `numberDrawn`

## ورودی
```json
{
  "activeRoomId": 1
}
```

## خروجی موفق
```json
{
  "namespace": "/rooms",
  "event": "numberDrawn",
  "data": {
    "activeRoomId": 1,
    "number": 42,
    "totalDrawnNumbers": 17,
    "drawnNumbers": [12, 45, 3, 78, 22]
  }
}
```

## منطق پیاده‌سازی
1. دریافت `activeRoomId` از کلاینت
2. جست‌وجو در جدول `drawn_numbers` برای روم مشخص شده
3. بازگرداندن تمام اعداد خوانده شده به ترتیب زمان
4. محاسبه تعداد کل و آخرین عدد خوانده شده

## فایل‌های ایجاد/تغییر شده
- `src/modules/socket/rooms.gateway.ts` - اضافه کردن event handler
- `src/modules/socket/rooms.service.ts` - اضافه کردن متد getDrawnNumbers
- `src/modules/socket/socket.module.ts` - اضافه کردن DrawnNumber repository
- `src/modules/socket-mock/socket-mock.controller.ts` - اضافه کردن mock endpoint
- `src/modules/socket-mock/socket-mock.module.ts` - اضافه کردن DrawnNumber repository

## تاریخ ایجاد
1403/07/02

## وضعیت
✅ تکمیل شده

## نحوه استفاده
```javascript
const socket = io('http://localhost:3006/rooms');

socket.emit('numberDrawnRequest', { activeRoomId: 1 });

socket.on('numberDrawn', (data) => {
  console.log('Drawn Numbers:', data.data.drawnNumbers);
  console.log('Total Drawn:', data.data.totalDrawnNumbers);
  console.log('Last Number:', data.data.number);
});
```
