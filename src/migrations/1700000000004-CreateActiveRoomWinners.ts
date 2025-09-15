import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateActiveRoomWinners1700000000004
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'active_room_winners',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isGenerated: true,
            generationStrategy: 'increment',
            isPrimary: true,
          },
          {
            name: 'activeRoomId',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'userId',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'cardId',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'winType',
            type: 'varchar',
            length: '20', // line | full
            isNullable: false,
          },
          {
            name: 'winAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // ارتباط با active_room_global
    await queryRunner.createForeignKey(
      'active_room_winners',
      new TableForeignKey({
        columnNames: ['activeRoomId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'active_room_global',
        onDelete: 'CASCADE',
      }),
    );

    // 🟢 می‌تونی برای userId و cardId هم ForeignKey بزنی (اختیاری)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('active_room_winners');
    if (table) {
      const fk = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('activeRoomId') !== -1,
      );
      if (fk) {
        await queryRunner.dropForeignKey('active_room_winners', fk);
      }
    }
    await queryRunner.dropTable('active_room_winners');
  }
}
