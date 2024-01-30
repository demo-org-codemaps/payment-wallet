import { BadRequestException, Logger } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CurrencyCodeEnum, GetHeadersDto, HeadersDto, TransactionTypeEnum } from '../../shared';
import {
  FetchWalletsDto,
  MoneyDto,
  PaginationDto,
  WalletDto,
  WalletsFilterDto,
  WalletTransactionsDto,
  WalletTransactionsFilterDto,
} from '../dtos';
import { DbWrapperService } from './db-wrapper.service';
import { WalletService } from './wallet.service';
import { I18nService } from 'nestjs-i18n';
import { ApiWrapperService } from './api-wrapper.service';
import { AuthService } from '../../auth';

describe('WalletService-1', () => {
  let walletService: WalletService;

  const mockDbWrapperService = {
    executeSumQuery: jest.fn(() => {
      return new MoneyDto(Number(), CurrencyCodeEnum.PKR);
    }),

    fetchTranactions: jest.fn(() => {
      return {
        transactions: [
          {
            id: 'ad489c69-6cd8-4146-89e7-5b27e1796445',
            createdAt: '2022-07-29T07:21:00.958Z',
            updatedAt: '2022-07-29T07:21:00.958Z',
            version: 1,
            retailerId: '105445',
            amount: 3500,
            currency: 'PKR',
            idempotencyKey: '4e12355d-a99e-4be2-bd4a-90d8804aa290',
            transactionType: 'PROMOTIONAL_TOPUP',
            comments: 'c1',
            impact: 'IN',
          },
        ],
      };
    }),

    chargeWallet: jest.fn(() => {
      return 0;
    }),

    findByIdempKey: jest.fn(() => {
      return {
        id: 'df4705e9-1a67-4dc1-ae28-d191099943c7',
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
      };
    }),

    createWalletTransaction: jest.fn(() => {
      return {
        id: 'df4705e9-1a67-4dc1-ae28-d191099943c7',
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
      };
    }),

    fetchBalance: jest.fn(() => {
      return {
        amount: 100,
        currency: 'PKR',
      };
    }),
  };

  const mockI18nService = {
    translate: jest.fn(() => {
      return 'translated-language';
    }),
  };

  const mockApiWrapperService = {};

  const mockAuthService = {
    generateServiceToken: jest.fn(() => {
      return true;
    }),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        WalletService,
        Logger,
        {
          provide: I18nService,
          useValue: mockI18nService,
        },
        {
          provide: DbWrapperService,
          useValue: mockDbWrapperService,
        },
        {
          provide: ApiWrapperService,
          useValue: mockApiWrapperService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    walletService = moduleRef.get<WalletService>(WalletService);
  });

  describe('chargeWallet with 0', () => {
    const res = expect.any(String);

    const headerDto = new HeadersDto();
    headerDto.authorization = 'authorization';
    headerDto.idempotencyKey = 'idempotency-key';
    headerDto.language = 'english';

    const walletDto = new WalletDto();
    walletDto.retailerId = 'retailer-id';
    walletDto.comments = 'comments';
    walletDto.money = new MoneyDto(0, CurrencyCodeEnum.PKR);
    walletDto.transactionType = TransactionTypeEnum.PROMOTIONAL_TOPUP;

    it('should return transaction id', async () => {
      expect(await walletService.chargeWallet(headerDto, walletDto, 'retailer-id')).toEqual(res);
    });
  });

  describe('chargeWallet with more than in wallet', () => {
    const headerDto = new HeadersDto();
    headerDto.authorization = 'authorization';
    headerDto.idempotencyKey = 'idempotency-key';
    headerDto.language = 'english';

    const walletDto = new WalletDto();
    walletDto.retailerId = 'retailer-id';
    walletDto.comments = 'comments';
    walletDto.money = new MoneyDto(400, CurrencyCodeEnum.PKR);
    walletDto.transactionType = TransactionTypeEnum.PROMOTIONAL_TOPUP;

    jest
      .spyOn(WalletService.prototype, 'fetchBalance')
      .mockImplementation()
      .mockResolvedValue(new MoneyDto(200, CurrencyCodeEnum.PKR));

    it('should return error', async () => {
      try {
        await walletService.chargeWallet(headerDto, walletDto, 'retailer-id');
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe('Insufficient Balance');
      }
    });
  });

  describe('chargeWallet with less than in wallet', () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    const res = expect.any(String);

    const headerDto = new HeadersDto();
    headerDto.authorization = 'authorization';
    headerDto.idempotencyKey = 'idempotency-key';
    headerDto.language = 'english';

    const walletDto = new WalletDto();
    walletDto.retailerId = 'retailer-id';
    walletDto.comments = 'comments';
    walletDto.money = new MoneyDto(30, CurrencyCodeEnum.PKR);
    walletDto.transactionType = TransactionTypeEnum.PROMOTIONAL_TOPUP;

    jest
      .spyOn(WalletService.prototype, 'fetchBalance')
      .mockImplementation()
      .mockResolvedValue(new MoneyDto(200, CurrencyCodeEnum.PKR));

    it('should return transaction id', async () => {
      expect(await walletService.chargeWallet(headerDto, walletDto, 'retailer-id')).toEqual(res);
    });
  });

  describe('rechargeWallet', () => {
    const res = expect.any(String);

    const headerDto = new HeadersDto();
    headerDto.authorization = 'authorization';
    headerDto.idempotencyKey = 'idempotency-key';
    headerDto.language = 'english';

    const walletDto = new WalletDto();
    walletDto.retailerId = 'retailer-id';
    walletDto.comments = 'comments';
    walletDto.money = new MoneyDto(0, CurrencyCodeEnum.PKR);
    walletDto.transactionType = TransactionTypeEnum.PROMOTIONAL_TOPUP;

    it('should return transaction id', async () => {
      expect(await walletService.rechargeWallet(headerDto, walletDto, 'retailer-id')).toEqual(res);
    });
  });

  describe('fetchBalance', () => {
    const res = {
      amount: expect.any(Number),
      currency: expect.any(String),
    };

    it('should return money dto object', async () => {
      expect(await walletService.fetchBalance(CurrencyCodeEnum.PKR, 'retailer-id')).toEqual(res);
    });
  });
});

