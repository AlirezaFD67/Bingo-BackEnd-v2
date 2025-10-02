import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableUnique,
} from 'typeorm';

export class CreateUserReservedCardsTable1700000000011
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_reserved_cards',
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
            name: 'activeRoomId',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'cardId',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        uniques: [
          new TableUnique({
            name: 'UQ_user_activeCard',
            columnNames: ['userId', 'activeRoomId', 'cardId'], // 🟢 محدودیت unique مطابق SQL
          }),
        ],
      }),
      true, // 🟢 اگر جدول وجود نداشته باشد ایجاد شود
    );

    // 🟢 Foreign Key برای userId با نام ثابت و idempotent
    await queryRunner.query(
      'ALTER TABLE "user_reserved_cards" DROP CONSTRAINT IF EXISTS "FK_ae3c8aefc354c56ae7c01754bb3"',
    );
    await queryRunner.query(
      'ALTER TABLE "user_reserved_cards" DROP CONSTRAINT IF EXISTS "FK_user_reserved_cards_userId"',
    );
    await queryRunner.query(
      `DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_user_reserved_cards_userId'
        ) THEN
          ALTER TABLE "user_reserved_cards"
          ADD CONSTRAINT "FK_user_reserved_cards_userId"
          FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
        END IF;
      END; $$;`
    );

    // 🟢 Foreign Key برای activeRoomId با نام ثابت و idempotent
    await queryRunner.query(
      'ALTER TABLE "user_reserved_cards" DROP CONSTRAINT IF EXISTS "FK_user_reserved_cards_activeRoomId"',
    );
    await queryRunner.query(
      `DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_user_reserved_cards_activeRoomId'
        ) THEN
          ALTER TABLE "user_reserved_cards"
          ADD CONSTRAINT "FK_user_reserved_cards_activeRoomId"
          FOREIGN KEY ("activeRoomId") REFERENCES "active_room_global"("id") ON DELETE CASCADE;
        END IF;
      END; $$;`
    );

    // 🟢 Foreign Key برای cardId با نام ثابت و idempotent
    await queryRunner.query(
      'ALTER TABLE "user_reserved_cards" DROP CONSTRAINT IF EXISTS "FK_user_reserved_cards_cardId"',
    );
    await queryRunner.query(
      `DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_user_reserved_cards_cardId'
        ) THEN
          ALTER TABLE "user_reserved_cards"
          ADD CONSTRAINT "FK_user_reserved_cards_cardId"
          FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE CASCADE;
        END IF;
      END; $$;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('user_reserved_cards');
    if (table) {
      for (const fk of table.foreignKeys) {
        await queryRunner.dropForeignKey('user_reserved_cards', fk);
      }
    }

    await queryRunner.dropTable('user_reserved_cards');
  }
}
