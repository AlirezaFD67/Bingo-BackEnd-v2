import { MigrationInterface, QueryRunner, Table } from 'typeorm';

// The class name has been updated for better readability.
export class CreateUserTable1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          // Primary Key
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },

          // Personal Information
          {
            name: 'firstName',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'lastName',
            type: 'varchar',
            isNullable: true,
          },

          // Authentication & Role
          {
            name: 'username',
            type: 'varchar',
            isUnique: true,
            isNullable: true,
          },
          {
            name: 'phoneNumber',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'role',
            type: 'varchar',
            default: "'USER'",
            isNullable: false,
          },

          // Financial Information
          {
            name: 'walletBalance',
            type: 'bigint',
            default: 0,
            isNullable: false,
          },
          {
            name: 'bankCardNumber',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'shebaNumber',
            type: 'varchar',
            length: '26',
            isNullable: true,
          },

          // Referral Information
          {
            name: 'referralCode',
            type: 'varchar',
            length: '6',
            isUnique: true,
            isNullable: true,
          },
          {
            name: 'referredBy',
            type: 'varchar',
            length: '6',
            isNullable: true,
          },

          // Timestamps
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true, // if not exists
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
