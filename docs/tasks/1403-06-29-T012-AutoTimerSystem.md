# تسک T012: سیستم تایمر خودکار اتاق‌های بازی

## اطلاعات کلی
- **تاریخ**: 1403/06/29
- **تسک ID**: T012
- **نام**: AutoTimerSystem
- **توسعه‌دهنده**: AI Assistant

## شرح تسک
پیاده‌سازی سیستم تایمر خودکار برای اتاق‌های بازی که به صورت real-time عمل می‌کند و اتاق‌ها را بر اساس تعداد بازیکنان مدیریت می‌کند.

## فایل‌های ایجاد شده

### 1. Entity جدید
- `src/entities/active-room-global.entity.ts` - Entity برای اتاق‌های فعال

### 2. Enum جدید
- `src/enums/room-status.enum.ts` - وضعیت‌های اتاق (PENDING, STARTED, FINISHED, DEACTIVATED)

### 3. Service
- `src/modules/admin/auto-timer.service.ts` - سرویس مدیریت تایمر خودکار

### 4. Index فایل‌ها
- `src/entities/index.ts` - Export تمام entity ها
- `src/enums/index.ts` - Export تمام enum ها

## ویژگی‌های پیاده‌سازی شده

### 1. شروع خودکار
- هنگام راه‌اندازی پروژه، برای هر اتاق فعال (`isActive = true`, `type = 1`) یک رکورد در `active_room_global` ایجاد می‌شود
- تایمر با مقدار `startTimer` اتاق اصلی شروع می‌شود

### 2. تایمر نزولی
- هر ثانیه از `remainingSeconds` کم می‌شود
- مقدار `remainingSeconds` در دیتابیس بروزرسانی می‌شود
- `remainingSeconds` به عنوان integer (ثانیه) ذخیره می‌شود

### 3. بررسی تعداد بازیکنان
- وقتی تایمر به 0 می‌رسد، `status` فوراً به `started` تغییر می‌کند
- سپس تعداد منحصر به فرد کاربرانی که برای آن اتاق کارت رزرو کرده‌اند بررسی می‌شود
- اگر تعداد بازیکنان به `minPlayers` رسیده باشد، بازی ادامه می‌یابد
- اگر تعداد بازیکنان کافی نباشد، `status` به `pending` برمی‌گردد و تایمر ریست می‌شود

### 4. ریست تایمر
- هنگام ریست شدن، `remainingSeconds` دوباره به مقدار `startTimer` اتاق اصلی تنظیم می‌شود
- `status` به `pending` برمی‌گردد
- `updatedAt` بروزرسانی می‌شود

### 5. مدیریت Timer ها
- هر اتاق تایمر جداگانه‌ای دارد
- تایمرها در Map نگهداری می‌شوند
- هنگام shutdown همه تایمرها متوقف می‌شوند

### 6. ایجاد اتاق جدید هنگام شروع بازی
- وقتی یک اتاق `status=started` می‌شود، اتاق جدید `pending` برای همان `gameRoomId` ایجاد می‌شود
- این تضمین می‌کند که همیشه یک اتاق `pending` برای هر `game_rooms` با `type=1` وجود داشته باشد
- اتاق جدید با `remainingSeconds=startTimer` و `status=PENDING` ایجاد می‌شود

## تغییرات در Migration

### Migration اصلاح شده
- `src/migrations/1700000000003-CreateGlobalActiveRoomTable.ts`
- `remainingSeconds` به عنوان integer (ثانیه) ذخیره می‌شود

## منطق کاری

