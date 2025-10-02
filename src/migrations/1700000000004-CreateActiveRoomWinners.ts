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

    // ارتباط با active_room_global (با نام مشخص و جلوگیری از ایجاد تکراری)
    await queryRunner.query(
      `DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_active_room_winners_activeRoomId'
        ) THEN
          ALTER TABLE "active_room_winners"
          ADD CONSTRAINT "FK_active_room_winners_activeRoomId"
          FOREIGN KEY ("activeRoomId") REFERENCES "active_room_global"("id") ON DELETE CASCADE;
        END IF;
      END; $$;`
    );

    // 🟢 می‌تونی برای userId و cardId هم ForeignKey بزنی (اختیاری)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // حذف FK با نام مشخص در صورت وجود
    await queryRunner.query(
      'ALTER TABLE "active_room_winners" DROP CONSTRAINT IF EXISTS "FK_active_room_winners_activeRoomId"',
    );
    await queryRunner.dropTable('active_room_winners');
  }
}
