import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateGameRoomsTable1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'game_rooms',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'entryFee',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'startTimer',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'isActive',
            type: 'boolean',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'minPlayers',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'createdAt',
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
    await queryRunner.dropTable('game_rooms');
  }
}
