import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  async sendOtp(phoneNumber: string, code: string): Promise<void> {
    // TODO: پیاده‌سازی ارسال SMS واقعی
    // فعلاً فقط لاگ می‌کنیم
    this.logger.log(`Sending OTP ${code} to phone number ${phoneNumber}`);

    // شبیه‌سازی تاخیر ارسال SMS
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

