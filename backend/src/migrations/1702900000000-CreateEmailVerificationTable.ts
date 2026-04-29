import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateEmailVerificationTable1702900000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'email_verification',
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
            isUnique: true,
          },
          {
            name: 'code',
            type: 'varchar',
          },
          {
            name: 'firstName',
            type: 'varchar',
          },
          {
            name: 'lastName',
            type: 'varchar',
          },
          {
            name: 'password',
            type: 'varchar',
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['PARENT', 'CAREGIVER'],
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
          },
          {
            name: 'attempts',
            type: 'int',
            default: 0,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            columnNames: ['email'],
          },
          {
            columnNames: ['expiresAt'],
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('email_verification');
  }
}
