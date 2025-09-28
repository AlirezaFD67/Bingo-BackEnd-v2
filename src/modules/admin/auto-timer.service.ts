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
  private sequentialDrawingRooms: Set<number> = new Set();
  private cancelledRooms: Set<number> = new Set();
  private roomTimeouts: Map<number, NodeJS.Timeout> = new Map();

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
    
    // پاک‌سازی اعداد تکراری در startup
    await this.cleanupAllDuplicateNumbers();
    
    // بازیابی روم‌های فعال بعد از restart
    await this.recoverActiveRooms();
    
    // شروع تایمرهای جدید
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
   * Process timer tick for an active room - Simplified version
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

      // Decrease remainingSeconds by 1 second in memory
      activeRoom.remainingSeconds -= 1;

      // Simple UPDATE in database
      await this.activeRoomRepository.update(
        { id: activeRoom.id },
        { 
          remainingSeconds: () => `"remainingSeconds" - 1`,
          updatedAt: new Date()
        },
      );

      this.logger.debug(
        `Room ${activeRoom.id} tick: ${activeRoom.remainingSeconds}s remaining`,
      );

      // If timer reached zero
      if (activeRoom.remainingSeconds <= 0) {
        await this.stopTimer(activeRoom.id);
        await this.startNumberDrawing(activeRoom);
        return;
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
      setTimeout(async () => {
        await this.startNumberDrawing(activeRoom);
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
   * شروع خواندن اعداد (هر 3 ثانیه یک عدد) - نسخه ساده
   */
  private async startNumberDrawing(activeRoom: ActiveRoomGlobal) {
    this.logger.log(`Starting number drawing for active room ${activeRoom.id}`);

    // بررسی اینکه آیا قبلاً number drawing برای این activeRoom وجود دارد
    if (this.sequentialDrawingRooms.has(activeRoom.id)) {
      this.logger.warn(`Number drawing already started for active room ${activeRoom.id}, skipping`);
      return;
    }

    // توقف number drawing قبلی اگر وجود دارد
    this.stopNumberDrawing(activeRoom.id);

    // شروع حلقه متوالی ساده
    this.startSequentialNumberDrawing(activeRoom);
  }

  /**
   * حلقه متوالی برای خواندن اعداد - نسخه با setInterval واقعی
   */
  private startSequentialNumberDrawing(activeRoom: ActiveRoomGlobal) {
    const interval = 3000; // 3 ثانیه
    this.logger.log(`Starting sequential number drawing for active room ${activeRoom.id}`);

    // جلوگیری از شروع دوباره برای همان روم
    if (this.sequentialDrawingRooms.has(activeRoom.id)) return;
    this.sequentialDrawingRooms.add(activeRoom.id);

    // آرایه اعداد 1 تا 90
    const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);

    // خواندن اعداد قبلی از دیتابیس
    this.drawnNumberRepository.find({
      where: { activeRoomId: activeRoom.id },
      select: ['number'],
    }).then(existing => {
      const drawnNumbers = new Set(existing.map(d => d.number));
      let remainingNumbers = allNumbers.filter(n => !drawnNumbers.has(n));

      const drawTick = () => {
        if (this.cancelledRooms.has(activeRoom.id)) {
          this.logger.log(`Number drawing cancelled for room ${activeRoom.id}`);
          clearInterval(timer);
          this.sequentialDrawingRooms.delete(activeRoom.id);
          return;
        }

        if (remainingNumbers.length === 0) {
          this.logger.log(`All numbers drawn for active room ${activeRoom.id}`);
          clearInterval(timer);
          this.sequentialDrawingRooms.delete(activeRoom.id);
          return;
        }

        // انتخاب عدد تصادفی
        const idx = Math.floor(Math.random() * remainingNumbers.length);
        const numberToDraw = remainingNumbers[idx];

        // حذف عدد از آرایه باقی‌مانده
        remainingNumbers.splice(idx, 1);

        // ثبت async روی دیتابیس بدون await مستقیم روی تایمر
        const entity = this.drawnNumberRepository.create({
          activeRoomId: activeRoom.id,
          number: numberToDraw,
        });
        this.drawnNumberRepository.save(entity)
          .then(() => this.logger.log(`Drew number ${numberToDraw} for room ${activeRoom.id}`))
          .catch(err => this.logger.error(`Error saving drawn number: ${err}`));
      };

      // تایمر واقعی 3 ثانیه‌ای
      const timer = setInterval(drawTick, interval);
      this.roomTimeouts.set(activeRoom.id, timer);
    }).catch(error => {
      this.logger.error(`Error loading existing numbers for room ${activeRoom.id}:`, error);
      this.sequentialDrawingRooms.delete(activeRoom.id);
    });
  }

  /**
   * تبدیل string به BigInt برای PostgreSQL advisory lock
   */
  private hashStringToBigInt(str: string): bigint {
    let hash = BigInt(0);
    for (let i = 0; i < str.length; i++) {
      const char = BigInt(str.charCodeAt(i));
      hash = ((hash << BigInt(5)) - hash) + char;
    }
    // محدود به 63 بیت مثبت برای PostgreSQL
    return hash & BigInt(0x7FFFFFFFFFFFFFFF);
  }

  /**
   * Stop number drawing for a specific active room - Simplified version
   */
  private stopNumberDrawing(activeRoomId: number) {
    // توقف sequential drawing
    if (this.sequentialDrawingRooms.has(activeRoomId)) {
      this.sequentialDrawingRooms.delete(activeRoomId);
      this.cancelledRooms.add(activeRoomId); // علامت‌گذاری برای توقف
      
      // پاک‌سازی interval/timeout
      const timer = this.roomTimeouts.get(activeRoomId);
      if (timer) {
        clearInterval(timer);
        this.roomTimeouts.delete(activeRoomId);
      }
      
      this.logger.log(`Stopped sequential number drawing for active room ${activeRoomId}`);
    }
  }

  /**
   * Clean up duplicate numbers for a specific active room
   */
  private async cleanupDuplicateNumbers(activeRoomId: number) {
    try {
      // دریافت تمام اعداد برای این activeRoom
      const allNumbers = await this.drawnNumberRepository.find({
        where: { activeRoomId },
        order: { createdAt: 'ASC' },
      });

      // پیدا کردن اعداد تکراری
      const seenNumbers = new Set<number>();
      const duplicates: number[] = [];

      for (const record of allNumbers) {
        if (seenNumbers.has(record.number)) {
          duplicates.push(record.id);
        } else {
          seenNumbers.add(record.number);
        }
      }

      // حذف اعداد تکراری (حفظ اولین occurrence)
      if (duplicates.length > 0) {
        await this.drawnNumberRepository.delete(duplicates);
        this.logger.log(`Cleaned up ${duplicates.length} duplicate numbers for active room ${activeRoomId}`);
      }
    } catch (error) {
      this.logger.error(`Error cleaning up duplicate numbers for active room ${activeRoomId}:`, error);
    }
  }

  /**
   * Clean up duplicate numbers for all active rooms
   */
  private async cleanupAllDuplicateNumbers() {
    try {
      this.logger.log('Starting cleanup of duplicate numbers for all active rooms...');
      
      // پیدا کردن تمام روم‌های فعال
      const activeRooms = await this.activeRoomRepository.find({
        where: { status: RoomStatus.STARTED },
        select: ['id'],
      });

      for (const room of activeRooms) {
        await this.cleanupDuplicateNumbers(room.id);
      }

      this.logger.log(`Cleanup completed for ${activeRooms.length} active rooms`);
    } catch (error) {
      this.logger.error('Error during global cleanup:', error);
    }
  }

  /**
   * دریافت وضعیت تمام روم‌های فعال
   */
  getActiveRoomsStatus() {
    return {
      activeTimers: this.timers.size,
      activeSequentialDrawing: this.sequentialDrawingRooms.size,
      cancelledRooms: this.cancelledRooms.size,
      sequentialRooms: Array.from(this.sequentialDrawingRooms),
      cancelledRoomsList: Array.from(this.cancelledRooms),
    };
  }

  /**
   * Health check برای monitoring
   */
  async healthCheck() {
    try {
      const status = this.getActiveRoomsStatus();
      
      // بررسی روم‌های فعال در دیتابیس
      const activeRoomsInDb = await this.activeRoomRepository.count({
        where: { status: RoomStatus.STARTED },
      });

      // اطلاعات monitoring برای هر روم (ساده‌شده)
      const roomMonitoring = Array.from(this.sequentialDrawingRooms).map(roomId => {
        return {
          roomId,
          status: 'active',
        };
      });

      return {
        ...status,
        activeRoomsInDatabase: activeRoomsInDb,
        roomMonitoring,
        isHealthy: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return {
        isHealthy: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * بررسی وضعیت Lock برای یک روم خاص
   */
  async checkRoomLockStatus(activeRoomId: number) {
    try {
      const lockKey = this.hashStringToBigInt(`number_drawing_${activeRoomId}`);
      const instanceLock = this.hashStringToBigInt(`instance_lock_${activeRoomId}`);
      
      // بررسی Lock های فعال
      const lockStatus = await this.dataSource.query(
        'SELECT pg_try_advisory_lock($1) as number_lock, pg_try_advisory_lock($2) as instance_lock',
        [lockKey.toString(), instanceLock.toString()]
      );

      // آزاد کردن lock های تست
      await this.dataSource.query(
        'SELECT pg_advisory_unlock($1), pg_advisory_unlock($2)',
        [lockKey.toString(), instanceLock.toString()]
      );

      return {
        activeRoomId,
        numberLockAvailable: lockStatus[0].number_lock,
        instanceLockAvailable: lockStatus[0].instance_lock,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error checking lock status for room ${activeRoomId}:`, error);
      return {
        activeRoomId,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Force unlock برای یک روم خاص (فقط برای emergency)
   */
  async forceUnlockRoom(activeRoomId: number) {
    try {
      const lockKey = this.hashStringToBigInt(`number_drawing_${activeRoomId}`);
      const instanceLock = this.hashStringToBigInt(`instance_lock_${activeRoomId}`);
      
      // Force unlock
      await this.dataSource.query(
        'SELECT pg_advisory_unlock_all()',
        []
      );

      this.logger.warn(`Force unlocked all locks for room ${activeRoomId}`);
      
      return {
        activeRoomId,
        unlocked: true,
        timestamp: new Date().toISOString(),
      };
      } catch (error) {
      this.logger.error(`Error force unlocking room ${activeRoomId}:`, error);
      return {
        activeRoomId,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * بازیابی وضعیت روم‌های فعال بعد از restart
   */
  async recoverActiveRooms() {
    try {
      this.logger.log('Starting recovery of active rooms...');
      
      // پیدا کردن روم‌های فعال که در وضعیت STARTED هستند
      const activeRooms = await this.activeRoomRepository.find({
        where: { status: RoomStatus.STARTED },
        relations: ['gameRoom'],
      });

      for (const activeRoom of activeRooms) {
        // بررسی Multi-Instance: فقط یک instance باید number drawing را مدیریت کند
        const instanceLock = this.hashStringToBigInt(`instance_lock_${activeRoom.id}`);
        const lockResult = await this.dataSource.query(
          'SELECT pg_try_advisory_lock($1) as locked',
          [instanceLock.toString()]
        );

        if (!lockResult[0].locked) {
          this.logger.warn(`Another instance is managing room ${activeRoom.id}, skipping`);
          continue;
        }

        try {
          this.logger.log(`Recovering active room ${activeRoom.id}`);
          
          // بررسی اینکه آیا قبلاً اعداد خوانده شده
          const drawnNumbers = await this.drawnNumberRepository.find({
            where: { activeRoomId: activeRoom.id },
            select: ['number'],
          });

          // اگر کمتر از 90 عدد خوانده شده، ادامه دادن
          if (drawnNumbers.length < 90) {
            await this.startNumberDrawing(activeRoom);
            this.logger.log(`Recovered number drawing for active room ${activeRoom.id}`);
          } else {
            this.logger.log(`Active room ${activeRoom.id} already has all numbers drawn`);
          }
        } finally {
          // آزاد کردن instance lock
          await this.dataSource.query(
            'SELECT pg_advisory_unlock($1)',
            [instanceLock.toString()]
          );
        }
      }

      this.logger.log(`Recovery completed for ${activeRooms.length} active rooms`);
    } catch (error) {
      this.logger.error('Error during recovery:', error);
    }
  }

  /**
   * Stop all timers and number drawing intervals (useful for shutdown) - Simplified
   */
  onModuleDestroy() {
    // Stop all timers
    this.timers.forEach((timer, activeRoomId) => {
      clearInterval(timer);
      this.logger.log(`Stopped timer for active room ${activeRoomId}`);
    });
    this.timers.clear();

    // Stop all sequential drawing
    this.sequentialDrawingRooms.forEach((activeRoomId) => {
      this.cancelledRooms.add(activeRoomId);
      this.logger.log(`Stopped sequential number drawing for active room ${activeRoomId}`);
    });
    this.sequentialDrawingRooms.clear();
    this.cancelledRooms.clear();
    
    // Stop all room timeouts/intervals
    this.roomTimeouts.forEach((timer, activeRoomId) => {
      clearInterval(timer);
      this.logger.log(`Stopped timer for active room ${activeRoomId}`);
    });
    this.roomTimeouts.clear();
    
    this.logger.log(`Module destroyed - All timers and number drawing stopped`);
  }
}
