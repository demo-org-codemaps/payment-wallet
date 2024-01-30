import { MigrationInterface, QueryRunner } from 'typeorm';

export class commentnull1654086466410 implements MigrationInterface {
  name = 'commentnull1654086466410';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`wallet_transaction_entity\` CHANGE \`comments\` \`comments\` text NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`wallet_transaction_entity\` CHANGE \`comments\` \`comments\` text NOT NULL`);
  }
}