describe('WalletService-2', () => {
  let walletService: WalletService;

  const mockDbWrapperService = {
    executeSumQuery: jest.fn(() => {
      return new MoneyDto(Number(), CurrencyCodeEnum.PKR);
    }),

    fetchTranactions: jest.fn(() => {
      return [
        [
          {
            id: 'ad489c69-6cd8-4146-89e7-5b27e1796445',
            createdAt: '2022-07-29T07:21:00.958Z',
            updatedAt: '2022-07-29T07:21:00.958Z',
            version: 1,
            retailerId: '105445',
            amount: 3500,
            currency: 'PKR',
            idempotencyKey: '4e12355d-a99e-4be2-bd4a-90d8804aa290',
            transactionType: 'PROMOTIONAL_TOPUP',
            comments: 'c1',
            impact: 'IN',
          },
        ],
        1,
      ];
    }),

    chargeWallet: jest.fn(() => {
      return 0;
    }),

    findByIdempKey: jest.fn(() => {
      return {
        id: 'df4705e9-1a67-4dc1-ae28-d191099943c7',
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
      };
    }),

    createWalletTransaction: jest.fn(() => {
      return {
        id: 'df4705e9-1a67-4dc1-ae28-d191099943c7',
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
      };
    }),

    fetchBalance: jest.fn(() => {
      return {
        amount: 100,
        currency: 'PKR',
      };
    }),

    fetchWallets: jest.fn(() => {
      return [
        {
          createdAt: 'Mon Sep 05 2022',
          id: '7f4a0a79-45c5-41a4-b86a-6e46c679e3dc',
          updatedAt: 'Mon Sep 05 2022',
          version: 1,
          retailerId: '11840',
          amount: 5000,
          currency: 'PKR',
          idempotencyKey: 'ffd00762-d4a9-4977-8a8b-86a0ceeb1a88_OUT',
          transactionType: 'ORDER_REFUND',
          comments: null,
          impact: 'IN',
          balance: '9461800',
          total: 44,
        },
      ];
    }),

    fetchRetailerByPhone: jest.fn(() => {
      return {
        id: 'id',
        phone: 'phone',
        name: 'name',
        businessUnitId: 'businessUnitId',
      };
    }),
  };

  const mockI18nService = {
    translate: jest.fn(() => {
      return 'translated-language';
    }),
  };

  const mockApiWrapperService = {
    fetchRetailersDetails: jest.fn(() => {
      return [
        {
          id: 'id',
          phone: 'phone',
          name: 'name',
          businessUnitId: 'businessUnitId',
        },
      ];
    }),

    fetchRetailerByPhone: jest.fn(() => {
      return {
        id: 'id',
        phone: 'phone',
        name: 'name',
        businessUnitId: 'businessUnitId',
      };
    }),
  };

  const mockAuthService = {
    generateServiceToken: jest.fn(() => {
      return true;
    }),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        WalletService,
        Logger,
        {
          provide: I18nService,
          useValue: mockI18nService,
        },
        {
          provide: DbWrapperService,
          useValue: mockDbWrapperService,
        },
        {
          provide: ApiWrapperService,
          useValue: mockApiWrapperService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    walletService = moduleRef.get<WalletService>(WalletService);
  });

  describe('getWalletTransactions', () => {
    const res = expect.any(Object);

    const paginationData = {
      totalPages: 1,
      perPage: 1,
      currentPage: 1,
    } as PaginationDto;

    const filterData = {
      currency: 'PKR',
      transactionTypes: ['ORDER_PAYMENT', 'SELF_TOPUP'],
      fromDate: new Date('2022-09-01T08:00:15.920Z'),
      toDate: new Date('2022-01-01T08:00:15.920Z'),
    } as WalletTransactionsFilterDto;

    const body = {
      pagination: paginationData,
      filter: filterData,
      retailerId: '10503',
    } as WalletTransactionsDto;

    it('should return wallet transaction with pagination', async () => {
      expect(await walletService.getWalletTransactions(body)).toEqual(res);
    });
  });

  describe('getWallets-1', () => {
    const res = expect.any(Object);

    const paginationData = {
      totalPages: 1,
      perPage: 1,
      currentPage: 1,
    } as PaginationDto;

    const headers = {
      authorization: 'authorization',
      idempotencyKey: 'idempotency-key',
      language: 'english',
    } as HeadersDto;

    const filterData = {
      phoneNumber: '923125328555',
    } as WalletsFilterDto;

    const body = {
      pagination: paginationData,
      filter: filterData,
      currency: CurrencyCodeEnum.PKR,
    } as FetchWalletsDto;

    it('should return wallet transaction with pagination', async () => {
      expect(await walletService.getWallets(headers, body)).toEqual(res);
    });
  });

  describe('getWallets-2', () => {
    const res = expect.any(Object);

    const paginationData = {
      totalPages: 1,
      perPage: 1,
      currentPage: 1,
    } as PaginationDto;

    const headers = {
      authorization: 'authorization',
      idempotencyKey: 'idempotency-key',
      language: 'english',
    } as HeadersDto;

    const body = {
      pagination: paginationData,
      currency: CurrencyCodeEnum.PKR,
    } as FetchWalletsDto;

    it('should return wallet transaction with pagination', async () => {
      expect(await walletService.getWallets(headers, body)).toEqual(res);
    });
  });

  describe('getDateWiseTransactions-1', () => {
    const res = expect.any(Object);

    const headers = {
      authorization: 'authorization',
      language: 'english',
    } as GetHeadersDto;

    it('should return wallet transaction with pagination', async () => {
      expect(await walletService.fetchDatewiseTransactions(headers, CurrencyCodeEnum.PKR, 'retailer-id')).toEqual(res);
    });
  });
});
