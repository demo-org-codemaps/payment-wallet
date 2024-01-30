import { IsDateString, IsEnum, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { CurrencyCodeEnum, TransactionTypeEnum } from '../../shared';
import { PaginationDto } from './pagination.dto';

export class WalletTransactionsFilterDto {
  @Expose()
  @IsOptional()
  @IsEnum(CurrencyCodeEnum)
  currency: CurrencyCodeEnum;

  @Expose()
  @IsOptional()
  @IsEnum(TransactionTypeEnum, { each: true })
  transactionTypes: TransactionTypeEnum[];

  @Expose()
  @IsOptional()
  @IsDateString()
  fromDate: Date;

  @Expose()
  @IsOptional()
  @IsDateString()
  toDate: Date;
}

export class WalletTransactionsDto {
  @Expose()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PaginationDto)
  pagination: PaginationDto;

  @Expose()
  @ValidateNested()
  @Type(() => WalletTransactionsFilterDto)
  filter: WalletTransactionsFilterDto;

  @Expose()
  @IsNotEmpty()
  retailerId: string;
}
