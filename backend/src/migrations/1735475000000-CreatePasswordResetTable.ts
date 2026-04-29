import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreatePasswordResetTable1735475000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'password_resets',
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
            name: 'token',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'used',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'createdAt',
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
      'password_resets',
      new TableIndex({
        name: 'IDX_PASSWORD_RESETS_EMAIL',
        columnNames: ['email'],
      }),
    );

    await queryRunner.createIndex(
      'password_resets',
      new TableIndex({
        name: 'IDX_PASSWORD_RESETS_TOKEN',
        columnNames: ['token'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('password_resets');
  }
}
