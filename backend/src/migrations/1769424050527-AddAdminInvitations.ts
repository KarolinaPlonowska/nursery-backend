import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAdminInvitations1769424050527 implements MigrationInterface {
    name = 'AddAdminInvitations1769424050527'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "admin_invitations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "token" character varying NOT NULL, "invitedBy" character varying NOT NULL, "isAccepted" boolean NOT NULL DEFAULT false, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3648cb96bcc04ac5cbb7ca84c22" UNIQUE ("email"), CONSTRAINT "PK_0c710b9106ea89847bcf62bd3e1" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "admin_invitations"`);
    }

}
