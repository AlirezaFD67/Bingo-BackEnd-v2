import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { User } from '../../entities/user.entity';
import { WalletTransaction } from '../../entities/wallet-transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, WalletTransaction]),
    JwtModule.register({}),
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
