import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddFirstLastNameToUsers1735475300000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Sprawdź czy kolumny już istnieją
    const table = await queryRunner.getTable('users');
    const hasFirstName = table?.columns.find((col) => col.name === 'firstName');
    const hasLastName = table?.columns.find((col) => col.name === 'lastName');

    if (!hasFirstName) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'firstName',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }

    if (!hasLastName) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({
          name: 'lastName',
          type: 'varchar',
          isNullable: true,
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'firstName');
    await queryRunner.dropColumn('users', 'lastName');
  }
}