1. **شروع پروژه**: سرویس `AutoTimerService` اجرا می‌شود
2. **ایجاد اتاق‌های فعال**: برای هر اتاق فعال GLOBAL یک رکورد در `active_room_global` ایجاد می‌شود
3. **شروع تایمر**: هر اتاق تایمر جداگانه‌ای دارد که هر ثانیه اجرا می‌شود
4. **کاهش تایمر**: هر ثانیه از `remainingSeconds` کم می‌شود
5. **بررسی پایان تایمر**: وقتی `remainingSeconds` به 0 می‌رسد
6. **تغییر وضعیت**: `status` فوراً به `started` تغییر می‌کند
7. **شمارش بازیکنان**: تعداد منحصر به فرد کاربران در `reservations` شمارش می‌شود
8. **تصمیم‌گیری**: 
   - اگر تعداد بازیکنان کافی باشد → بازی ادامه می‌یابد + ایجاد اتاق جدید `pending`
   - اگر کافی نباشد → `status` به `pending` برمی‌گردد + تایمر ریست می‌شود

## پیاده‌سازی فنی

### متد `processTimerTick`
```typescript
if (activeRoom.remainingSeconds <= 0) {
  // Timer reached zero, change status to started first
  activeRoom.status = RoomStatus.STARTED;
  activeRoom.updatedAt = new Date();
  await this.activeRoomRepository.save(activeRoom);
  
  this.logger.log(`Game started for active room ${activeRoom.id} - status changed to started`);
  
  // Then check player count and proceed
  await this.checkPlayerCountAndProceed(activeRoom, gameRoom);
}
```

### متد `checkPlayerCountAndProceed`
```typescript
if (uniquePlayerCount >= gameRoom.minPlayers) {
  // Enough players, proceed with game logic
  await this.proceedWithGame(activeRoom);
} else {
  // Not enough players, reset timer and status
  await this.resetTimer(activeRoom, gameRoom);
}
```

### متد `resetTimer`
```typescript
private async resetTimer(activeRoom: ActiveRoomGlobal, gameRoom: GameRoom) {
  try {
    activeRoom.remainingSeconds = gameRoom.startTimer;
    activeRoom.status = RoomStatus.PENDING; // Reset status to pending
    activeRoom.updatedAt = new Date();
    await this.activeRoomRepository.save(activeRoom);
    
    this.logger.log(
      `Timer reset for active room ${activeRoom.id}, status changed to pending, restarting countdown`,
    );
  } catch (error) {
    this.logger.error(
      `Error resetting timer for active room ${activeRoom.id}:`,
      error,
    );
  }
}
```

### متد `proceedWithGame`
```typescript
try {
  // Status is already set to STARTED in processTimerTick
  activeRoom.updatedAt = new Date();
  await queryRunner.manager.save(ActiveRoomGlobal, activeRoom);
  
  this.stopTimer(activeRoom.id);
  this.logger.log(`Game proceeding for active room ${activeRoom.id}`);
  // ... باقی منطق بازی
}
```

## نکات فنی

### Performance
- تایمرها به صورت غیرهمزمان (async) اجرا می‌شوند
- هر ثانیه فقط یک بار دیتابیس بروزرسانی می‌شود
- Query های بهینه برای شمارش بازیکنان

### Error Handling
- مدیریت خطا در تمام مراحل
- Logging کامل برای debugging
- توقف تایمر در صورت خطا

### Memory Management
- Map برای نگهداری تایمرها
- پاک‌سازی تایمرها هنگام shutdown
- جلوگیری از memory leak

## تست‌ها
- Build موفق پروژه
- عدم وجود lint errors
- آماده برای تست runtime

## نتیجه
سیستم تایمر خودکار با تمام قابلیت‌های مورد نیاز پیاده‌سازی شد و آماده استفاده است.

## ویژگی‌های کلیدی
- **تغییر فوری وضعیت**: وقتی تایمر به 0 می‌رسد، `status` فوراً به `started` تغییر می‌کند
- **ایجاد خودکار اتاق جدید**: هنگام شروع هر بازی، اتاق جدید `pending` برای همان `gameRoomId` ایجاد می‌شود
- **مدیریت مداوم اتاق‌ها**: همیشه یک اتاق `pending` برای هر `game_rooms` با `type=1` وجود دارد
- **ریست هوشمند**: اگر بازیکنان کافی نباشد، `status` به `pending` برمی‌گردد و تایمر ریست می‌شود