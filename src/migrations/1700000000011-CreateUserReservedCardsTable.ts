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
  
      // 🟢 Foreign Key برای userId
      await queryRunner.createForeignKey(
        'user_reserved_cards',
        new TableForeignKey({
          columnNames: ['userId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'users',
          onDelete: 'CASCADE',
        }),
      );
  
      // 🟢 Foreign Key برای activeRoomId
      await queryRunner.createForeignKey(
        'user_reserved_cards',
        new TableForeignKey({
          columnNames: ['activeRoomId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'active_room_global',
          onDelete: 'CASCADE',
        }),
      );
  
      // 🟢 Foreign Key برای cardId
      await queryRunner.createForeignKey(
        'user_reserved_cards',
        new TableForeignKey({
          columnNames: ['cardId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'cards',
          onDelete: 'CASCADE',
        }),
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
  