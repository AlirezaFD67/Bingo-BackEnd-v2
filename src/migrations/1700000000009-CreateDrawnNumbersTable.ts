import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableUnique,
  Index,
} from 'typeorm';

export class CreateDrawnNumbersTable1700000000009
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'drawn_numbers',
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
            name: 'number',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        uniques: [
          new TableUnique({
            name: 'UQ_drawn_numbers_activeRoom_number',
            columnNames: ['activeRoomId', 'number'],
          }),
        ],
      }),
      true, // 🟢 اطمینان از عدم ایجاد دوباره جدول
    );

    // Create index on activeRoomId for better query performance
    await queryRunner.query(
      'CREATE INDEX IDX_drawn_numbers_activeRoomId ON drawn_numbers (activeRoomId)',
    );

    await queryRunner.createForeignKey(
      'drawn_numbers',
      new TableForeignKey({
        columnNames: ['activeRoomId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'active_room_global',
        onDelete: 'CASCADE', // 🟢 مطابق با تعریف SQL شما
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('drawn_numbers');
    if (table) {
      // Drop index first
      await queryRunner.query(
        'DROP INDEX IF EXISTS IDX_drawn_numbers_activeRoomId',
      );

      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('activeRoomId') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('drawn_numbers', foreignKey);
      }
    }

    await queryRunner.dropTable('drawn_numbers');
  }
}
