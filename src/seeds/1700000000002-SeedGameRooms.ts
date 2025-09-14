import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedGameRooms1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into('game_rooms')
      .values([
        {
          entryFee: 5000,
          startTimer: 30,
          isActive: true,
          type: 1,
          minPlayers: 1,
        },
        {
          entryFee: 10000,
          startTimer: 30,
          isActive: true,
          type: 1,
          minPlayers: 1,
        },
        {
          entryFee: 20000,
          startTimer: 30,
          isActive: true,
          type: 1,
          minPlayers: 1,
        },
      ])
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // This will remove the seeded rooms if the migration is reverted.
    await queryRunner.manager
      .createQueryBuilder()
      .delete()
      .from('game_rooms')
      .where('entryFee IN (:...fees)', { fees: [5000, 10000, 20000] })
      .execute();
  }
}
