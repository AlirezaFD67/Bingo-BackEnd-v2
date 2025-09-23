import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateGlobalActiveRoomTable1700000000003
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'active_room_global',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'gameRoomId',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'startTime',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            isNullable: false,
            default: "'pending'", // pending | started | finished | deactivated
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
      true, // if not exists
    );

    // Create the foreign key constraint
    await queryRunner.createForeignKey(
      'active_room_global',
      new TableForeignKey({
        columnNames: ['gameRoomId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'game_rooms',
        onDelete: 'SET NULL', // Or "CASCADE" depending on your logic
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('active_room_global');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('gameRoomId') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('active_room_global', foreignKey);
      }
    }
    await queryRunner.dropTable('active_room_global');
  }
}
