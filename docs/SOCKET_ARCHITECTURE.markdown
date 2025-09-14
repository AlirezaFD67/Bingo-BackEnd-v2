# معماری سوکت در پروژه NestJS

این سند ساختار کامل سوکت‌ها در پروژه‌های مبتنی بر NestJS را مشخص می‌کند. این فایل برای پروژه‌های دارای سوکت طراحی شده و جزئیات کاملی از ساختار، فایل‌ها، Swagger، و داکیومنت‌ها ارائه می‌دهد.

## فهرست محتوا
- [۱. ساختار کلی سوکت](#۱-ساختار-کلی-سوکت)
- [۲. فولدرها و فایل‌ها](#۲-فولدرها-و-فایل‌ها)
- [۳. وابستگی‌ها](#۳-وابستگی‌ها)
- [۴. namespaceها و eventها](#۴-namespaceها-و-eventها)
- [۵. Swagger برای سوکت](#۵-Swagger-برای-سوکت)
- [۶. داکیومنت‌ها](#۶-داکیومنت‌ها)
- [۷. تست‌ها](#۷-تست‌ها)
- [۸. نکات](#۸-نکات)
- [منابع مرتبط](#منابع-مرتبط)

---

## ۱. ساختار کلی سوکت
سوکت‌ها در پروژه‌های NestJS با استفاده از `@nestjs/websockets` و `socket.io` پیاده‌سازی می‌شوند. ساختار ماژولار و جدا از APIهای REST است.

**ویژگی‌ها**:
- **Realtime communication**: برای چت، نوتیفیکیشن، و غیره.
- **احراز هویت**: با JWT در گارد سوکت.
- **namespaceها**: جدا برای نقش‌های مختلف (admin, user).

---

## ۲. فولدرها و فایل‌ها
```
project-root/
├── src/
│   ├── modules/
│   │   ├── socket/
│   │   │   ├── socket.module.ts          # ماژول اصلی سوکت
│   │   │   ├── socket.gateway.ts         # گیت‌وی سوکت
│   │   │   ├── socket.service.ts         # سرویس سوکت
│   │   │   ├── dto/
│   │   │   │   ├── emit-message.dto.ts   # DTO برای eventها
│   │   ├── socket-mock/
│   │   │   ├── socket-mock.controller.ts # کنترلر mock برای Swagger
│   │   │   ├── socket-mock.service.ts    # سرویس mock
│   │   │   ├── dto/
│   │   │   │   ├── emit-message.dto.ts   # DTO mock
│   ├── common/
│   │   ├── filters/
│   │   │   ├── socket-exception.filter.ts # فیلتر ارور سوکت
│   │   ├── constants/
│   │   │   ├── error-messages.ts         # پیام‌های ارور
│   ├── tests/
│   │   ├── socket/
│   │   │   ├── socket-general.spec.ts   # تست سوکت
├── docs/
│   ├── tasks/
│   │   ├── socket/
│   │   │   ├── 1404-05-01-T123-SocketGeneral.md # داکیومنت تسک
│   │   │   ├── 1404-05-01-T123-SocketGeneral-v1.md # آپدیت
├── .env
│   # SOCKET_PORT=3001
│   # JWT_SECRET=your_secret
```

**نکته**: فایل‌ها در `src/modules/socket/` برای منطق اصلی، و `src/modules/socket-mock/` برای mockهای Swagger.

---

## ۳. وابستگی‌ها
- **پکیج‌ها**: `@nestjs/websockets`, `socket.io`, `socket.io-client` (برای تست).
- **نصب**: `npm install @nestjs/websockets socket.io socket.io-client`.

---

## ۴. namespaceها و eventها
- **namespaceها**:
  - `/socket/admin/general`: برای ادمین‌ها.
  - `/socket/user/general`: برای کاربران عادی.
- **eventها**: مثل `emitMessage`, `messageResponse`.
- **مثال پیاده‌سازی**:
  ```typescript
  @WebSocketGateway({ namespace: '/socket/admin/general' })
  export class SocketGateway {
    @SubscribeMessage('emitMessage')
    handleMessage(@MessageBody() data: EmitMessageDto) {
      // منطق
    }
  }
  ```

---

## ۵. Swagger برای سوکت
سوکت‌ها مستقیماً در Swagger نمایش داده نمی‌شوند، اما از mock endpointهای HTTP استفاده کنید:
- **mock کنترلر**: در `src/modules/socket-mock/socket-mock.controller.ts`.
- **endpointهای mock**: POST `/socket/general/emit-message` برای شبیه‌سازی event.
- **مثال**:
  ```typescript
  @ApiTags('socket-general')
  @Controller('socket/general')
  export class SocketMockController {
    @Post('emit-message')
    @ApiBody({ type: EmitMessageDto })
    emitMessage(@Body() dto: EmitMessageDto) {
      return { status: 'emitted' };
    }
  }
  ```
- **مسیر Swagger**: `/api/docs` (mockها در این مسیر نمایش داده می‌شوند).

---

## ۶. داکیومنت‌ها
- **محل**: `docs/tasks/socket/[shamsiDate]-[TaskID]-[TaskName].md`.
- **فرمت**: طبق TASK_DOCUMENTATION_GUIDELINES.markdown.
- **مثال**: `docs/tasks/socket/1404-05-01-T123-SocketGeneral.md`.

---

## ۷. تست‌ها
- **محل**: `src/tests/socket/[FeatureName].spec.ts`.
- **ابزار**: Jest + `socket.io-client`.
- **پوشش**: 80%+.
- **مثال**:
  ```typescript
  describe('SocketModule', () => {
    it('باید پیام emit کند', (done) => {
      const socket = io('http://localhost:3000/socket/general', { auth: { token: 'jwt' } });
      socket.emit('emitMessage', { message: 'Hello' });
      socket.on('messageResponse', (data) => {
        expect(data.status).toBe('emitted');
        done();
      });
    });
  });
  ```

---

## ۸. نکات
- **احراز هویت**: از `JwtSocketGuard` برای namespaceها استفاده کنید.
- **ارورها**: در `src/common/filters/socket-exception.filter.ts`.
- **پیکربندی**: در `.env` برای `SOCKET_PORT`.
- **به‌روزرسانی**: پس از تغییرات، mockها و تست‌ها را آپدیت کنید.

---

## منابع مرتبط
- [before_socket.markdown](./before_socket.markdown) - چک‌لیست قبل از شروع
- [after_socket.markdown](./after_socket.markdown) - چک‌لیست بعد از پایان
- [ARCHITECTURE.markdown](./ARCHITECTURE.markdown) - معماری عمومی (برای مقایسه)
- [SWAGGER_GUIDELINES.markdown](./SWAGGER_GUIDELINES.markdown) - راهنمای Swagger عمومی
