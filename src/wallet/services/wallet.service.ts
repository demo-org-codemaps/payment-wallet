import { BadRequestException, Injectable } from '@nestjs/common';
import { AppUtil, GetHeadersDto, HeadersDto, WalletImpact } from '../../shared';
import { WalletTransactionEntity } from '../entities';
import { DbWrapperService } from './db-wrapper.service';
import { FetchWalletsDto, MoneyDto, PaginationDto, WalletDto, WalletTransactionsDto } from '../dtos';
import { CurrencyCodeEnum } from '../../shared';
import { I18nService } from 'nestjs-i18n';
import { CONSTANTS } from '../../app.constants';
import { LogDecorator } from '../../core';
import { ApiWrapperService } from './api-wrapper.service';
import { AuthService } from '../../auth';

@Injectable()
export class WalletService {
  constructor(
    private readonly apiWrapper: ApiWrapperService,
    private readonly dbWrapper: DbWrapperService,
    private readonly i18n: I18nService,
    private readonly authService: AuthService
  ) {}

  @LogDecorator()
  async chargeWallet(headers: HeadersDto, dto: WalletDto, retailerId: string): Promise<string> {
    try {
      const { money, transactionType, comments } = dto;
      const { idempotencyKey } = headers;
      const balance = await this.fetchBalance(money.currency, retailerId);
      if (money.greaterThan(balance)) throw new BadRequestException('Insufficient Balance');
      let walletTransaction = await this.dbWrapper.findByIdempKey(headers.idempotencyKey);
      if (walletTransaction) walletTransaction.id;
      walletTransaction = await this.dbWrapper.createWalletTransaction({
        ...money,
        retailerId,
        transactionType,
        comments,
        impact: WalletImpact.OUT,
        idempotencyKey,
      });
      return walletTransaction.id;
    } catch (e) {
      throw e;
    }
  }

  @LogDecorator()
  async rechargeWallet(headers: HeadersDto, dto: WalletDto, retailerId: string): Promise<string> {
    try {
      const { money, transactionType, comments } = dto;
      const { idempotencyKey } = headers;
      let walletTransaction = await this.dbWrapper.findByIdempKey(idempotencyKey);
      if (walletTransaction) return walletTransaction.id;
      walletTransaction = await this.dbWrapper.createWalletTransaction({
        ...money,
        retailerId,
        transactionType,
        comments,
        impact: WalletImpact.IN,
        idempotencyKey,
      });
      return walletTransaction.id;
    } catch (e) {
      throw e;
    }
  }

  @LogDecorator()
  async fetchBalance(currency: CurrencyCodeEnum, retailerId: string): Promise<MoneyDto> {
    try {
      const balance = await this.dbWrapper.fetchBalance(currency, retailerId);
      return balance;
    } catch (e) {
      throw e;
    }
  }

  @LogDecorator()
  async fetchDatewiseTransactions(
    headers: GetHeadersDto,
    currency: CurrencyCodeEnum,
    retailerId: string
  ): Promise<Array<{ date: string; transactions: WalletTransactionEntity[] }>> {
    try {
      const [transactions] = await this.dbWrapper.fetchTranactions({ currency }, retailerId, 1000, 0);
      const dateWise = new Map<string, WalletTransactionEntity[]>();
      for (const t of transactions) {
        const dateKey = AppUtil.formatDate(t.createdAt);
        const trans = dateWise.get(dateKey) || [];
        const moneyDto = new MoneyDto(t.amount, t.currency).toJSON(); // money conversion to double
        const transactionType = await this.i18n.translate(CONSTANTS.ERROR_MESSAGE_KEY_PREFIX + t.transactionType, {
          lang: headers.language,
        });
        dateWise.set(dateKey, [...trans, { ...t, ...moneyDto, transactionType }]);
      }
      const returnData = [];
      for (const [key, value] of dateWise.entries()) {
        returnData.push({
          date: key,
          transactions: value,
        });
      }
      return returnData;
    } catch (e) {
      throw e;
    }
  }

  @LogDecorator()
  async getWallets(headers: GetHeadersDto, body: FetchWalletsDto): Promise<any> {
    try {
      // creating modified headers for interservice communication
      const modHeaders = new GetHeadersDto();
      modHeaders.authorization = await this.authService.generateServiceToken(headers.authorization);
      modHeaders.language = headers?.language;

      const { currency, pagination } = body;
      const { retailerId, phoneNumber } = body.filter || {};
      const { perPage, currentPage } = pagination;
      let results = [];
      let retailersData = [];

      if (phoneNumber) {
        retailersData = await this.apiWrapper.fetchRetailerByPhone(modHeaders, perPage, phoneNumber);
        results =
          retailersData.length > 0
            ? await this.dbWrapper.fetchWallets(currency, perPage, perPage * (currentPage - 1), retailersData[0].id)
            : [];
      } else {
        results = await this.dbWrapper.fetchWallets(currency, perPage, perPage * (currentPage - 1), retailerId);
        const retailerIds = results.map(({ retailerId }) => retailerId);
        retailersData = await this.apiWrapper.fetchRetailersDetails(modHeaders, perPage, retailerIds);
      }

      let totalRecords = 0;
      const wallets = results.map(res => {
        const { total, amount, balance, currency, retailerId, ...rest } = res;
        totalRecords = total;
        return {
          ...retailersData.find(({ id }) => id == retailerId),
          ...rest,
          currency,
          retailerId,
          money: new MoneyDto(parseInt(amount) || 0, currency),
          balance: new MoneyDto(parseInt(balance) || 0, currency),
        };
      });
      const totalPages = Math.ceil(totalRecords / perPage);
      const paginatedWallets = {
        wallets,
        pagination: {
          ...pagination,
          totalPages,
        },
      };
      return paginatedWallets;
    } catch (e) {
      throw e;
    }
  }

  @LogDecorator()
  async getWalletTransactions(body: WalletTransactionsDto): Promise<{ transactions: any; pagination: PaginationDto }> {
    try {
      const { retailerId, filter, pagination } = body;
      const { perPage, currentPage } = pagination;
      const [results, totalRecords] = await this.dbWrapper.fetchTranactions(
        filter,
        retailerId,
        perPage,
        perPage * (currentPage - 1)
      );
      const transactions = results.map(res => {
        const { amount, currency, ...rest } = res;
        return {
          ...rest,
          currency,
          money: new MoneyDto(amount || 0, currency),
        };
      });
      const totalPages = Math.ceil(totalRecords / perPage);
      const paginatedWallets = {
        transactions,
        pagination: {
          ...pagination,
          totalPages,
        },
      };
      return paginatedWallets;
    } catch (e) {
      throw e;
    }
  }
}
