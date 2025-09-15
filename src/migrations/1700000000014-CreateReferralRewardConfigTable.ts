import {
    MigrationInterface,
    QueryRunner,
    Table,
  } from 'typeorm';
  
  export class CreateReferralRewardConfigTable1700000000014
    implements MigrationInterface
  {
    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(
        new Table({
          name: 'referral_reward_config',
          columns: [
            {
              name: 'id',
              type: 'integer',
              isGenerated: true,
              generationStrategy: 'increment',
              isPrimary: true,
            },
            {
              name: 'rewardAmount',
              type: 'bigint',
              default: '0',
              isNullable: false,
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
              isNullable: false,
            },
            {
              name: 'updatedAt',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
              isNullable: false,
            },
          ],
        }),
        true, // 🟢 اگر جدول وجود نداشته باشد ایجاد شود
      );
    }
  
    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropTable('referral_reward_config');
    }
  }
  