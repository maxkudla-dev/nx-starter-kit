import { MigrationInterface, QueryRunner } from "typeorm";

const schema = process.env.DATABASE_SCHEMA || 'public';

export class InitialMigration1766873744474 implements MigrationInterface {
    name = 'InitialMigration1766873744474'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "${schema}"."profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" text NOT NULL, "last_name" text NOT NULL, "email" text NOT NULL, "phone_number" text NOT NULL, "account_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_5b49bd22c967ce2829ca8f17720" UNIQUE ("email"), CONSTRAINT "REL_48f07a756b8f321aa99b06aee1" UNIQUE ("account_id"), CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "${schema}"."accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" text NOT NULL, "password" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_477e3187cedfb5a3ac121e899c9" UNIQUE ("username"), CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "${schema}"."profiles" ADD CONSTRAINT "FK_48f07a756b8f321aa99b06aee11" FOREIGN KEY ("account_id") REFERENCES "${schema}"."accounts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "${schema}"."profiles" DROP CONSTRAINT "FK_48f07a756b8f321aa99b06aee11"`);
        await queryRunner.query(`DROP TABLE "${schema}"."accounts"`);
        await queryRunner.query(`DROP TABLE "${schema}"."profiles"`);
    }

}
