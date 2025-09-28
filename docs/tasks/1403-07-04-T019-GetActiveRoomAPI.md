# تسک T019: API دریافت اطلاعات اتاق فعال

## اطلاعات کلی
- **تاریخ**: 1403/07/04
- **تسک ID**: T019
- **نام**: GetActiveRoomAPI
- **توسعه‌دهنده**: AI Assistant

## شرح تسک
پیاده‌سازی API endpoint برای دریافت اطلاعات یک اتاق فعال بر اساس شناسه.

## فایل‌های ایجاد شده

### 1. ماژول Rooms
- `src/modules/rooms/rooms.module.ts` - ماژول اصلی
- `src/modules/rooms/rooms.controller.ts` - کنترلر API
- `src/modules/rooms/rooms.service.ts` - سرویس (ActiveRoomsService)
- `src/modules/rooms/dto/active-room-response.dto.ts` - DTO پاسخ

### 2. فایل‌های به‌روزرسانی شده
- `src/constants/endpoints.ts` - اضافه شدن endpoint جدید
- `src/app.module.ts` - اضافه شدن RoomsModule

## API Endpoint

### GET /rooms/:id
- **توضیح**: دریافت اطلاعات یک اتاق فعال
- **Parameters**: 
  - `id` (number): شناسه اتاق فعال
- **Response**: ActiveRoomResponseDto
- **Authentication**: ندارد (public endpoint)

## ساختار پاسخ
```json
{
  "id": 1,
  "status": "pending",
  "startTime": "2024-06-25T18:00:00Z",
  "gameRoom": {
    "id": 1,
    "name": "Room 1",
    "entryFee": 100000,
    "startTimer": 100,
    "isActive": true,
    "createdAt": "2024-03-20T12:00:00Z",
    "createdAtPersian": "1403/01/01",
    "type": 1,
    "minPlayers": 3
  }
}
```

## ویژگی‌های پیاده‌سازی شده
- تبدیل تاریخ میلادی به شمسی
- مدیریت خطاها (404 برای اتاق‌های موجود نباشد)
- مستندسازی کامل با Swagger
- عدم نیاز به احراز هویت

## مرتب‌سازی لیست اتاق‌های فعال
- لیست اتاق‌های فعال در API `/socket-test/active-room-global` بر اساس `entryFee` اتاق اصلی از کم به زیاد مرتب‌سازی می‌شود
- این تضمین می‌کند که ترتیب اتاق‌ها ثابت و قابل پیش‌بینی باشد

## تست‌ها
- ✅ Build موفقیت‌آمیز
- ✅ عدم وجود خطای linting
- ✅ API endpoint فعال و قابل دسترسی
