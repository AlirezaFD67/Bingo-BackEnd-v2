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

    // Create index on "activeRoomId" for better query performance (idempotent)
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_drawn_numbers_activeRoomId" ON "drawn_numbers" ("activeRoomId")',
    );

    // Ensure foreign key exists with a stable name; drop legacy auto-named FK if present
    await queryRunner.query(
      'ALTER TABLE "drawn_numbers" DROP CONSTRAINT IF EXISTS "FK_0bd1771ab58ab3d30a89d2ea458"',
    );
    await queryRunner.query(
      `DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_drawn_numbers_activeRoomId'
        ) THEN
          ALTER TABLE "drawn_numbers"
          ADD CONSTRAINT "FK_drawn_numbers_activeRoomId"
          FOREIGN KEY ("activeRoomId") REFERENCES "active_room_global"("id") ON DELETE CASCADE;
        END IF;
      END; $$;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('drawn_numbers');
    if (table) {
      // Drop index first
      await queryRunner.query(
        'DROP INDEX IF EXISTS "IDX_drawn_numbers_activeRoomId"',
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
