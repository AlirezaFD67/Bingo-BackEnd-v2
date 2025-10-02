import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActiveRoomGlobal } from '../../entities/active-room-global.entity';
import { GameRoom } from '../../entities/game-room.entity';
import { Reservation } from '../../entities/reservation.entity';
import { DrawnNumber } from '../../entities/drawn-number.entity';
import { UserReservedCard } from '../../entities/user-reserved-card.entity';
import { Card } from '../../entities/card.entity';
import { ActiveRoomWinner } from '../../entities/active-room-winners.entity';
import { RoomStatus } from '../../enums/room-status.enum';
import { PendingRoomDto } from './dto/pending-rooms-response.dto';
import { SocketScheduler } from '../../utils/SocketScheduler';
import { RoomInfoResponseDto } from './dto/room-info-response.dto';

@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);

  constructor(
    @InjectRepository(ActiveRoomGlobal)
    private activeRoomRepository: Repository<ActiveRoomGlobal>,
    @InjectRepository(GameRoom)
    private gameRoomRepository: Repository<GameRoom>,
    @InjectRepository(Reservation)
    private reservationRepository: Repository<Reservation>,
    @InjectRepository(DrawnNumber)
    private drawnNumberRepository: Repository<DrawnNumber>,
    @InjectRepository(UserReservedCard)
    private userReservedCardRepository: Repository<UserReservedCard>,
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
    @InjectRepository(ActiveRoomWinner)
    private activeRoomWinnerRepository: Repository<ActiveRoomWinner>,
  ) {}

  /** Helper functions */
  private isLineComplete(matrix: number[][], drawnNumbers: number[]): boolean {
    // سلول‌های خالی/آزاد (0 یا null) نادیده گرفته شوند
    return matrix.some((row) =>
      row.every((num) => num == null || num <= 0 || drawnNumbers.includes(num)),
    );
  }

  private isCardComplete(matrix: number[][], drawnNumbers: number[]): boolean {
    // سلول‌های خالی/آزاد (0 یا null) نادیده گرفته شوند
    return matrix
      .flat()
      .every((num) => num == null || num <= 0 || drawnNumbers.includes(num));
  }

  async getPendingRooms(): Promise<PendingRoomDto[]> {
    try {
      // Get all active rooms with pending or started status
      const activeRooms = await this.activeRoomRepository.find({
        where: [{ status: RoomStatus.PENDING }, { status: RoomStatus.STARTED }],
        relations: ['gameRoom'],
        order: { gameRoom: { entryFee: 'ASC' } }, // مرتب‌سازی بر اساس entryFee از کم به زیاد
      });

      const result: PendingRoomDto[] = [];

      for (const activeRoom of activeRooms) {
        // Count unique players for this active room
        const playerCountResult = await this.reservationRepository
          .createQueryBuilder('reservation')
          .where('reservation.activeRoomId = :activeRoomId', {
            activeRoomId: activeRoom.id,
          })
          .select('COUNT(DISTINCT reservation.userId)', 'count')
          .getRawOne();

        const playerCount = parseInt(playerCountResult?.count || '0');

        result.push({
          activeRoomId: activeRoom.id,
          gameRoomId: activeRoom.gameRoomId,
          remainingSeconds: activeRoom.remainingSeconds,
          playerCount: playerCount,
          entryFee: activeRoom.gameRoom.entryFee,
          status: activeRoom.status,
          minPlayers: activeRoom.gameRoom.minPlayers,
        });
      }

      this.logger.log(`Found ${result.length} pending/started rooms`);
      return result;
    } catch (error) {
      this.logger.error('Error fetching pending rooms:', error);
      throw error;
    }
  }

  async getRoomInfo(activeRoomId: number): Promise<RoomInfoResponseDto> {
    try {
      // Get the active room with its game room
      const activeRoom = await this.activeRoomRepository.findOne({
        where: { id: activeRoomId },
        relations: ['gameRoom'],
      });

      if (!activeRoom) {
        throw new Error(`Active room with ID ${activeRoomId} not found`);
      }

      // Count total reserved cards and unique players in parallel
      const [reservedCardsResult, playerCountResult] = await Promise.all([
        this.reservationRepository
          .createQueryBuilder('reservation')
          .where('reservation.activeRoomId = :activeRoomId', { activeRoomId })
          .select('SUM(reservation.cardCount)', 'totalCards')
          .getRawOne(),
        this.reservationRepository
          .createQueryBuilder('reservation')
          .where('reservation.activeRoomId = :activeRoomId', { activeRoomId })
          .select('COUNT(DISTINCT reservation.userId)', 'count')
          .getRawOne(),
      ]);

      const reservedCards = parseInt(reservedCardsResult?.totalCards || '0');
      const availableCards = 30 - reservedCards; // 30 is the maximum cards per room
      const playerCount = parseInt(playerCountResult?.count || '0');

      const result: RoomInfoResponseDto = {
        status: activeRoom.status,
        remainingSeconds: activeRoom.remainingSeconds,
        availableCards: availableCards,
        playerCount: playerCount,
      };

      this.logger.log(
        `Room info for activeRoomId ${activeRoomId}: ${JSON.stringify(result)}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Error fetching room info for activeRoomId ${activeRoomId}:`,
        error,
      );
      throw error;
    }
  }

  async getDrawnNumbers(
    activeRoomId: number,
  ): Promise<{ drawnNumbers: number[]; total: number }> {
    // Validation: Check if activeRoomId is valid
    if (!activeRoomId || activeRoomId <= 0 || !Number.isInteger(activeRoomId)) {
      throw new Error('activeRoomId must be a positive integer');
    }

    // Fetch all drawn numbers for the room ordered by createdAt ASC
    const rows = await this.drawnNumberRepository.find({
      where: { activeRoomId },
      order: { createdAt: 'ASC' },
      select: ['number'],
    });
    const numbers = rows.map((r) => r.number);
    return { drawnNumbers: numbers, total: numbers.length };
  }

  /**
   * Check for line winners when a new number is drawn
   * Returns true if line winners were found (game should stop line checking)
   */
  async checkLineWinners(activeRoomId: number): Promise<boolean> {
    try {
      // Check if line winners already exist for this room
      const existingLineWinners = await this.activeRoomWinnerRepository.findOne({
        where: { activeRoomId, winType: 'line' },
      });

      if (existingLineWinners) {
        this.logger.log(
          `Line winners already exist for activeRoomId: ${activeRoomId}`,
        );
        return true; // Line checking should stop
      }

      // Get drawn numbers and reserved cards in parallel
      const [drawnNumbers, reservedCards] = await Promise.all([
        this.drawnNumberRepository.find({
          where: { activeRoomId },
          order: { createdAt: 'ASC' },
          select: ['number'],
        }),
        this.userReservedCardRepository.find({
          where: { activeRoomId },
          relations: ['card'],
        }),
      ]);

      this.logger.debug(
        `Line check: activeRoomId=${activeRoomId} drawn=${drawnNumbers.length} reservedCards=${reservedCards.length}`,
      );

      const drawnNumbersList = drawnNumbers.map((dn) => dn.number);
      const lineWinners: Array<{ userId: number; cardId: number }> = [];

      for (const reservedCard of reservedCards) {
        if (this.isLineComplete(reservedCard.card.matrix, drawnNumbersList)) {
          // Check if this user already has a line winner
          const userAlreadyWon = lineWinners.some(
            (winner) => winner.userId === reservedCard.userId,
          );

          if (!userAlreadyWon) {
            lineWinners.push({
              userId: reservedCard.userId,
              cardId: reservedCard.cardId,
            });
            this.logger.debug(
              `Line winner candidate -> userId=${reservedCard.userId} cardId=${reservedCard.cardId}`,
            );
          }
        }
      }

      // Save line winners to database
      if (lineWinners.length > 0) {
        await Promise.all(
          lineWinners.map((winner) =>
            this.activeRoomWinnerRepository.save({
              activeRoomId,
              userId: winner.userId,
              cardId: winner.cardId,
              winType: 'line',
            }),
          ),
        );

        // Emit socket event immediately with up-to-date winners
        const allWinners = await this.activeRoomWinnerRepository.find({
          where: { activeRoomId },
        });
        const response = {
          data: {
            activeRoomId,
            lineWinners: allWinners
              .filter((w) => w.winType === 'line')
              .map((w) => ({ userId: w.userId, cardId: w.cardId, amount: 50000 })),
            fullWinners: allWinners
              .filter((w) => w.winType === 'full')
              .map((w) => ({ userId: w.userId, cardId: w.cardId, amount: 150000 })),
            gameFinished: false,
          },
        };
        SocketScheduler.getInstance().emitToNamespace('/rooms', 'win', response);

        this.logger.log(
          `Found ${lineWinners.length} line winners for activeRoomId: ${activeRoomId}`,
        );
        return true; // Line checking should stop
      }

      return false; // No line winners found, continue checking
    } catch (error) {
      this.logger.error(
        `Error checking line winners for activeRoomId ${activeRoomId}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Check for full winners when a new number is drawn
   * Returns true if full winners were found (game should end)
   */
  async checkFullWinners(activeRoomId: number): Promise<boolean> {
    try {
      // Get drawn numbers and reserved cards in parallel
      const [drawnNumbers, reservedCards] = await Promise.all([
        this.drawnNumberRepository.find({
          where: { activeRoomId },
          order: { createdAt: 'ASC' },
          select: ['number'],
        }),
        this.userReservedCardRepository.find({
          where: { activeRoomId },
          relations: ['card'],
        }),
      ]);

      const drawnNumbersList = drawnNumbers.map((dn) => dn.number);
      const fullWinners: Array<{ userId: number; cardId: number }> = [];

      for (const reservedCard of reservedCards) {
        if (this.isCardComplete(reservedCard.card.matrix, drawnNumbersList)) {
          // Check if this user already has a full winner
          const userAlreadyWon = fullWinners.some(
            (winner) => winner.userId === reservedCard.userId,
          );

          if (!userAlreadyWon) {
            fullWinners.push({
              userId: reservedCard.userId,
              cardId: reservedCard.cardId,
            });
          }
        }
      }

      // Save full winners to database
      if (fullWinners.length > 0) {
        await Promise.all(
          fullWinners.map((winner) =>
            this.activeRoomWinnerRepository.save({
              activeRoomId,
              userId: winner.userId,
              cardId: winner.cardId,
              winType: 'full',
            }),
          ),
        );

        // Mark the room as finished
        await this.activeRoomRepository.update(
          { id: activeRoomId },
          { status: RoomStatus.FINISHED },
        );

        // Emit socket event with final winners
        const allWinners = await this.activeRoomWinnerRepository.find({
          where: { activeRoomId },
        });
        const response = {
          data: {
            activeRoomId,
            lineWinners: allWinners
              .filter((w) => w.winType === 'line')
              .map((w) => ({ userId: w.userId, cardId: w.cardId, amount: 50000 })),
            fullWinners: allWinners
              .filter((w) => w.winType === 'full')
              .map((w) => ({ userId: w.userId, cardId: w.cardId, amount: 150000 })),
            gameFinished: true,
          },
        };
        SocketScheduler.getInstance().emitToNamespace('/rooms', 'win', response);

        this.logger.log(
          `Full winners saved (${fullWinners.length}) and room finished: activeRoomId=${activeRoomId}`,
        );
        this.logger.log(
          `Found ${fullWinners.length} full winners for activeRoomId: ${activeRoomId}. Game finished.`,
        );
        return true; // Game should end
      }

      return false; // No full winners found, continue game
    } catch (error) {
      this.logger.error(
        `Error checking full winners for activeRoomId ${activeRoomId}:`,
        error,
      );
      return false;
    }
  }

  /**
   * Get winners for a specific active room
   */
  async getWinners(activeRoomId: number): Promise<{
    lineWinners: Array<{ userId: number; cardId: number; amount: number }>;
    fullWinners: Array<{ userId: number; cardId: number; amount: number }>;
    gameFinished: boolean;
  }> {
    try {
      // Get all winners for this room
      const winners = await this.activeRoomWinnerRepository.find({
        where: { activeRoomId },
        relations: ['user', 'card'],
      });

      const lineWinners = winners
        .filter((w) => w.winType === 'line')
        .map((w) => ({
          userId: w.userId,
          cardId: w.cardId,
          amount: 50000, // Line winner amount
        }));

      const fullWinners = winners
        .filter((w) => w.winType === 'full')
        .map((w) => ({
          userId: w.userId,
          cardId: w.cardId,
          amount: 150000, // Full winner amount
        }));

      // Check if game is finished
      const activeRoom = await this.activeRoomRepository.findOne({
        where: { id: activeRoomId },
      });
      const gameFinished = activeRoom?.status === RoomStatus.FINISHED;

      return {
        lineWinners,
        fullWinners,
        gameFinished,
      };
    } catch (error) {
      this.logger.error(
        `Error getting winners for activeRoomId ${activeRoomId}:`,
        error,
      );
      return {
        lineWinners: [],
        fullWinners: [],
        gameFinished: false,
      };
    }
  }
}
