import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAnnouncementPriorities1769432963727 implements MigrationInterface {
    name = 'UpdateAnnouncementPriorities1769432963727'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."announcements_priority_enum" RENAME TO "announcements_priority_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."announcements_priority_enum" AS ENUM('NORMAL', 'URGENT')`);
        await queryRunner.query(`ALTER TABLE "announcements" ALTER COLUMN "priority" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "announcements" ALTER COLUMN "priority" TYPE "public"."announcements_priority_enum" USING "priority"::"text"::"public"."announcements_priority_enum"`);
        await queryRunner.query(`ALTER TABLE "announcements" ALTER COLUMN "priority" SET DEFAULT 'NORMAL'`);
        await queryRunner.query(`DROP TYPE "public"."announcements_priority_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."announcements_priority_enum_old" AS ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT')`);
        await queryRunner.query(`ALTER TABLE "announcements" ALTER COLUMN "priority" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "announcements" ALTER COLUMN "priority" TYPE "public"."announcements_priority_enum_old" USING "priority"::"text"::"public"."announcements_priority_enum_old"`);
        await queryRunner.query(`ALTER TABLE "announcements" ALTER COLUMN "priority" SET DEFAULT 'NORMAL'`);
        await queryRunner.query(`DROP TYPE "public"."announcements_priority_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."announcements_priority_enum_old" RENAME TO "announcements_priority_enum"`);
    }

}
