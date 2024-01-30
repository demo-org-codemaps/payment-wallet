import { EntityRepository, Repository } from 'typeorm';
import { WalletTransactionEntity } from '../entities';

@EntityRepository(WalletTransactionEntity)
export class WalletTransactionRepository extends Repository<WalletTransactionEntity> {}
