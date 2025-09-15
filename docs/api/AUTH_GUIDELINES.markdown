# راهنمای Authentication و کنترل دسترسی

این سند دستورات لازم برای احراز هویت و مدیریت دسترسی در پروژه‌های NestJS را مشخص می‌کند. سیستم فعلی از احراز هویت مبتنی بر OTP (کد یکبار مصرف) استفاده می‌کند.

## فهرست محتوا
- [۱. معماری احراز هویت](#۱-معماری-احراز-هویت)
- [۲. تنظیم OTP](#۲-تنظیم-otp)
- [۳. تنظیم گارد و استراتژی JWT](#۳-تنظیم-گارد-و-استراتژی-jwt)
- [۴. مدیریت نقش‌های کاربری](#۴-مدیریت-نقش‌های-کاربری)
- [۵. استفاده از دکوراتورها](#۵-استفاده-از-دکوراتورها)
- [۶. نکات امنیتی](#۶-نکات-امنیتی)
- [منابع مرتبط](#منابع-مرتبط)

---

## ۱. معماری احراز هویت

سیستم احراز هویت فعلی از معماری زیر استفاده می‌کند:

- **احراز هویت مبتنی بر OTP**: استفاده از کد یکبار مصرف ارسال شده به شماره تلفن
- **JWT برای نشست‌ها**: استفاده از توکن‌های JWT برای مدیریت نشست‌های کاربر
- **نقش‌های کاربری**: سیستم نقش‌بندی برای کنترل دسترسی
- **سیستم رفرال**: امکان رفرال کاربران جدید

### اجزای اصلی:
- `AuthModule`: ماژول اصلی احراز هویت
- `AuthService`: سرویس اصلی مدیریت OTP و JWT
- `SmsService`: سرویس ارسال پیامک
- `JwtStrategy`: استراتژی احراز هویت JWT
- `JwtAuthGuard`: گارد محافظت از مسیرها

---

## ۲. تنظیم OTP

### درخواست کد OTP
```typescript
// POST /api/auth/request-otp
{
  "phoneNumber": "09123456789",
  "incomingReferral": "ABC12" // اختیاری، ۵ کاراکتر
}
```

**پاسخ موفق**:
```json
{
  "message": "OTP sent successfully",
  "phoneNumber": "09123456789",
  "code": "1234",
  "canUseReferral": true
}
```

### تایید کد OTP
```typescript
// POST /api/auth/verify-otp
{
  "phoneNumber": "09123456789",
  "code": "1234",
  "incomingReferral": "ABC12" // اختیاری
}
```

**پاسخ موفق**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "hasUsername": false
}
```

### سرویس AuthService
```typescript
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(OtpCode) private otpCodeRepository: Repository<OtpCode>,
    private jwtService: JwtService,
    private smsService: SmsService,
  ) {}

  async requestOtp(dto: RequestOtpDto): Promise<RequestOtpResponseDto> {
    // تولید کد ۴ رقمی تصادفی
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // ذخیره در دیتابیس با زمان انقضا ۳۰ دقیقه
    const otpCode = this.otpCodeRepository.create({
      phoneNumber: dto.phoneNumber,
      code,
      incomingReferral: dto.incomingReferral,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    });

    await this.otpCodeRepository.save(otpCode);
    await this.smsService.sendOtp(dto.phoneNumber, code);

    return {
      message: 'OTP sent successfully',
      phoneNumber: dto.phoneNumber,
      code,
      canUseReferral: !dto.incomingReferral,
    };
  }

  async verifyOtp(dto: VerifyOtpDto): Promise<VerifyOtpResponseDto> {
    const otpCode = await this.otpCodeRepository.findOne({
      where: {
        phoneNumber: dto.phoneNumber,
        code: dto.code,
        isVerified: false,
      },
    });

    if (!otpCode || otpCode.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired OTP code');
    }

    // بروزرسانی OTP به عنوان تایید شده
    await this.otpCodeRepository.update(otpCode.id, {
      isVerified: true,
      verifiedAt: new Date(),
    });

    // ایجاد یا یافت کاربر
    let user = await this.userRepository.findOne({
      where: { phoneNumber: dto.phoneNumber },
    });

    if (!user) {
      user = this.userRepository.create({
        phoneNumber: dto.phoneNumber,
        referredBy: dto.incomingReferral || otpCode.incomingReferral,
      });
      await this.userRepository.save(user);
    }

    // تولید JWT
    const payload = {
      sub: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role || 'user',
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      hasUsername: !!user.username,
    };
  }
}
```

---

## ۳. تنظیم گارد و استراتژی JWT

### JwtStrategy
```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    return {
      id: payload.sub,
      phoneNumber: payload.phoneNumber,
      role: payload.role || 'user',
    };
  }
}
```

### JwtAuthGuard
```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // چک کردن مسیرهای عمومی
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or missing JWT token');
    }

    // چک کردن نقش‌های مورد نیاز
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(user.role)) {
        throw new UnauthorizedException('Insufficient permissions');
      }
    }

    return user;
  }
}
```

---

## ۴. مدیریت نقش‌های کاربری

### تعریف نقش‌ها
```typescript
// src/types/auth.ts
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}
```

### استفاده از نقش‌ها در کنترلر
```typescript
@Controller('api/admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  @Get('users')
  @Roles(UserRole.ADMIN)
  getAllUsers() {
    // فقط ادمین‌ها دسترسی دارند
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  getStats() {
    // ادمین و مودراتورها دسترسی دارند
  }
}
```

---

## ۵. استفاده از دکوراتورها

### دکوراتور Roles
```typescript
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../types/auth';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

### دکوراتور IsPublic
```typescript
export const IsPublic = () => SetMetadata('isPublic', true);

// استفاده در کنترلر
@Controller('api/public')
export class PublicController {
  @Get('health')
  @IsPublic()
  healthCheck() {
    return { status: 'ok' };
  }
}
```

### دسترسی به اطلاعات کاربر
```typescript
import { Request } from 'express';

@Controller('api/user')
@UseGuards(JwtAuthGuard)
export class UserController {
  @Get('profile')
  getProfile(@Req() request: Request) {
    // دسترسی به اطلاعات کاربر از JWT
    const user = request.user;
    return {
      id: user.id,
      phoneNumber: user.phoneNumber,
      role: user.role,
    };
  }
}
```

---

## ۶. نکات امنیتی

### ۱. اعتبار سنجی ورودی‌ها
```typescript
// استفاده از class-validator برای اعتبار سنجی
export class RequestOtpDto {
  @IsString()
  @Matches(/^09\d{9}$/, { message: 'Phone number must be in format 09xxxxxxxxx' })
  phoneNumber: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.incomingReferral && o.incomingReferral.length > 0)
  @Length(5, 5, { message: 'Referral code must be exactly 5 characters' })
  incomingReferral?: string;
}
```

### ۲. مدیریت زمان انقضا OTP
- کدهای OTP دارای زمان انقضا ۳۰ دقیقه هستند
- پس از استفاده، کد غیرفعال می‌شود

### ۳. امنیت JWT
- استفاده از کلید مخفی امن برای امضای توکن‌ها
- زمان انقضا ۷ روزه برای توکن‌ها
- ذخیره امن کلیدهای مخفی در متغیرهای محیطی

### ۴. لاگ‌گیری امنیتی
```typescript
// لاگ کردن تلاش‌های ناموفق احراز هویت
logger.warn(`Failed OTP verification attempt for phone: ${phoneNumber}`);
logger.info(`Successful login for user: ${user.id}`);
```

---

## منابع مرتبط
- [API_GUIDELINES.markdown](./API_GUIDELINES.markdown) - پیاده‌سازی APIها
- [SWAGGER_GUIDELINES.markdown](./SWAGGER_GUIDELINES.markdown) - مستندسازی
- [TESTING_GUIDELINES.markdown](./TESTING_GUIDELINES.markdown) - تست‌نویسی
- [entities/user.entity.ts](../../src/entities/user.entity.ts) - موجودیت کاربر
- [entities/otp-code.entity.ts](../../src/entities/otp-code.entity.ts) - موجودیت کد OTP