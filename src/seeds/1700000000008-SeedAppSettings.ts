import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedAppSettings1700000000016 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "app_settings" ("key", "value")
      VALUES 
        ('referral_reward_amount', '10000'),
        ('signup_reward_amount', '20000')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "app_settings" 
      WHERE "key" IN ('referral_reward_amount', 'signup_reward_amount')
    `);
  }
}
