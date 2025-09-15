import { Injectable } from '@nestjs/common';
import { logger } from '../../common/utils/logger';

@Injectable()
export class SmsService {
  async sendOtp(phoneNumber: string, code: string): Promise<void> {
    // TODO: پیاده‌سازی ارسال SMS واقعی
    // فعلاً فقط لاگ می‌کنیم
    logger.info(`Sending OTP ${code} to phone number ${phoneNumber}`, {
      service: 'SmsService',
      action: 'sendOtp',
      phoneNumber: phoneNumber.replace(/(\d{4})\d{3}(\d{4})/, '$1***$2'), // Mask phone number
    });

    // شبیه‌سازی تاخیر ارسال SMS
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

