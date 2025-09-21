import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateWalletTransactionsTable1700000000012
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types first
    await queryRunner.query(`
        CREATE TYPE wallet_transactions_type_enum AS ENUM (
          'deposit',
          'withdraw',
          'prize',
          'referral_bonus',
          'game_fee',
          'bingo_line',
          'bingo_full_card',
          'wheel_spin'
        )
      `);

    await queryRunner.query(`
        CREATE TYPE wallet_transactions_status_enum AS ENUM (
          'pending',
          'confirmed',
          'failed'
        )
      `);

    await queryRunner.createTable(
      new Table({
        name: 'wallet_transactions',
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
            name: 'amount',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'wallet_transactions_type_enum',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'wallet_transactions_status_enum',
            default: `'confirmed'`,
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
        ],
      }),
      true, // 🟢 اگر جدول وجود نداشته باشد ایجاد شود
    );

    // 🟢 Foreign Key برای userId
    await queryRunner.createForeignKey(
      'wallet_transactions',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('wallet_transactions');
    if (table) {
      const fk = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('userId') !== -1,
      );
      if (fk) {
        await queryRunner.dropForeignKey('wallet_transactions', fk);
      }
    }

    await queryRunner.dropTable('wallet_transactions');

    // Drop enum types
    await queryRunner.query(
      `DROP TYPE IF EXISTS wallet_transactions_status_enum`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS wallet_transactions_type_enum`,
    );
  }
}
