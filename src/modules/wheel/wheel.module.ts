import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WheelController } from './wheel.controller';
import { WheelService } from './wheel.service';
import { User } from '../../entities/user.entity';
import { WheelSpin } from '../../entities/wheel-spin.entity';
import { WalletTransaction } from '../../entities/wallet-transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, WheelSpin, WalletTransaction]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'your-super-secret-jwt-key-here-change-in-production',
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [WheelController],
  providers: [WheelService],
  exports: [WheelService],
})
export class WheelModule {}
