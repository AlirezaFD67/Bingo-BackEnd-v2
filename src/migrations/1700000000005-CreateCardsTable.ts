import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateCardsTable1700000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'cards',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'code',
            type: 'varchar',
            length: '32',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'matrix',
            type: 'json', // For PostgreSQL
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true, // if not exists
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('cards');
  }
}
