import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { CardTransactionService } from './card-transaction.service';
import { User } from '../../entities/user.entity';
import { WalletTransaction } from '../../entities/wallet-transaction.entity';
import { UserReservedCard } from '../../entities/user-reserved-card.entity';
import { Reservation } from '../../entities/reservation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      WalletTransaction,
      UserReservedCard,
      Reservation,
    ]),
    JwtModule.register({}),
  ],
  controllers: [WalletController],
  providers: [WalletService, CardTransactionService],
  exports: [WalletService, CardTransactionService],
})
export class WalletModule {}
