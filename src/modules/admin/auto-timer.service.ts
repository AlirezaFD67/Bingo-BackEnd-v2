import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { GameRoom } from '../../entities/game-room.entity';
import { ActiveRoomGlobal } from '../../entities/active-room-global.entity';
import { Reservation } from '../../entities/reservation.entity';
import { Card } from '../../entities/card.entity';
import { UserReservedCard } from '../../entities/user-reserved-card.entity';
import { DrawnNumber } from '../../entities/drawn-number.entity';
import { User } from '../../entities/user.entity';
import { WalletTransaction } from '../../entities/wallet-transaction.entity';
import { RoomType } from '../../enums/room-type.enum';
import { RoomStatus } from '../../enums/room-status.enum';
import {
  TransactionType,
  TransactionStatus,
} from '../../enums/transaction-type.enum';

@Injectable()
export class AutoTimerService implements OnModuleInit {
  private readonly logger = new Logger(AutoTimerService.name);
  private timers: Map<number, NodeJS.Timeout> = new Map();

  constructor(
    @InjectRepository(GameRoom)
    private gameRoomRepository: Repository<GameRoom>,
    @InjectRepository(ActiveRoomGlobal)
    private activeRoomRepository: Repository<ActiveRoomGlobal>,
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(UserReservedCard)
    private userReservedCardRepository: Repository<UserReservedCard>,
    @InjectRepository(DrawnNumber)
    private drawnNumberRepository: Repository<DrawnNumber>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(WalletTransaction)
    private walletTransactionRepository: Repository<WalletTransaction>,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    this.logger.log('AutoTimerService initialized');
    await this.initializeActiveRooms();
  }

  /**
   * Initialize active rooms for all active GLOBAL rooms on startup
   */
  private async initializeActiveRooms() {
    try {
      const activeGlobalRooms = await this.gameRoomRepository.find({
        where: {
          isActive: true,
          type: RoomType.GLOBAL,
        },
      });

      this.logger.log(`Found ${activeGlobalRooms.length} active GLOBAL rooms`);

      for (const room of activeGlobalRooms) {
        await this.createActiveRoom(room);
      }
    } catch (error) {
      this.logger.error('Error initializing active rooms:', error);
    }
  }

