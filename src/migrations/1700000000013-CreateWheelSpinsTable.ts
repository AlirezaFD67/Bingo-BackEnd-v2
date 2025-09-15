import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableForeignKey,
  } from 'typeorm';
  
  export class CreateWheelSpinsTable1700000000013
    implements MigrationInterface
  {
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
  
      // 🟢 Foreign Key برای userId
      await queryRunner.createForeignKey(
        'wheel_spins',
        new TableForeignKey({
          columnNames: ['userId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'users',
          onDelete: 'CASCADE',
        }),
      );
    }
  
    public async down(queryRunner: QueryRunner): Promise<void> {
      const table = await queryRunner.getTable('wheel_spins');
      if (table) {
        const fk = table.foreignKeys.find(fk => fk.columnNames.indexOf('userId') !== -1);
        if (fk) {
          await queryRunner.dropForeignKey('wheel_spins', fk);
        }
      }
  
      await queryRunner.dropTable('wheel_spins');
    }
  }
  