import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSettings } from '../../entities/app-settings.entity';
import { UpdateReferralRewardConfigDto } from './dto/update-referral-reward-config.dto';
import { ReferralRewardConfigResponseDto } from './dto/referral-reward-config-response.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(AppSettings)
    private readonly appSettingsRepository: Repository<AppSettings>,
  ) {}

  async updateReferralRewardConfig(
    dto: UpdateReferralRewardConfigDto,
  ): Promise<ReferralRewardConfigResponseDto> {
    const setting = await this.appSettingsRepository.findOne({
      where: { key: 'referral_reward_amount' },
    });

    if (!setting) {
      throw new NotFoundException('تنظیمات جایزه معرفی یافت نشد');
    }

    setting.value = dto.referralRewardAmount.toString();
    await this.appSettingsRepository.save(setting);

    return {
      referralRewardAmount: dto.referralRewardAmount,
      message: 'تنظیمات جایزه معرفی با موفقیت به‌روزرسانی شد',
    };
  }

  async getReferralRewardConfig(): Promise<{ referralRewardAmount: number }> {
    const setting = await this.appSettingsRepository.findOne({
      where: { key: 'referral_reward_amount' },
    });

    if (!setting) {
      throw new NotFoundException('تنظیمات جایزه معرفی یافت نشد');
    }

    return {
      referralRewardAmount: parseInt(setting.value, 10),
    };
  }
}
