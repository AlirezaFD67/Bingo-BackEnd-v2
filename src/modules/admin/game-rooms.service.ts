import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameRoom } from '../../entities/game-room.entity';
import { CreateGameRoomDto } from './dto/create-game-room.dto';
import { UpdateGameRoomDto } from './dto/update-game-room.dto';
import { UpdateRoomStatusDto } from './dto/update-room-status.dto';
import { GetRoomsQueryDto } from './dto/get-rooms-query.dto';
import { GameRoomResponseDto } from './dto/game-room-response.dto';

@Injectable()
export class GameRoomsService {
  constructor(
    @InjectRepository(GameRoom)
    private readonly gameRoomRepository: Repository<GameRoom>,
  ) {}

  async createGameRoom(
    createGameRoomDto: CreateGameRoomDto,
  ): Promise<GameRoomResponseDto> {
    const gameRoom = this.gameRoomRepository.create({
      ...createGameRoomDto,
      isActive: true, // به صورت پیش فرض فعال است
    });

    const savedGameRoom = await this.gameRoomRepository.save(gameRoom);

    return {
      id: savedGameRoom.id,
      entryFee: savedGameRoom.entryFee,
      startTimer: savedGameRoom.startTimer,
      isActive: savedGameRoom.isActive,
      type: savedGameRoom.type,
      minPlayers: savedGameRoom.minPlayers,
      createdAt: savedGameRoom.createdAt,
    };
  }

  async getAllGameRooms(
    query: GetRoomsQueryDto,
  ): Promise<GameRoomResponseDto[]> {
    const queryBuilder = this.gameRoomRepository
      .createQueryBuilder('gameRoom')
      .select([
        'gameRoom.id',
        'gameRoom.entryFee',
        'gameRoom.startTimer',
        'gameRoom.isActive',
        'gameRoom.type',
        'gameRoom.minPlayers',
        'gameRoom.createdAt',
      ])
      .orderBy('gameRoom.entryFee', 'ASC');

    // اضافه کردن فیلتر isActive اگر ارسال شده باشد
    if (query.isActive !== undefined) {
      queryBuilder.andWhere('gameRoom.isActive = :isActive', {
        isActive: query.isActive,
      });
    }

    // اضافه کردن فیلتر type اگر ارسال شده باشد
    if (query.type !== undefined) {
      queryBuilder.andWhere('gameRoom.type = :type', { type: query.type });
    }

    const gameRooms = await queryBuilder.getMany();

    return gameRooms.map((room) => ({
      id: room.id,
      entryFee: room.entryFee,
      startTimer: room.startTimer,
      isActive: room.isActive,
      type: room.type,
      minPlayers: room.minPlayers,
      createdAt: room.createdAt,
    }));
  }

  async getGameRoomById(id: number): Promise<GameRoomResponseDto> {
    const gameRoom = await this.gameRoomRepository
      .createQueryBuilder('gameRoom')
      .select([
        'gameRoom.id',
        'gameRoom.entryFee',
        'gameRoom.startTimer',
        'gameRoom.isActive',
        'gameRoom.type',
        'gameRoom.minPlayers',
        'gameRoom.createdAt',
      ])
      .where('gameRoom.id = :id', { id })
      .getOne();

    if (!gameRoom) {
      throw new NotFoundException('اتاق بازی یافت نشد');
    }

    return {
      id: gameRoom.id,
      entryFee: gameRoom.entryFee,
      startTimer: gameRoom.startTimer,
      isActive: gameRoom.isActive,
      type: gameRoom.type,
      minPlayers: gameRoom.minPlayers,
      createdAt: gameRoom.createdAt,
    };
  }

  async updateGameRoom(
    id: number,
    updateGameRoomDto: UpdateGameRoomDto,
  ): Promise<GameRoomResponseDto> {
    const gameRoom = await this.gameRoomRepository
      .createQueryBuilder('gameRoom')
      .select([
        'gameRoom.id',
        'gameRoom.entryFee',
        'gameRoom.startTimer',
        'gameRoom.isActive',
        'gameRoom.type',
        'gameRoom.minPlayers',
        'gameRoom.createdAt',
      ])
      .where('gameRoom.id = :id', { id })
      .getOne();

    if (!gameRoom) {
      throw new NotFoundException('اتاق بازی یافت نشد');
    }

    // به‌روزرسانی فیلدهای ارسال شده
    Object.assign(gameRoom, updateGameRoomDto);

    const updatedGameRoom = await this.gameRoomRepository.save(gameRoom);

    return {
      id: updatedGameRoom.id,
      entryFee: updatedGameRoom.entryFee,
      startTimer: updatedGameRoom.startTimer,
      isActive: updatedGameRoom.isActive,
      type: updatedGameRoom.type,
      minPlayers: updatedGameRoom.minPlayers,
      createdAt: updatedGameRoom.createdAt,
    };
  }

  async updateRoomStatus(
    id: number,
    updateRoomStatusDto: UpdateRoomStatusDto,
  ): Promise<GameRoomResponseDto> {
    const gameRoom = await this.gameRoomRepository
      .createQueryBuilder('gameRoom')
      .select([
        'gameRoom.id',
        'gameRoom.entryFee',
        'gameRoom.startTimer',
        'gameRoom.isActive',
        'gameRoom.type',
        'gameRoom.minPlayers',
        'gameRoom.createdAt',
      ])
      .where('gameRoom.id = :id', { id })
      .getOne();

    if (!gameRoom) {
      throw new NotFoundException('اتاق بازی یافت نشد');
    }

    // به‌روزرسانی وضعیت اتاق
    gameRoom.isActive = updateRoomStatusDto.isActive;

    const updatedGameRoom = await this.gameRoomRepository.save(gameRoom);

    return {
      id: updatedGameRoom.id,
      entryFee: updatedGameRoom.entryFee,
      startTimer: updatedGameRoom.startTimer,
      isActive: updatedGameRoom.isActive,
      type: updatedGameRoom.type,
      minPlayers: updatedGameRoom.minPlayers,
      createdAt: updatedGameRoom.createdAt,
    };
  }
}
