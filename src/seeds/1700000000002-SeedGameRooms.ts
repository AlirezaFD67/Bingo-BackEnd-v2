import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedGameRooms1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO game_rooms ("entryFee", "startTimer", "isActive", "type", "minPlayers")
      VALUES
        (5000, 30, true, 1, 1),
        (10000, 30, true, 1, 1),
        (20000, 30, true, 1, 1)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // This will remove the seeded rooms if the migration is reverted.
    await queryRunner.manager
      .createQueryBuilder()
      .delete()
      .from('game_rooms')
      .where('"entryFee" IN (:...fees)', { fees: [5000, 10000, 20000] })
      .execute();
  }
}
