import { IsEnum, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { CurrencyCodeEnum } from '../../shared';
import { PaginationDto } from './pagination.dto';

export class WalletsFilterDto {
  @Expose()
  @IsOptional()
  retailerId: string;

  @Expose()
  @IsOptional()
  phoneNumber: string;
}

export class FetchWalletsDto {
  @Expose()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => PaginationDto)
  pagination: PaginationDto;

  @Expose()
  @IsOptional()
  @IsEnum(CurrencyCodeEnum)
  currency: CurrencyCodeEnum | undefined;

  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => WalletsFilterDto)
  filter: WalletsFilterDto;
}
