import { Injectable } from '@nestjs/common';
import { WalletImpact } from '../../shared';
import { Between, Connection, In } from 'typeorm';
import { WalletTransactionEntity } from '../entities';
import { WalletTransactionRepository } from '../repositories';
import { CurrencyCodeEnum } from '../../shared/enums/currency-code.enum';
import { MoneyDto, WalletTransactionsFilterDto } from '../dtos';
import { camelCase } from 'changecase-objects';
import { getCurrencyAndRetailerChecks } from '../../shared/utils/check.util';

@Injectable()
export class DbWrapperService {
  constructor(
    private readonly connection: Connection,
    private readonly walletTransactionRepository: WalletTransactionRepository
  ) {}

  async createWalletTransaction(entity: Partial<WalletTransactionEntity>): Promise<WalletTransactionEntity> {
    const subtransaction: WalletTransactionEntity = await this.connection.transaction(async transManager => {
      const { identifiers } = await transManager.insert(WalletTransactionEntity, entity);
      return await transManager.findOne<WalletTransactionEntity>(WalletTransactionEntity, identifiers[0]['id']);
    });
    return subtransaction;
  }

  async fetchWalletTransaction(id: string): Promise<WalletTransactionEntity> {
    const walletTransaction: WalletTransactionEntity = await this.walletTransactionRepository.findOne(id);
    return walletTransaction;
  }

  async fetchTranactions(
    filter: Partial<WalletTransactionsFilterDto>,
    retailerId: string,
    take: number,
    skip: number
  ): Promise<[WalletTransactionEntity[], number]> {
    const { currency, transactionTypes, fromDate, toDate } = filter || {};
    const whereFilter = {
      retailerId,
      currency: currency ? currency : undefined,
      transactionType: transactionTypes?.length > 0 ? In(transactionTypes) : undefined,
      createdAt: fromDate && toDate ? Between(fromDate, toDate) : undefined,
    };
    const transactions = await this.walletTransactionRepository.findAndCount({
      where: Object.entries(whereFilter).reduce((a, [k, v]) => (v ? ((a[k] = v), a) : a), {}), // Delete undefined
      order: { createdAt: 'DESC' },
      take,
      skip,
    });
    return transactions;
  }

  async fetchBalance(currency: CurrencyCodeEnum, retailerId: string): Promise<MoneyDto> {
    const [{ balance }] = await this.connection.query(
      `SELECT SUM(amt) as balance FROM (
        SELECT 
          CASE WHEN impact = 'IN' THEN amount WHEN impact = 'OUT' THEN - amount ELSE 0 END AS amt 
        FROM 
          wallet_transaction_entity 
        WHERE 
          retailer_id = ?
        AND 
          currency = ?
      ) t;`,
      [retailerId, currency]
    );
    return new MoneyDto(parseInt(balance) || 0, currency);
  }

  /**
   * @deprecated It needs two queries to calculate balance. Use fetchBalance instead,
   */
  async executeSumQuery(impact: WalletImpact, currency: CurrencyCodeEnum, retailerId: string): Promise<MoneyDto> {
    const { sum } = await this.connection
      .createQueryBuilder(WalletTransactionEntity, 'wallet')
      .select('SUM(wallet.amount)', 'sum')
      .where('wallet.retailer_Id = :retailerId', { retailerId })
      .andWhere('wallet.impact = :impact', { impact })
      .andWhere('wallet.currency = :currency', { currency })
      .getRawOne();
    return new MoneyDto(parseInt(sum) || 0, currency);
  }

  async fetchWallets(
    currency: CurrencyCodeEnum | undefined,
    take: number,
    skip: number,
    retailerId?: string
  ): Promise<any[]> {
    const getCurrencyAndRetailerCheck = getCurrencyAndRetailerChecks(currency, retailerId);

    const results: any[] = await this.connection.query(
      `select 
        retailer_id,
        currency,
        sum(amount_1) as balance,
        (select count(distinct retailer_id, currency) from wallet_transaction_entity ${getCurrencyAndRetailerCheck}) as total,
        max(created_at) as created_at
      from (
        select 
          retailer_id,
              currency,
              created_at,
          case when impact = 'IN' then amount when impact = 'OUT' then - amount else 0 end as amount_1
        from wallet_transaction_entity
        ${getCurrencyAndRetailerCheck}
      ) as temp1
      group by retailer_id, currency
      limit ? offset ?;`,
      [take, skip]
    );
    return results.map(res =>
      camelCase({
        ...res,
        createdAt: res.created_at.toDateString(),
        updatedAt: res.created_at.toDateString(),
      })
    );
  }

  async findByIdempKey(idempotencyKey: string): Promise<WalletTransactionEntity> {
    const sunTransaction: WalletTransactionEntity = await this.walletTransactionRepository.findOne({ idempotencyKey });
    return sunTransaction;
  }
}
