import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateWheelSpinsTable1700000000013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'wheel_spins',
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
            name: 'prizeAmount',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'lastSpinAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true, // 🟢 اگر جدول وجود نداشته باشد ایجاد شود
    );

    // 🟢 Foreign Key برای userId با نام ثابت و idempotent
    await queryRunner.query(
      'ALTER TABLE "wheel_spins" DROP CONSTRAINT IF EXISTS "FK_wheel_spins_userId"',
    );
    await queryRunner.query(
      `DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_wheel_spins_userId'
        ) THEN
          ALTER TABLE "wheel_spins"
          ADD CONSTRAINT "FK_wheel_spins_userId"
          FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
        END IF;
      END; $$;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('wheel_spins');
    if (table) {
      const fk = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('userId') !== -1,
      );
      if (fk) {
        await queryRunner.dropForeignKey('wheel_spins', fk);
      }
    }

    await queryRunner.dropTable('wheel_spins');
  }
}
