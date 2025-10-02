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
import { RoomsService } from '../socket/rooms.service';
import { SocketScheduler } from '../../utils/SocketScheduler';

/**
 * Interface برای State مدیریت روم در حافظه
 */
interface RoomState {
  activeRoomId: number;
  gameRoomId: number;
  status: RoomStatus;
  remainingSeconds: number;
  // برای Number Drawing
  drawnNumbers: Set<number>;
  remainingNumbers: number[];
  lastDrawTime: number; // timestamp آخرین عدد کشیده شده
  drawInterval: number; // فاصله زمانی بین اعداد (میلی‌ثانیه)
  // برای Monitoring
  lastSyncTime: number;
  errorCount: number;
  lastError?: string;
}

@Injectable()
export class AutoTimerService implements OnModuleInit {
  private readonly logger = new Logger(AutoTimerService.name);
  
  // State Management در حافظه
  private roomStates: Map<number, RoomState> = new Map();
  
  // استفاده از SocketScheduler برای تایمر سراسری
  private scheduler = SocketScheduler.getInstance();
  private readonly MAIN_LOOP_INTERVAL = 1000; // هر 1 ثانیه
  private readonly SYNC_INTERVAL = 5000; // هر 5 ثانیه
  private readonly NUMBER_DRAW_INTERVAL = 3000; // هر 3 ثانیه

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
    private readonly roomsService: RoomsService,
  ) {}

  async onModuleInit() {
    this.logger.log('AutoTimerService initialized');
    
    // پاک‌سازی اعداد تکراری در startup
    await this.cleanupAllDuplicateNumbers();
    
    // بازیابی روم‌های فعال بعد از restart
    await this.recoverActiveRooms();
    
    // ایجاد روم‌های pending برای game room های فعال
    await this.ensurePendingRooms();
    
    // ثبت Jobها در SocketScheduler
    this.registerSchedulerJobs();
    
    this.logger.log('AutoTimerService jobs registered with SocketScheduler');
  }

  /**
   * ثبت Jobها در SocketScheduler
   */
  private registerSchedulerJobs() {
    // Job 1: Loop اصلی - پردازش همه روم‌ها
    this.scheduler.addJob('autoTimerMainLoop', this.MAIN_LOOP_INTERVAL, async () => {
      await this.processMainLoop();
    }, { avoidCatchUp: true });

    // Job 2: Sync با دیتابیس
    this.scheduler.addJob('autoTimerSync', this.SYNC_INTERVAL, async () => {
      await this.syncStateToDatabase();
    }, { avoidCatchUp: true });

    this.logger.log('AutoTimerService jobs registered with SocketScheduler');
  }

  /**
   * Loop اصلی - پردازش همه روم‌ها
   */
  private async processMainLoop() {
    const now = Date.now();

    for (const [activeRoomId, roomState] of this.roomStates.entries()) {
      try {
        // پردازش تایمر روم
        if (roomState.status === RoomStatus.PENDING) {
          await this.processRoomTimer(roomState);
        }
        
        // پردازش Number Drawing
        if (roomState.status === RoomStatus.STARTED) {
          await this.processNumberDrawing(roomState, now);
      }
    } catch (error) {
        this.handleRoomError(roomState, error);
      }
    }
  }

  /**
   * پردازش تایمر یک روم
   */
  private async processRoomTimer(roomState: RoomState) {
    roomState.remainingSeconds -= 1;

    if (roomState.remainingSeconds <= 0) {
      await this.handleTimerExpired(roomState);
    }
  }

  /**
   * پردازش Number Drawing برای یک روم
   */
  private async processNumberDrawing(roomState: RoomState, now: number) {
    // بررسی اینکه آیا زمان کشیدن عدد جدید رسیده
    if (now - roomState.lastDrawTime < roomState.drawInterval) {
      return;
    }

    // بررسی اینکه آیا عدد باقی مانده است
    if (roomState.remainingNumbers.length === 0) {
      this.logger.log(`All numbers drawn for room ${roomState.activeRoomId}`);
      return;
    }

    // انتخاب عدد تصادفی
    const idx = Math.floor(Math.random() * roomState.remainingNumbers.length);
    const numberToDraw = roomState.remainingNumbers[idx];

    // حذف از آرایه و اضافه به Set
    roomState.remainingNumbers.splice(idx, 1);
    roomState.drawnNumbers.add(numberToDraw);
    roomState.lastDrawTime = now;

    // ثبت فوری در دیتابیس (داده critical)
    try {
      const entity = this.drawnNumberRepository.create({
        activeRoomId: roomState.activeRoomId,
        number: numberToDraw,
      });
      await this.drawnNumberRepository.save(entity);
      
      this.logger.log(
        `Drew number ${numberToDraw} for room ${roomState.activeRoomId} (${roomState.drawnNumbers.size}/90)`,
      );

      // پس از ذخیره عدد، تشخیص برنده‌ها را اجرا کن
      // 1) برنده خطی (اگر قبلاً تعیین نشده باشد)
      try {
        await this.roomsService.checkLineWinners(roomState.activeRoomId);
      } catch (e) {
        this.logger.error(`Error checking line winners: ${e?.message || e}`);
      }

      // 2) برنده کلی - در صورت یافتن، بازی را پایان بده و از کشیدن اعداد بیشتر خودداری کن
      try {
        const hasFullWinners = await this.roomsService.checkFullWinners(
          roomState.activeRoomId,
        );
        if (hasFullWinners) {
          // به‌روزرسانی وضعیت State در حافظه
          roomState.status = RoomStatus.FINISHED;
          this.logger.log(
            `Game finished for room ${roomState.activeRoomId} due to full winner(s).`,
          );
          return; // جلوی کشیدن اعداد بیشتر را بگیر
        }
      } catch (e) {
        this.logger.error(`Error checking full winners: ${e?.message || e}`);
      }
    } catch (error) {
      // در صورت خطا، عدد را برگردان
      roomState.drawnNumbers.delete(numberToDraw);
      roomState.remainingNumbers.splice(idx, 0, numberToDraw);
      this.logger.error(`Error saving drawn number: ${error.message}`);
      throw error;
    }
  }


  /**
   * Sync کردن State حافظه با دیتابیس
   */
  private async syncStateToDatabase() {
    const syncStartTime = Date.now();
    let syncedCount = 0;

    for (const [activeRoomId, roomState] of this.roomStates.entries()) {
      try {
        await this.activeRoomRepository.update(
          { id: activeRoomId },
          {
            remainingSeconds: roomState.remainingSeconds,
            status: roomState.status,
            updatedAt: new Date(),
          },
        );
        
        roomState.lastSyncTime = Date.now();
        syncedCount++;
      } catch (error) {
        this.logger.error(`Error syncing room ${activeRoomId}: ${error.message}`);
      }
    }

    const syncDuration = Date.now() - syncStartTime;
    this.logger.debug(
      `Synced ${syncedCount} rooms to database in ${syncDuration}ms`,
    );
  }

  /**
   * مدیریت خطاهای روم - Safe-Stop
   */
  private handleRoomError(roomState: RoomState, error: any) {
    roomState.errorCount++;
    roomState.lastError = error.message;

    this.logger.error(
      `Error in room ${roomState.activeRoomId} (error count: ${roomState.errorCount}): ${error.message}`,
      error.stack,
    );

    // اگر خطا بیش از حد تکرار شد، روم را به حالت DEACTIVATED ببر
    if (roomState.errorCount >= 3) {
      roomState.status = RoomStatus.DEACTIVATED;
      this.logger.error(
        `Room ${roomState.activeRoomId} moved to DEACTIVATED state due to repeated errors`,
      );
      
      // Sync فوری با دیتابیس
      this.activeRoomRepository
        .update(
          { id: roomState.activeRoomId },
          { status: RoomStatus.DEACTIVATED, updatedAt: new Date() },
        )
        .catch((err) =>
          this.logger.error(`Failed to update room status in DB: ${err.message}`),
        );
    }
  }

  /**
   * مدیریت انقضای تایمر
   */
  private async handleTimerExpired(roomState: RoomState) {
    try {
      const gameRoom = await this.gameRoomRepository.findOne({
        where: { id: roomState.gameRoomId },
      });

      if (!gameRoom) {
        this.logger.error(`Game room ${roomState.gameRoomId} not found`);
        this.roomStates.delete(roomState.activeRoomId);
        return;
      }

      await this.checkPlayerCountAndProceed(roomState, gameRoom);
    } catch (error) {
      this.handleRoomError(roomState, error);
    }
  }

  /**
   * بررسی تعداد بازیکنان و شروع یا ریست بازی
   */
  private async checkPlayerCountAndProceed(
    roomState: RoomState,
    gameRoom: GameRoom,
  ) {
    try {
      // شمارش بازیکنان
      const playerCount = await this.reservationRepository
        .createQueryBuilder('reservation')
        .where('reservation.activeRoomId = :activeRoomId', {
          activeRoomId: roomState.activeRoomId,
        })
        .select('COUNT(DISTINCT reservation.userId)', 'count')
        .getRawOne();

      const uniquePlayerCount = parseInt(playerCount.count) || 0;

      this.logger.log(
        `Room ${roomState.activeRoomId}: ${uniquePlayerCount}/${gameRoom.minPlayers} players`,
      );

      if (uniquePlayerCount >= gameRoom.minPlayers) {
        await this.startGame(roomState);
      } else {
        await this.resetRoomTimer(roomState, gameRoom);
      }
    } catch (error) {
      this.handleRoomError(roomState, error);
    }
  }

  /**
   * شروع بازی
   */
  private async startGame(roomState: RoomState) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // تغییر وضعیت به STARTED
      roomState.status = RoomStatus.STARTED;
      roomState.lastDrawTime = Date.now();
      
      // آماده‌سازی Number Drawing
      const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
      roomState.remainingNumbers = [...allNumbers];
      roomState.drawnNumbers = new Set();

      // ثبت در دیتابیس
      await queryRunner.manager.update(
        ActiveRoomGlobal,
        { id: roomState.activeRoomId },
        { status: RoomStatus.STARTED, updatedAt: new Date() },
      );

      // پردازش خرید کارت‌ها
      await this.processCardPurchases(roomState.activeRoomId, queryRunner);

      // توزیع کارت‌ها
      await this.distributeCardsToUsers(roomState.activeRoomId, queryRunner);

      await queryRunner.commitTransaction();

      this.logger.log(`Game started for room ${roomState.activeRoomId}`);

      // ایجاد روم pending جدید
      await this.createNewPendingRoom(roomState.gameRoomId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleRoomError(roomState, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * ریست تایمر روم
   */
  private async resetRoomTimer(roomState: RoomState, gameRoom: GameRoom) {
    roomState.remainingSeconds = gameRoom.startTimer;
    roomState.status = RoomStatus.PENDING;

    this.logger.log(
      `Timer reset for room ${roomState.activeRoomId}, restarting countdown`,
    );
  }

  /**
   * اضافه کردن روم جدید به State
   */
  private addRoomToState(activeRoom: ActiveRoomGlobal, gameRoom: GameRoom) {
    const roomState: RoomState = {
      activeRoomId: activeRoom.id,
      gameRoomId: activeRoom.gameRoomId,
      status: activeRoom.status,
      remainingSeconds: activeRoom.remainingSeconds,
      drawnNumbers: new Set(),
      remainingNumbers: [],
      lastDrawTime: 0,
      drawInterval: this.NUMBER_DRAW_INTERVAL,
      lastSyncTime: Date.now(),
      errorCount: 0,
    };

    this.roomStates.set(activeRoom.id, roomState);
    this.logger.log(`Added room ${activeRoom.id} to state management`);
  }

  /**
   * Ensure pending rooms exist for all active game rooms (like old project)
   */
  private async ensurePendingRooms() {
    try {
      const activeGameRooms = await this.gameRoomRepository.find({
        where: {
          isActive: true,
          type: RoomType.GLOBAL,
        },
      });

      this.logger.log(`Found ${activeGameRooms.length} active GLOBAL rooms`);

      for (const gameRoom of activeGameRooms) {
        // بررسی اینکه آیا روم pending برای این gameRoom وجود دارد یا نه
        const existingPendingRoom = await this.activeRoomRepository.findOne({
          where: {
            gameRoomId: gameRoom.id,
            status: RoomStatus.PENDING,
          },
        });

        if (!existingPendingRoom) {
          // ایجاد روم pending جدید
          const newActiveRoom = this.activeRoomRepository.create({
            gameRoomId: gameRoom.id,
            remainingSeconds: gameRoom.startTimer,
            status: RoomStatus.PENDING,
          });

          const savedActiveRoom = await this.activeRoomRepository.save(newActiveRoom);
          this.logger.log(`Created pending room ${savedActiveRoom.id} for game room ${gameRoom.id}`);
          
          // اضافه به State
          this.addRoomToState(savedActiveRoom, gameRoom);
        } else {
          this.logger.log(`Pending room already exists for game room ${gameRoom.id}`);
          // اضافه به State
          this.addRoomToState(existingPendingRoom, gameRoom);
        }
      }
    } catch (error) {
      this.logger.error('Error ensuring pending rooms:', error);
    }
  }

  /**
   * ایجاد روم pending جدید برای همان gameRoomId
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

      // اضافه به State
      this.addRoomToState(savedActiveRoom, gameRoom);
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
    activeRoomId: number,
    queryRunner: any,
  ) {
    try {
      // دریافت تمام رزروهای مربوط به این اتاق که status آن‌ها PENDING است
      // چون فقط کارت‌های pending باید خریداری شوند
      const reservations = await queryRunner.manager.find(Reservation, {
        where: {
          activeRoomId: activeRoomId,
          status: 'pending', // فقط رزروهای pending
        },
      });

      if (reservations.length === 0) {
        this.logger.log(
          `No pending reservations found for active room ${activeRoomId}`,
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
          description: `خرید کارت برای اتاق ${activeRoomId} (مجموع کارت‌های رزرو شده)`,
        });

        await queryRunner.manager.save(WalletTransaction, transaction);

        this.logger.log(
          `Processed card purchase for user ${userId} in active room ${activeRoomId}: ${totalAmount} toman`,
        );
      }

      this.logger.log(
        `Card purchases processed for ${userReservationsMap.size} users in active room ${activeRoomId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing card purchases for active room ${activeRoomId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * توزیع کارت‌ها به کاربران بر اساس تعداد کارت‌های رزرو شده
   */
  private async distributeCardsToUsers(
    activeRoomId: number,
    queryRunner?: any,
  ) {
    try {
      // دریافت تمام رزروهای مربوط به این اتاق
      const reservations = queryRunner
        ? await queryRunner.manager.find(Reservation, {
            where: { activeRoomId: activeRoomId },
          })
        : await this.reservationRepository.find({
            where: { activeRoomId: activeRoomId },
          });

      this.logger.log(
        `Distributing cards for ${reservations.length} reservations in active room ${activeRoomId}`,
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
                activeRoomId: activeRoomId,
                cardId: card.id,
              })
            : this.userReservedCardRepository.create({
                userId: reservation.userId,
                activeRoomId: activeRoomId,
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
        `Card distribution completed for active room ${activeRoomId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error distributing cards for active room ${activeRoomId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * تبدیل string به BigInt برای PostgreSQL advisory lock
   */
  private hashStringToBigInt(str: string): bigint {
    // استفاده از hash ساده‌تر که همیشه در محدوده PostgreSQL قرار دارد
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // تبدیل به BigInt مثبت
    return BigInt(Math.abs(hash));
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
      const roomStartLock = this.hashStringToBigInt(`room_start_${activeRoomId}`);
      
      // Force unlock specific room locks only
      const unlockResults = await this.dataSource.query(
        'SELECT pg_advisory_unlock($1) as number_lock, pg_advisory_unlock($2) as instance_lock, pg_advisory_unlock($3) as room_start_lock',
        [lockKey.toString(), instanceLock.toString(), roomStartLock.toString()]
      );

      this.logger.warn(`Force unlocked specific locks for room ${activeRoomId}:`, unlockResults[0]);
      
      return {
        activeRoomId,
        unlocked: true,
        unlockResults: unlockResults[0],
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
   * بازیابی وضعیت روم‌های فعال بعد از restart - با State Management
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
        this.logger.log(`Recovering active room ${activeRoom.id}`);
        
        // خواندن اعداد کشیده شده از دیتابیس
        const drawnNumbersFromDb = await this.drawnNumberRepository.find({
          where: { activeRoomId: activeRoom.id },
          select: ['number'],
        });

        const drawnNumbers = new Set(drawnNumbersFromDb.map(d => d.number));
        const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
        const remainingNumbers = allNumbers.filter(n => !drawnNumbers.has(n));

        // ایجاد State روم در حافظه
        const roomState: RoomState = {
          activeRoomId: activeRoom.id,
          gameRoomId: activeRoom.gameRoomId,
          status: RoomStatus.STARTED,
          remainingSeconds: activeRoom.remainingSeconds,
          drawnNumbers: drawnNumbers,
          remainingNumbers: remainingNumbers,
          lastDrawTime: Date.now() - this.NUMBER_DRAW_INTERVAL, // فوری شروع به کشیدن کند
          drawInterval: this.NUMBER_DRAW_INTERVAL,
          lastSyncTime: Date.now(),
          errorCount: 0,
        };

        this.roomStates.set(activeRoom.id, roomState);
        
        this.logger.log(
          `Recovered room ${activeRoom.id}: ${drawnNumbers.size}/90 numbers drawn, ${remainingNumbers.length} remaining`,
        );
      }

      this.logger.log(`Recovery completed for ${activeRooms.length} active rooms`);
    } catch (error) {
      this.logger.error('Error during recovery:', error);
    }
  }

  /**
   * Stop all timers and intervals (useful for shutdown)
   */
  onModuleDestroy() {
    // حذف Jobها از SocketScheduler
    this.scheduler.removeJob('autoTimerMainLoop');
    this.scheduler.removeJob('autoTimerSync');
    
    // پاکسازی State
    this.roomStates.clear();
    
    this.logger.log('AutoTimerService destroyed and jobs removed from SocketScheduler');
  }

  /**
   * دریافت وضعیت تمام روم‌های فعال - بهبود یافته
   */
  getActiveRoomsStatus() {
    const roomsList = Array.from(this.roomStates.values()).map(room => ({
      activeRoomId: room.activeRoomId,
      gameRoomId: room.gameRoomId,
      status: room.status,
      remainingSeconds: room.remainingSeconds,
      drawnCount: room.drawnNumbers.size,
      remainingCount: room.remainingNumbers.length,
      errorCount: room.errorCount,
      lastError: room.lastError,
      timeSinceLastSync: Date.now() - room.lastSyncTime,
      timeSinceLastDraw: room.status === RoomStatus.STARTED 
        ? Date.now() - room.lastDrawTime 
        : null,
    }));

    return {
      totalRooms: this.roomStates.size,
      pendingRooms: roomsList.filter(r => r.status === RoomStatus.PENDING).length,
      startedRooms: roomsList.filter(r => r.status === RoomStatus.STARTED).length,
      errorRooms: roomsList.filter(r => r.errorCount > 0).length,
      rooms: roomsList,
      schedulerActive: true,
    };
  }

  /**
   * Health check برای monitoring - بهبود یافته
   */
  async healthCheck() {
    try {
      const status = this.getActiveRoomsStatus();
      
      // بررسی روم‌های فعال در دیتابیس
      const pendingRoomsInDb = await this.activeRoomRepository.count({
        where: { status: RoomStatus.PENDING },
      });
      
      const startedRoomsInDb = await this.activeRoomRepository.count({
        where: { status: RoomStatus.STARTED },
      });

      // بررسی Room های مشکل‌دار
      const problematicRooms = status.rooms.filter(
        r => r.errorCount >= 3 || r.timeSinceLastSync > 30000, // 30 ثانیه
      );

      // بررسی Sync های عقب افتاده
      const outOfSyncRooms = status.rooms.filter(
        r => r.timeSinceLastSync > this.SYNC_INTERVAL * 3, // 3 برابر sync interval
      );

      return {
        isHealthy: problematicRooms.length === 0 && status.schedulerActive,
        timestamp: new Date().toISOString(),
        
        // اطلاعات State در حافظه
        memoryState: {
          totalRooms: status.totalRooms,
          pendingRooms: status.pendingRooms,
          startedRooms: status.startedRooms,
          errorRooms: status.errorRooms,
        },
        
        // اطلاعات دیتابیس
        databaseState: {
          pendingRooms: pendingRoomsInDb,
          startedRooms: startedRoomsInDb,
        },
        
        // وضعیت Scheduler
        scheduler: {
          active: status.schedulerActive,
          mainLoopInterval: this.MAIN_LOOP_INTERVAL,
          syncInterval: this.SYNC_INTERVAL,
        },
        
        // مشکلات
        issues: {
          problematicRooms: problematicRooms.length,
          outOfSyncRooms: outOfSyncRooms.length,
          details: problematicRooms.map(r => ({
            activeRoomId: r.activeRoomId,
            errorCount: r.errorCount,
            lastError: r.lastError,
            timeSinceLastSync: r.timeSinceLastSync,
          })),
        },
        
        // اطلاعات کامل روم‌ها (اختیاری)
        rooms: status.rooms,
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
}
