import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameRoom } from '../../entities/game-room.entity';
import { ActiveRoomGlobal } from '../../entities/active-room-global.entity';
import { Reservation } from '../../entities/reservation.entity';
import { RoomType } from '../../enums/room-type.enum';
import { RoomStatus } from '../../enums/room-status.enum';

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
        this.logger.log(`Active room already exists for game room ${gameRoom.id}`);
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
      this.logger.log(`Created active room ${savedActiveRoom.id} for game room ${gameRoom.id}`);

      // Start timer for this room
      this.startTimer(savedActiveRoom);
      return savedActiveRoom;
    } catch (error) {
      this.logger.error(`Error creating active room for game room ${gameRoom.id}:`, error);
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
        // Timer reached zero, check player count
        await this.checkPlayerCountAndProceed(activeRoom, gameRoom);
      }
    } catch (error) {
      this.logger.error(`Error processing timer tick for active room ${activeRoom.id}:`, error);
    }
  }

  /**
   * Check player count and either start the game or reset timer
   */
  private async checkPlayerCountAndProceed(activeRoom: ActiveRoomGlobal, gameRoom: GameRoom) {
    try {
      // Count unique users who reserved cards for this active room
      const playerCount = await this.reservationRepository
        .createQueryBuilder('reservation')
        .where('reservation.activeRoomId = :activeRoomId', { activeRoomId: activeRoom.id })
        .select('COUNT(DISTINCT reservation.userId)', 'count')
        .getRawOne();

      const uniquePlayerCount = parseInt(playerCount.count) || 0;

      this.logger.log(
        `Active room ${activeRoom.id}: ${uniquePlayerCount}/${gameRoom.minPlayers} players`,
      );

      if (uniquePlayerCount >= gameRoom.minPlayers) {
        // Enough players, start the game
        await this.startGame(activeRoom);
      } else {
        // Not enough players, reset timer
        await this.resetTimer(activeRoom, gameRoom);
      }
    } catch (error) {
      this.logger.error(`Error checking player count for active room ${activeRoom.id}:`, error);
    }
  }

  /**
   * Start the game (change status to started)
   */
  private async startGame(activeRoom: ActiveRoomGlobal) {
    try {
      activeRoom.status = RoomStatus.STARTED;
      activeRoom.updatedAt = new Date();
      await this.activeRoomRepository.save(activeRoom);

      this.stopTimer(activeRoom.id);
      this.logger.log(`Game started for active room ${activeRoom.id}`);
    } catch (error) {
      this.logger.error(`Error starting game for active room ${activeRoom.id}:`, error);
    }
  }

  /**
   * Reset timer for an active room
   */
  private async resetTimer(activeRoom: ActiveRoomGlobal, gameRoom: GameRoom) {
    try {
      activeRoom.remainingSeconds = gameRoom.startTimer; // Reset to original startTimer value
      activeRoom.updatedAt = new Date();
      await this.activeRoomRepository.save(activeRoom);

      this.logger.log(`Timer reset for active room ${activeRoom.id}, restarting countdown`);
    } catch (error) {
      this.logger.error(`Error resetting timer for active room ${activeRoom.id}:`, error);
    }
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
