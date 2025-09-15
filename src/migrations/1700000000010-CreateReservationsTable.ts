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
  
      // 🟢 ایجاد Foreign Key برای userId
      await queryRunner.createForeignKey(
        'reservations',
        new TableForeignKey({
          columnNames: ['userId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'users',
          onDelete: 'CASCADE',
        }),
      );
  
      // 🟢 ایجاد Foreign Key برای activeRoomId
      await queryRunner.createForeignKey(
        'reservations',
        new TableForeignKey({
          columnNames: ['activeRoomId'],
          referencedColumnNames: ['id'],
          referencedTableName: 'active_room_global',
          onDelete: 'SET NULL', // 🟢 چون در SQL شما nullable هست
        }),
      );
    }
  
    public async down(queryRunner: QueryRunner): Promise<void> {
      const table = await queryRunner.getTable('reservations');
      if (table) {
        const userFK = table.foreignKeys.find(fk => fk.columnNames.indexOf('userId') !== -1);
        if (userFK) {
          await queryRunner.dropForeignKey('reservations', userFK);
        }
  
        const roomFK = table.foreignKeys.find(fk => fk.columnNames.indexOf('activeRoomId') !== -1);
        if (roomFK) {
          await queryRunner.dropForeignKey('reservations', roomFK);
        }
      }
  
      await queryRunner.dropTable('reservations');
    }
  }
  