import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWalletTransactionEntity1653943595922 implements MigrationInterface {
  name = 'CreateWalletTransactionEntity1653943595922';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`wallet_transaction_entity\` (\`id\` varchar(36) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`version\` int NOT NULL, \`retailer_id\` varchar(255) NOT NULL, \`amount\` bigint NOT NULL, \`currency\` varchar(255) NOT NULL DEFAULT 'PKR', \`idempotency_key\` varchar(255) NOT NULL, \`transaction_type\` varchar(255) NOT NULL DEFAULT 'ORDER_PAYMENT', \`comments\` text NOT NULL, \`impact\` enum ('IN', 'OUT') NOT NULL, UNIQUE INDEX \`IDX_e7f7aa91c69d411f55ce483032\` (\`idempotency_key\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX \`IDX_e7f7aa91c69d411f55ce483032\` ON \`wallet_transaction_entity\``);
    await queryRunner.query(`DROP TABLE \`wallet_transaction_entity\``);
  }
}
