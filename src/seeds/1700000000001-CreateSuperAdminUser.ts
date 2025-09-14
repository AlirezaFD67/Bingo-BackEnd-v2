import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSuperAdminUser1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Using the query builder to insert the initial admin user.
    // In a real-world application, make sure to hash the password.
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into('users')
      .values({
        firstName: 'مدیر',
        lastName: 'سیستم',
        username: 'superAdmin',
        phoneNumber: '09112352382',
        role: 'ADMIN', // Set a specific role for the admin user
      })
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // This will remove the admin user if the migration is reverted.
    await queryRunner.manager
      .createQueryBuilder()
      .delete()
      .from('users')
      .where('username = :username', { username: 'superAdmin' })
      .execute();
  }
}
