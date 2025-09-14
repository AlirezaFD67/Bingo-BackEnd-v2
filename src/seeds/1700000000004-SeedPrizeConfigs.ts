import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedPrizeConfigs1700000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      // The type '1' corresponds to the 'GLOBAL' game type.
      `INSERT INTO "prize_configs" ("type", "one_line_prize_percent", "full_card_prize_percent") VALUES ('1', 20, 60)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "prize_configs" WHERE "type" = '1'`);
  }
}
