import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { Public, RequestHeaders } from '../../../src/core';
import { WalletService } from '..';
import { FetchWalletsDto, MoneyDto, WalletDto, WalletTransactionsDto } from '../dtos';
import { AuthGuard } from '@nestjs/passport';
import { CONSTANTS } from '../../app.constants';
import { CurrencyCodeEnum } from '../../shared';
import { GetHeadersDto, HeadersDto } from '../../shared';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Wallet')
@Public()
@Controller()
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @ApiExcludeEndpoint()
  @UseGuards(AuthGuard(CONSTANTS.SERVICE_AUTH))
  @Post('charge')
  async chargeWalletApi(@RequestHeaders() headers: HeadersDto, @Body() body: WalletDto): Promise<Record<string, any>> {
    const res = await this.walletService.chargeWallet(headers, body, body.retailerId);
    return { data: res };
  }

  @ApiExcludeEndpoint()
  @UseGuards(AuthGuard(CONSTANTS.SERVICE_AUTH))
  @Post('recharge')
  async rechargeWalletApi(
    @RequestHeaders() headers: HeadersDto,
    @Body() body: WalletDto
  ): Promise<Record<string, any>> {
    const res = await this.walletService.rechargeWallet(headers, body, body.retailerId);
    return { data: res };
  }

  @UseGuards(AuthGuard([CONSTANTS.SERVICE_AUTH, CONSTANTS.CONSUMER_AUTH]))
  @Get('balance/:id')
  async getBalance(@Param('id') id: string, @Query('currency') currency: CurrencyCodeEnum): Promise<any> {
    if (!CurrencyCodeEnum[currency]) throw new BadRequestException('currency is not valid');
    const moneyDto = await this.walletService.fetchBalance(currency, id);
    const res = new MoneyDto(moneyDto.amount, moneyDto.currency).toJSON();
    return { data: res };
  }

  @UseGuards(AuthGuard(CONSTANTS.CONSUMER_AUTH))
  @Get('transactions/:id')
  async getWDatewiseTransactionsById(
    @Param('id') id: string,
    @RequestHeaders() headers: GetHeadersDto,
    @Query('currency') currency: CurrencyCodeEnum
  ): Promise<Record<string, any>> {
    const res = await this.walletService.fetchDatewiseTransactions(headers, currency, id);
    return { data: res };
  }

  /**
   * @deprecated The method should not be used, just to support first production app
   */
  @UseGuards(AuthGuard(CONSTANTS.CONSUMER_AUTH))
  @Get('transactions')
  async getWDatewiseTransactions(
    @RequestHeaders() headers: GetHeadersDto,
    @Req() req,
    @Query('currency') currency: CurrencyCodeEnum
  ): Promise<Record<string, any>> {
    const {
      tokenPayload: { id },
    } = req.user;
    const res = await this.walletService.fetchDatewiseTransactions(headers, currency, id);
    return { data: res };
  }

  @UseGuards(AuthGuard(CONSTANTS.CONSUMER_AUTH))
  @Post('walletUsers')
  @HttpCode(200)
  async getWallets(
    @RequestHeaders() headers: GetHeadersDto,
    @Body() body: FetchWalletsDto
  ): Promise<Record<string, any>> {
    const res = await this.walletService.getWallets(headers, body);
    return { data: res };
  }

  @UseGuards(AuthGuard(CONSTANTS.CONSUMER_AUTH))
  @Post('walletTransactions')
  @HttpCode(200)
  async getWalletTransactions(@Body() body: WalletTransactionsDto): Promise<Record<string, any>> {
    const res = await this.walletService.getWalletTransactions(body);
    return { data: res };
  }
}
