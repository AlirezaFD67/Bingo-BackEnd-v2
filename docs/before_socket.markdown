# راهنمای قبل از شروع پیاده‌سازی سوکت

این سند چک‌لیست اقدامات لازم قبل از شروع پیاده‌سازی سوکت‌ها را ارائه می‌دهد. این فایل مستقل است و تمام استانداردها را پوشش می‌دهد.

## چک‌لیست قبل از شروع
- [ ] **بررسی نسخه‌ها**:
  - Node.js: 18+.
  - NestJS: از `package.json`.
  - پکیج‌ها: `@nestjs/websockets`, `socket.io`, `socket.io-client` (با `npm install @nestjs/websockets socket.io socket.io-client`).
- [ ] **بررسی معماری سوکت**:
  - ساختار فولدرها: `src/modules/socket/`, `src/modules/socket-mock/`, `docs/tasks/socket/`.
  - namespaceها: `/socket/admin/...`, `/socket/user/...`.
  - وابستگی‌ها: `@nestjs/websockets`, `socket.io`, `socket.io-client`.
- [ ] **بررسی فایل‌های تنظیمات**:
  - `.env` برای `SOCKET_PORT`, `JWT_SECRET`.
  - `nest-cli.json`, `tsconfig.json`.
  - `.gitignore`.
- [ ] **مطالعه مستندات**:
  - CODING_GUIDELINES.markdown
  - AUTH_GUIDELINES.markdown
  - TESTING_GUIDELINES.markdown
  - SWAGGER_GUIDELINES.markdown
- [ ] **شناسایی منطق کاری**:
  - eventها و namespaceها (مثل `/socket/admin/general`, `/socket/user/general`) را مشخص کنید.
  - ورودی/خروجی‌ها را از صاحب پروژه دریافت کنید.
- [ ] **بررسی کدنویسی سوکت**:
  - محل فایل‌ها: `src/modules/socket/` برای ماژول سوکت، `src/modules/socket-mock/` برای mockها.
  - نام‌گذاری: فایل‌ها با PascalCase، فولدرها با kebab-case.
  - استفاده از ابزارها: `@nestjs/websockets`, `@nestjs/jwt` برای احراز هویت سوکت.
- [ ] **بررسی Swagger برای سوکت**:
  - **Mock Controller**: در `src/modules/socket-mock/` با endpoint مناسب
  - **Endpoint Naming**: `GET /api/socket-test/[feature-name]` (مثل `/api/socket-test/active-room-global`)
  - **Query Parameters**: برای فیلترها (مثل `?status=pending`)
  - **Documentation**: شامل namespace، events، نمونه کد JavaScript
  - **Tag**: `Socket Testing` در Swagger
  - **Response Format**: DTO مناسب با نمونه داده
- [ ] **ساخت برنچ**:
  - فرمت: `[نوع تغییر]-[TaskID]-[توضیح مختصر]` (مثل `Feat-T123-Add-socket-general`).
  - دستور:
    ```bash
    git checkout develop
    git pull
    git checkout -b Feat-T123-Add-socket-general
    ```
- [ ] **تأیید کاربر**:
  - تأیید صاحب پروژه را دریافت کنید.

## استانداردهای Swagger برای سوکت

### ساختار Mock Controller:
```typescript
@ApiTags('Socket Testing')
@Controller('socket-test')
export class SocketMockController {
  @Get('[feature-name]') // مثل 'active-room-global'
  @ApiOperation({
    summary: 'Get [Feature Name] (Socket Mock)',
    description: `
    **Socket Namespace:** \`/[namespace]\`
    
    **Send Event:** \`[eventName]\`
    - Data: \`[dataFormat]\`
    
    **Receive Event:** \`[responseEvent]\`
    - Data: [responseFormat]
    
    **Socket Connection:**
    \`\`\`javascript
    const socket = io('http://localhost:3006/[namespace]');
    
    socket.emit('[eventName]', [data]);
    
    socket.on('[responseEvent]', (data) => {
      console.log('Response:', data);
    });
    \`\`\`
    `
  })
  @ApiQuery({
    name: '[filterName]',
    required: false,
    enum: ['[values]'],
    description: '[description]'
  })
  @ApiResponse({
    status: 200,
    description: '[description]',
    type: [ResponseDto]
  })
  async [methodName](
    @Query('[filterName]') [filterName]?: '[type]'
  ): Promise<[ResponseDto]> {
    // Implementation
  }
}
```

### استانداردهای نام‌گذاری:
- **Endpoint**: `GET /api/socket-test/[feature-name]`
- **Event ارسال**: `[feature]Request` (مثل `activeRoomGlobalRequest`)
- **Event دریافت**: `[feature]` (مثل `activeRoomGlobal`)
- **Tag**: همیشه `Socket Testing`
- **Namespace**: `/rooms`, `/admin`, `/user` بر اساس منطق کاری

### نمونه Response DTO:
```typescript
export class [Feature]ResponseDto {
  @ApiProperty({ description: 'List of [items]', type: [[ItemDto]] })
  [items]: [ItemDto][];
}
```

## نکات
- namespaceها با پیشوند نقش (مثل `/socket/admin/...`).
- برای مستندسازی به SWAGGER_GUIDELINES.markdown مراجعه کنید.
- با ARCHITECTURE.markdown هم‌خوانی داشته باشد.
- همیشه Mock Controller با Documentation کامل ایجاد کنید.