import { Test } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from '../services/wallet.service';
import { CurrencyCodeEnum, GetHeadersDto, HeadersDto, TransactionTypeEnum } from '../../shared';
import { MoneyDto, PaginationDto, WalletDto, WalletTransactionsDto, WalletTransactionsFilterDto } from '../dtos';

describe('WalletController', () => {
  let walletController: WalletController;

  const mockWalletService = {
    fetchBalance: jest.fn(() => {
      return new MoneyDto(0, CurrencyCodeEnum.PKR);
    }),

    fetchTranactions: jest.fn(() => {
      return [
        {
          date: '5/26/2022',
          transactions: [
            {
              id: 'df4705e9-1a67-4dc1-ae28-d191099943c4',
              createdAt: '2022-05-26T09:38:47.664Z',
              updatedAt: '2022-05-26T09:38:47.664Z',
              version: 1,
              retailerId: '10504',
              amount: 100,
              currency: 'PKR',
              idempotencyKey: '943cc06d-f1e6-4913-9183-7f65510c59b9_OUT',
              transactionType: 'ORDER_REFUND',
              comments: '',
              impact: 'IN',
            },
          ],
        },
      ];
    }),

    chargeWallet: jest.fn(() => {
      return 'transaction-id';
    }),

    rechargeWallet: jest.fn(() => {
      return 'transaction-id';
    }),

    getWalletTransactions: jest.fn(() => {
      return {
        name: 'SUCCESS',
        message: 'Operation was successful',
        data: {
          transactions: [
            {
              id: 'ad489c69-6cd8-4146-89e7-5b27e1796445',
              createdAt: '2022-07-29T07:21:00.958Z',
              updatedAt: '2022-07-29T07:21:00.958Z',
              version: 1,
              retailerId: '10503',
              idempotencyKey: '4e12355d-a99e-4be2-bd4a-90d8804aa290',
              transactionType: 'ORDER_PAYMENT',
              comments: 'c1',
              impact: 'OUT',
              currency: 'PKR',
              money: {
                amount: 3500,
                currency: 'PKR',
              },
            },
          ],
          pagination: {
            totalPages: 13,
            perPage: 1,
            currentPage: 1,
          },
        },
      };
    }),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [WalletService],
    })
      .overrideProvider(WalletService)
      .useValue(mockWalletService)
      .compile();

    walletController = moduleRef.get<WalletController>(WalletController);
  });

  describe('getBalanceController', () => {
    const res = {
      data: {
        amount: expect.any(Number),
        currency: expect.any(String),
      },
    };

    it('should return balance of a wallet', async () => {
      expect(await walletController.getBalance('ef81f2d1-b4f6-4926-85ba-64299203e1d8', CurrencyCodeEnum.PKR)).toEqual(
        res
      );
    });
  });

  describe('getWalletTransactionsController', () => {
    const res = {
      data: {
        name: expect.any(String),
        message: expect.any(String),
        data: {
          transactions: [
            {
              id: expect.any(String),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
              version: expect.any(Number),
              retailerId: expect.any(String),
              idempotencyKey: expect.any(String),
              transactionType: expect.any(String),
              comments: expect.any(String),
              impact: expect.any(String),
              currency: expect.any(String),
              money: {
                amount: expect.any(Number),
                currency: expect.any(String),
              },
            },
          ],
          pagination: {
            totalPages: expect.any(Number),
            perPage: expect.any(Number),
            currentPage: expect.any(Number),
          },
        },
      },
    };

    it('should return wallet transactions', async () => {
      const headerDto = new GetHeadersDto();
      headerDto.authorization = 'authorization';
      headerDto.language = 'English';

      const pagination = {
        totalPages: 1,
        perPage: 1,
        currentPage: 1,
      } as PaginationDto;

      const filter = {
        currency: CurrencyCodeEnum.PKR,
        transactionTypes: [TransactionTypeEnum.SELF_TOPUP, TransactionTypeEnum.ORDER_PAYMENT],
        fromDate: new Date('2022-07-01T08:00:15.920Z'),
        toDate: new Date('2022-08-01T08:00:15.920Z'),
      } as WalletTransactionsFilterDto;

      const body = {
        pagination,
        filter,
        retailerId: '10503',
      };
      expect(await walletController.getWalletTransactions(body)).toEqual(res);
    });
  });

  describe('chargeWalletApiController', () => {
    const res = {
      data: expect.any(String),
    };

    const headerDto = new HeadersDto();
    headerDto.authorization = 'authorization';
    headerDto.idempotencyKey = 'idempotency-key';
    headerDto.language = 'english';

    const walletDto = new WalletDto();
    walletDto.retailerId = 'retailer-id';
    walletDto.comments = 'comments';
    walletDto.money = new MoneyDto(50, CurrencyCodeEnum.PKR);
    walletDto.transactionType = TransactionTypeEnum.PROMOTIONAL_TOPUP;

    it('should return wallet transaction id', async () => {
      expect(await walletController.chargeWalletApi(headerDto, walletDto)).toEqual(res);
    });
  });

  describe('rechargeWalletApiController', () => {
    const res = {
      data: expect.any(String),
    };

    const headerDto = new HeadersDto();
    headerDto.authorization = 'authorization';
    headerDto.idempotencyKey = 'idempotency-key';
    headerDto.language = 'english';

    const walletDto = new WalletDto();
    walletDto.retailerId = 'retailer-id';
    walletDto.comments = 'comments';
    walletDto.money = new MoneyDto(50, CurrencyCodeEnum.PKR);
    walletDto.transactionType = TransactionTypeEnum.PROMOTIONAL_TOPUP;

    it('should return wallet transaction id', async () => {
      expect(await walletController.rechargeWalletApi(headerDto, walletDto)).toEqual(res);
    });
  });
});
