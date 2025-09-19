# Wheel Spin API Documentation

## Overview
سیستم چرخش گردونه که به کاربران امکان دریافت جایزه از طریق چرخش گردونه را می‌دهد. هر کاربر فقط یکبار در 24 ساعت می‌تواند گردونه بچرخاند.

## Authentication
تمام endpoint های این API نیاز به JWT Bearer Token دارند.

## Endpoints

### 1. بررسی مجاز بودن چرخش

**GET** `/api/wheel/can-spin`

بررسی می‌کند که آیا کاربر می‌تواند گردونه بچرخاند یا نه.

#### Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

#### Response

**200 OK**
```json
{
  "canSpin": true,
  "remainingTime": "05:30"
}
```

**401 Unauthorized**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**404 Not Found**
```json
{
  "statusCode": 404,
  "message": "کاربر پیدا نشد"
}
```

#### Response Fields
- `canSpin` (boolean): آیا کاربر می‌تواند گردونه بچرخاند
- `remainingTime` (string, optional): زمان باقی‌مانده تا چرخش بعدی (فرمت hh:mm)

---

### 2. چرخش گردونه

**POST** `/api/wheel/spin`

چرخش گردونه و دریافت جایزه. هر کاربر فقط یکبار در 24 ساعت می‌تواند گردونه بچرخاند.

#### Headers
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

#### Request Body
```json
{
  "value": 20000
}
```

#### Request Fields
- `value` (number): مقدار جایزه - فقط مقادیر مجاز: 20000, 10000, 5000, 0

#### Response

**200 OK**
```json
{
  "success": true,
  "prizeAmount": 20000,
  "newBalance": 150000,
  "message": "جایزه گردونه با موفقیت ثبت شد"
}
```

**400 Bad Request**
```json
{
  "statusCode": 400,
  "message": "شما فقط یکبار در 24 ساعت می‌توانید گردونه بچرخانید"
}
```

**401 Unauthorized**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**404 Not Found**
```json
{
  "statusCode": 404,
  "message": "کاربر پیدا نشد"
}
```

#### Response Fields
- `success` (boolean): وضعیت موفقیت عملیات
- `prizeAmount` (number): مقدار جایزه دریافت شده
- `newBalance` (number): موجودی جدید کیف پول کاربر
- `message` (string): پیام توضیحی

## Business Rules

### محدودیت زمانی
- هر کاربر فقط یکبار در 24 ساعت می‌تواند گردونه بچرخاند
- محاسبه از آخرین چرخش (نه از شروع روز)

### محدودیت مقادیر
- فقط مقادیر 20000، 10000، 5000، 0 تومان قابل قبول
- سایر مقادیر رد می‌شوند

### منطق کاری
1. **اعتبارسنجی مقدار ورودی** (فقط مقادیر مجاز)
2. **بررسی محدودیت 24 ساعته**
3. **ذخیره چرخش در جدول `wheel_spins`**
4. **اگر مقدار > 0:**
   - اضافه کردن به موجودی کیف پول
   - ثبت تراکنش با نوع "جایزه گردونه"
5. **اگر مقدار = 0:**
   - فقط ثبت زمان چرخش (بدون تغییر کیف پول)

## Error Codes

| Code | Description |
|------|-------------|
| `WHEEL_SPIN_LIMIT_EXCEEDED` | محدودیت 24 ساعته |
| `INVALID_WHEEL_PRIZE_AMOUNT` | مقدار جایزه نامعتبر |
| `USER_NOT_FOUND` | کاربر پیدا نشد |

## Database Changes

### Tables Affected
- `wheel_spins`: ثبت چرخش‌های گردونه
- `wallet_transactions`: ثبت تراکنش‌های جایزه
- `users`: بروزرسانی موجودی کیف پول

### Transaction Types
- `WHEEL_SPIN`: جایزه گردونه
