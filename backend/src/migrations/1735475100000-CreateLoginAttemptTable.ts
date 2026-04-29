import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateLoginAttemptTable1735475100000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'login_attempts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'ipAddress',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'success',
            type: 'boolean',
            isNullable: false,
          },
          {
            name: 'failureReason',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'attemptedAt',
            type: 'timestamp',
            default: 'now()',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create index for faster lookups
    await queryRunner.createIndex(
      'login_attempts',
      new TableIndex({
        name: 'IDX_LOGIN_ATTEMPTS_EMAIL',
        columnNames: ['email'],
      }),
    );

    await queryRunner.createIndex(
      'login_attempts',
      new TableIndex({
        name: 'IDX_LOGIN_ATTEMPTS_IP',
        columnNames: ['ipAddress'],
      }),
    );

    await queryRunner.createIndex(
      'login_attempts',
      new TableIndex({
        name: 'IDX_LOGIN_ATTEMPTS_ATTEMPTED_AT',
        columnNames: ['attemptedAt'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('login_attempts');
  }
}
