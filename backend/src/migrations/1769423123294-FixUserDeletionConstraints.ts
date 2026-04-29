import { MigrationInterface, QueryRunner } from "typeorm";

export class FixUserDeletionConstraints1769423123294 implements MigrationInterface {
    name = 'FixUserDeletionConstraints1769423123294'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "announcements" DROP CONSTRAINT "FK_92d72877cc8c092c83f37c62752"`);
        await queryRunner.query(`ALTER TABLE "announcements" ALTER COLUMN "authorId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "announcements" ADD CONSTRAINT "FK_92d72877cc8c092c83f37c62752" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "announcements" DROP CONSTRAINT "FK_92d72877cc8c092c83f37c62752"`);
        await queryRunner.query(`ALTER TABLE "announcements" ALTER COLUMN "authorId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "announcements" ADD CONSTRAINT "FK_92d72877cc8c092c83f37c62752" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
