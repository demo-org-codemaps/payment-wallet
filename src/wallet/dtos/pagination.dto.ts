import { IsNotEmpty, IsPositive, ValidateIf } from 'class-validator';
import { Expose } from 'class-transformer';

export class PaginationDto {
  @Expose()
  @IsNotEmpty()
  @IsPositive()
  totalPages: number;

  @Expose()
  @IsNotEmpty()
  @IsPositive()
  perPage: number;

  @Expose()
  @IsNotEmpty()
  @IsPositive()
  @ValidateIf(o => o.totalPages >= o.currentPage)
  currentPage: number;
}
