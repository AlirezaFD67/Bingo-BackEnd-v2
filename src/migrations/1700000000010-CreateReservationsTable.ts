import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateReservationsTable1700000000010
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'reservations',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isGenerated: true,
            generationStrategy: 'increment',
            isPrimary: true,
          },
          {
            name: 'userId',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'cardCount',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'entryFee',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'activeRoomId',
            type: 'integer',
            isNullable: true,
          },
        ],
      }),
      true, // 🟢 اگر جدول وجود نداشته باشد ایجاد شود
    );

    // 🟢 ایجاد Foreign Key برای userId با نام ثابت و idempotent
    await queryRunner.query(
      'ALTER TABLE "reservations" DROP CONSTRAINT IF EXISTS "FK_reservations_userId"',
    );
    await queryRunner.query(
      `DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_reservations_userId'
        ) THEN
          ALTER TABLE "reservations"
          ADD CONSTRAINT "FK_reservations_userId"
          FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
        END IF;
      END; $$;`
    );

    // 🟢 ایجاد Foreign Key برای activeRoomId با نام ثابت و idempotent
    await queryRunner.query(
      'ALTER TABLE "reservations" DROP CONSTRAINT IF EXISTS "FK_reservations_activeRoomId"',
    );
    await queryRunner.query(
      `DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_reservations_activeRoomId'
        ) THEN
          ALTER TABLE "reservations"
          ADD CONSTRAINT "FK_reservations_activeRoomId"
          FOREIGN KEY ("activeRoomId") REFERENCES "active_room_global"("id") ON DELETE SET NULL;
        END IF;
      END; $$;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('reservations');
    if (table) {
      const userFK = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('userId') !== -1,
      );
      if (userFK) {
        await queryRunner.dropForeignKey('reservations', userFK);
      }

      const roomFK = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('activeRoomId') !== -1,
      );
      if (roomFK) {
        await queryRunner.dropForeignKey('reservations', roomFK);
      }
    }

    await queryRunner.dropTable('reservations');
  }
}
