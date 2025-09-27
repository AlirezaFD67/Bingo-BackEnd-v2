# تسک T006: مدیریت اتاق‌های بازی

## اطلاعات کلی
- **تاریخ**: 1403/06/29
- **تسک ID**: T006
- **نام**: GameRoomsManagement
- **توسعه‌دهنده**: AI Assistant

## شرح تسک
پیاده‌سازی سیستم کامل مدیریت اتاق‌های بازی برای ادمین‌ها شامل CRUD operations و فیلترهای پیشرفته.

## فایل‌های ایجاد شده

### 1. Entity
- `src/entities/game-room.entity.ts` - Entity اصلی اتاق‌های بازی

### 2. Enum
- `src/enums/room-type.enum.ts` - انواع اتاق (GLOBAL, PRIVATE)

### 3. DTOs
- `src/modules/admin/dto/create-game-room.dto.ts` - DTO ایجاد اتاق
- `src/modules/admin/dto/update-game-room.dto.ts` - DTO به‌روزرسانی اتاق
- `src/modules/admin/dto/update-room-status.dto.ts` - DTO تغییر وضعیت
- `src/modules/admin/dto/get-rooms-query.dto.ts` - DTO فیلترهای جستجو
- `src/modules/admin/dto/game-room-response.dto.ts` - DTO پاسخ API

### 4. Service
- `src/modules/admin/game-rooms.service.ts` - منطق کسب‌وکار

### 5. Controller
- `src/modules/admin/game-rooms.controller.ts` - API endpoints

## API Endpoints

### GET /api/admin/rooms
- **توضیح**: دریافت لیست اتاق‌های بازی با فیلتر
- **Query Parameters**: 
  - `type` (اختیاری): نوع اتاق (1=GLOBAL, 2=PRIVATE)
  - `isActive` (اختیاری): وضعیت فعال بودن (true/false)
- **Response**: آرایه‌ای از GameRoomResponseDto

### GET /api/admin/rooms/:id
- **توضیح**: دریافت یک اتاق خاص
- **Parameters**: id (number)
- **Response**: GameRoomResponseDto

### POST /api/admin/rooms
- **توضیح**: ایجاد اتاق جدید
- **Body**: CreateGameRoomDto
- **Response**: GameRoomResponseDto

### PUT /api/admin/rooms/:id
- **توضیح**: به‌روزرسانی اتاق
- **Parameters**: id (number)
- **Body**: UpdateGameRoomDto
- **Response**: GameRoomResponseDto

### PUT /api/admin/rooms/:id/status
- **توضیح**: تغییر وضعیت اتاق
- **Parameters**: id (number)
- **Body**: UpdateRoomStatusDto
- **Response**: GameRoomResponseDto

## ویژگی‌های پیاده‌سازی شده

### 1. فیلترهای پیشرفته
- فیلتر بر اساس نوع اتاق (GLOBAL/PRIVATE)
- فیلتر بر اساس وضعیت فعال بودن
- ترکیب فیلترها

### 2. مرتب‌سازی
- لیست اتاق‌ها بر اساس `entryFee` از کم به زیاد مرتب‌سازی می‌شود
- ترتیب ثابت و قابل پیش‌بینی برای کاربران

### 3. Validation
- تمام فیلدهای ورودی validated
- تبدیل صحیح string به boolean برای فیلترها

### 4. Error Handling
- 404 برای اتاق یافت نشده
- 400 برای داده‌های نامعتبر
- 401 برای عدم احراز هویت

### 5. Security
- فقط ادمین‌ها دسترسی دارند
- JWT authentication required

## مشکلات حل شده

### 1. مشکل ClassSerializerInterceptor
- آرایه‌ها به object تبدیل می‌شدند
- حل شد با حذف interceptor از controller level

### 2. مشکل Transform Decorator
- string به boolean تبدیل نمی‌شد
- حل شد با تبدیل دستی در controller

## تست‌ها
- تمام endpoints تست شده‌اند
- فیلترها صحیح کار می‌کنند
- Error handling درست عمل می‌کند

## نتیجه
سیستم کامل مدیریت اتاق‌های بازی با تمام قابلیت‌های مورد نیاز پیاده‌سازی شد.
