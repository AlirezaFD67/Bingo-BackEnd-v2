import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreatePrizeConfigsTable1700000000006
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'prize_configs',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isGenerated: true,
            generationStrategy: 'increment',
            isPrimary: true,
          },
          {
            name: 'type',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'one_line_prize_percent',
            type: 'double precision',
            default: 0,
            isNullable: false,
          },
          {
            name: 'full_card_prize_percent',
            type: 'double precision',
            default: 0,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true, // if not exists
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('prize_configs');
  }
}
