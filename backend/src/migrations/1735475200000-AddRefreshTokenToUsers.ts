import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddRefreshTokenToUsers1735475200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'refreshToken',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'refreshTokenExpiresAt',
        type: 'timestamp',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'refreshTokenExpiresAt');
    await queryRunner.dropColumn('users', 'refreshToken');
  }
}