  /**
   * Create a new active room entry and start its timer
   */
  private async createActiveRoom(gameRoom: GameRoom) {
    try {
      // Check if active room already exists
      const existingActiveRoom = await this.activeRoomRepository.findOne({
        where: {
          gameRoomId: gameRoom.id,
          status: RoomStatus.PENDING,
        },
      });

      if (existingActiveRoom) {
        this.logger.log(
          `Active room already exists for game room ${gameRoom.id}`,
        );
        this.startTimer(existingActiveRoom);
        return existingActiveRoom;
      }

      // Create new active room
      const activeRoom = this.activeRoomRepository.create({
        gameRoomId: gameRoom.id,
        remainingSeconds: gameRoom.startTimer, // Initialize with startTimer seconds
        status: RoomStatus.PENDING,
      });

      const savedActiveRoom = await this.activeRoomRepository.save(activeRoom);
      this.logger.log(
        `Created active room ${savedActiveRoom.id} for game room ${gameRoom.id}`,
      );

      // Start timer for this room
      this.startTimer(savedActiveRoom);
      return savedActiveRoom;
    } catch (error) {
      this.logger.error(
        `Error creating active room for game room ${gameRoom.id}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Start timer for an active room
   */
  private startTimer(activeRoom: ActiveRoomGlobal) {
    // Clear existing timer if any
    this.stopTimer(activeRoom.id);

    const timer = setInterval(async () => {
      await this.processTimerTick(activeRoom);
    }, 1000); // Every second

    this.timers.set(activeRoom.id, timer);
    this.logger.log(`Started timer for active room ${activeRoom.id}`);
  }

  /**
   * Stop timer for an active room
   */
  private stopTimer(activeRoomId: number) {
    const timer = this.timers.get(activeRoomId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(activeRoomId);
      this.logger.log(`Stopped timer for active room ${activeRoomId}`);
    }
  }

  /**
   * Process timer tick for an active room
   */
  private async processTimerTick(activeRoom: ActiveRoomGlobal) {
    try {
      const gameRoom = await this.gameRoomRepository.findOne({
        where: { id: activeRoom.gameRoomId },
      });

      if (!gameRoom) {
        this.logger.error(`Game room ${activeRoom.gameRoomId} not found`);
        this.stopTimer(activeRoom.id);
        return;
      }

      // Decrease remainingSeconds by 1 second
      activeRoom.remainingSeconds -= 1;

      // Update the database
      await this.activeRoomRepository.save(activeRoom);

      // Check if timer reached zero
      if (activeRoom.remainingSeconds <= 0) {
        // Timer reached zero, change status to started first
        activeRoom.status = RoomStatus.STARTED;
        activeRoom.updatedAt = new Date();
        await this.activeRoomRepository.save(activeRoom);

        this.logger.log(
          `Game started for active room ${activeRoom.id} - status changed to started`,
        );

        // Then check player count and proceed
        await this.checkPlayerCountAndProceed(activeRoom, gameRoom);
      }
    } catch (error) {
      this.logger.error(
        `Error processing timer tick for active room ${activeRoom.id}:`,
        error,
      );
    }
  }

  /**
   * Check player count and either start the game or reset timer
   */
  private async checkPlayerCountAndProceed(
    activeRoom: ActiveRoomGlobal,
    gameRoom: GameRoom,
  ) {
    try {
      // Count unique users who reserved cards for this active room
      const playerCount = await this.reservationRepository
        .createQueryBuilder('reservation')
        .where('reservation.activeRoomId = :activeRoomId', {
          activeRoomId: activeRoom.id,
        })
        .select('COUNT(DISTINCT reservation.userId)', 'count')
        .getRawOne();

      const uniquePlayerCount = parseInt(playerCount.count) || 0;

      this.logger.log(
        `Active room ${activeRoom.id}: ${uniquePlayerCount}/${gameRoom.minPlayers} players`,
      );

      if (uniquePlayerCount >= gameRoom.minPlayers) {
        // Enough players, proceed with game logic
        await this.proceedWithGame(activeRoom);
      } else {
        // Not enough players, reset timer and status
        await this.resetTimer(activeRoom, gameRoom);
      }
    } catch (error) {
      this.logger.error(
        `Error checking player count for active room ${activeRoom.id}:`,
        error,
      );
    }
  }

  /**
   * Proceed with game logic (status is already started)
   */
  private async proceedWithGame(activeRoom: ActiveRoomGlobal) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Status is already set to STARTED in processTimerTick
      activeRoom.updatedAt = new Date();
      await queryRunner.manager.save(ActiveRoomGlobal, activeRoom);

      this.stopTimer(activeRoom.id);
      this.logger.log(`Game proceeding for active room ${activeRoom.id}`);

      // پردازش تراکنش‌های خرید کارت
      await this.processCardPurchases(activeRoom, queryRunner);

      // توزیع کارت‌ها به کاربران
      await this.distributeCardsToUsers(activeRoom, queryRunner);

      await queryRunner.commitTransaction();

      // شروع خواندن اعداد بعد از 3 ثانیه مکث
      setTimeout(() => {
        this.startNumberDrawing(activeRoom);
      }, 3000);

      // ایجاد اتاق جدید pending برای همان gameRoomId
      await this.createNewPendingRoom(activeRoom.gameRoomId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error starting game for active room ${activeRoom.id}:`,
        error,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Create a new pending room for the same gameRoomId after starting a game
   */
  private async createNewPendingRoom(gameRoomId: number) {
    try {
      // دریافت اطلاعات game room
      const gameRoom = await this.gameRoomRepository.findOne({
        where: { id: gameRoomId },
      });

      if (!gameRoom) {
        this.logger.error(
          `Game room ${gameRoomId} not found for creating new pending room`,
        );
        return;
      }

      // بررسی اینکه آیا اتاق pending برای این gameRoomId وجود دارد یا نه
      const existingPendingRoom = await this.activeRoomRepository.findOne({
        where: {
          gameRoomId: gameRoomId,
          status: RoomStatus.PENDING,
        },
      });

      if (existingPendingRoom) {
        this.logger.log(
          `Pending room already exists for game room ${gameRoomId}, skipping creation`,
        );
        return;
      }

      // ایجاد اتاق جدید pending
      const newActiveRoom = this.activeRoomRepository.create({
        gameRoomId: gameRoomId,
        remainingSeconds: gameRoom.startTimer,
        status: RoomStatus.PENDING,
      });

      const savedActiveRoom =
        await this.activeRoomRepository.save(newActiveRoom);
      this.logger.log(
        `Created new pending room ${savedActiveRoom.id} for game room ${gameRoomId}`,
      );

      // شروع تایمر برای اتاق جدید
      this.startTimer(savedActiveRoom);
    } catch (error) {
      this.logger.error(
        `Error creating new pending room for game room ${gameRoomId}:`,
        error,
      );
    }
  }

  /**
   * پردازش تراکنش‌های خرید کارت برای کاربران (فقط برای روم‌های started)
   */
  private async processCardPurchases(
    activeRoom: ActiveRoomGlobal,
    queryRunner: any,
  ) {
    try {
      // دریافت تمام رزروهای مربوط به این اتاق که status آن‌ها PENDING است
      // چون فقط کارت‌های pending باید خریداری شوند
      const reservations = await queryRunner.manager.find(Reservation, {
        where: {
          activeRoomId: activeRoom.id,
          status: 'pending', // فقط رزروهای pending
        },
      });

      if (reservations.length === 0) {
        this.logger.log(
          `No pending reservations found for active room ${activeRoom.id}`,
        );
        return;
      }

      // گروه‌بندی رزروها بر اساس کاربر
      // هر کاربر یک تراکنش برای این activeRoomId خواهد داشت
      const userReservationsMap = new Map<number, number>();

      for (const reservation of reservations) {
        const currentAmount = userReservationsMap.get(reservation.userId) || 0;
        userReservationsMap.set(
          reservation.userId,
          currentAmount + Number(reservation.entryFee),
        );
      }

      // پردازش تراکنش برای هر کاربر (یک تراکنش برای هر کاربر در این activeRoomId)
      for (const [userId, totalAmount] of userReservationsMap) {
        // کسر مبلغ از walletBalance کاربر
        await queryRunner.manager.update(
          User,
          { id: userId },
          { walletBalance: () => `walletBalance - ${totalAmount}` },
        );

        // ثبت یک تراکنش خرید کارت برای این کاربر در این activeRoomId
        const transaction = queryRunner.manager.create(WalletTransaction, {
          userId,
          amount: totalAmount,
          type: TransactionType.CARD_PURCHASE,
          status: TransactionStatus.CONFIRMED,
          description: `خرید کارت برای اتاق ${activeRoom.id} (مجموع کارت‌های رزرو شده)`,
        });

        await queryRunner.manager.save(WalletTransaction, transaction);

        this.logger.log(
          `Processed card purchase for user ${userId} in active room ${activeRoom.id}: ${totalAmount} toman`,
        );
      }

      this.logger.log(
        `Card purchases processed for ${userReservationsMap.size} users in active room ${activeRoom.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing card purchases for active room ${activeRoom.id}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Reset timer for an active room
   */
  private async resetTimer(activeRoom: ActiveRoomGlobal, gameRoom: GameRoom) {
    try {
      activeRoom.remainingSeconds = gameRoom.startTimer; // Reset to original startTimer value
      activeRoom.status = RoomStatus.PENDING; // Reset status to pending
      activeRoom.updatedAt = new Date();
      await this.activeRoomRepository.save(activeRoom);

      this.logger.log(
        `Timer reset for active room ${activeRoom.id}, status changed to pending, restarting countdown`,
      );
    } catch (error) {
      this.logger.error(
        `Error resetting timer for active room ${activeRoom.id}:`,
        error,
      );
    }
  }

  /**
   * توزیع کارت‌ها به کاربران بر اساس تعداد کارت‌های رزرو شده
   */
  private async distributeCardsToUsers(
    activeRoom: ActiveRoomGlobal,
    queryRunner?: any,
  ) {
    try {
      // دریافت تمام رزروهای مربوط به این اتاق
      const reservations = queryRunner
        ? await queryRunner.manager.find(Reservation, {
            where: { activeRoomId: activeRoom.id },
          })
        : await this.reservationRepository.find({
            where: { activeRoomId: activeRoom.id },
          });

      this.logger.log(
        `Distributing cards for ${reservations.length} reservations in active room ${activeRoom.id}`,
      );

      // دریافت تمام کارت‌های موجود
      const allCards = queryRunner
        ? await queryRunner.manager.find(Card)
        : await this.cardRepository.find();

      if (allCards.length === 0) {
        this.logger.warn('No cards available for distribution');
        return;
      }

      // مخلوط کردن کارت‌ها
      const shuffledCards = [...allCards].sort(() => Math.random() - 0.5);

      let cardIndex = 0;

      // توزیع کارت‌ها به هر کاربر
      for (const reservation of reservations) {
        const cardsToDistribute = Math.min(
          reservation.cardCount,
          shuffledCards.length - cardIndex,
        );

        for (let i = 0; i < cardsToDistribute; i++) {
          const card = shuffledCards[cardIndex + i];

          // ایجاد رکورد user_reserved_cards
          const userReservedCard = queryRunner
            ? queryRunner.manager.create(UserReservedCard, {
                userId: reservation.userId,
                activeRoomId: activeRoom.id,
                cardId: card.id,
              })
            : this.userReservedCardRepository.create({
                userId: reservation.userId,
                activeRoomId: activeRoom.id,
                cardId: card.id,
              });

          if (queryRunner) {
            await queryRunner.manager.save(UserReservedCard, userReservedCard);
          } else {
            await this.userReservedCardRepository.save(userReservedCard);
          }
        }

        cardIndex += cardsToDistribute;
        this.logger.log(
          `Distributed ${cardsToDistribute} cards to user ${reservation.userId}`,
        );
      }

      this.logger.log(
        `Card distribution completed for active room ${activeRoom.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Error distributing cards for active room ${activeRoom.id}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * شروع خواندن اعداد (هر 3 ثانیه یک عدد)
   */
  private startNumberDrawing(activeRoom: ActiveRoomGlobal) {
    this.logger.log(`Starting number drawing for active room ${activeRoom.id}`);

    // آرایه اعداد از 1 تا 90
    const availableNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
    const drawnNumbers: number[] = [];

    const numberDrawingInterval = setInterval(async () => {
      try {
        // اگر تمام اعداد خوانده شده، توقف
        if (drawnNumbers.length >= 90) {
          clearInterval(numberDrawingInterval);
          this.logger.log(`All numbers drawn for active room ${activeRoom.id}`);
          return;
        }

        // انتخاب عدد تصادفی از اعداد باقی‌مانده
        const remainingNumbers = availableNumbers.filter(
          (num) => !drawnNumbers.includes(num),
        );
        const randomIndex = Math.floor(Math.random() * remainingNumbers.length);
        const drawnNumber = remainingNumbers[randomIndex];

        // ذخیره عدد خوانده شده
        const drawnNumberEntity = this.drawnNumberRepository.create({
          activeRoomId: activeRoom.id,
          number: drawnNumber,
        });

        await this.drawnNumberRepository.save(drawnNumberEntity);
        drawnNumbers.push(drawnNumber);

        this.logger.log(
          `Drew number ${drawnNumber} for active room ${activeRoom.id}`,
        );
      } catch (error) {
        this.logger.error(
          `Error drawing number for active room ${activeRoom.id}:`,
          error,
        );
        clearInterval(numberDrawingInterval);
      }
    }, 3000); // هر 3 ثانیه
  }

  /**
   * Stop all timers (useful for shutdown)
   */
  onModuleDestroy() {
    this.timers.forEach((timer, activeRoomId) => {
      clearInterval(timer);
      this.logger.log(`Stopped timer for active room ${activeRoomId}`);
    });
    this.timers.clear();
  }
}
