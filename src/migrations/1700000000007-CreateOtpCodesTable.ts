import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateOtpCodesTable1700000000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'otp_codes',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'phoneNumber',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'code',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'isVerified',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'verifiedAt',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'incomingReferral',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
            isNullable: false,
          },
        ],
      }),
      true, // if not exists
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('otp_codes');
  }
}
