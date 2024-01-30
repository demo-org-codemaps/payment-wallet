import { classToPlain, Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional } from 'class-validator';

@Exclude()
export class GetHeadersDto {
  @Expose()
  @IsNotEmpty()
  authorization: string;

  @Expose()
  @IsOptional()
  language?: string;

  toJSON() {
    return classToPlain(this, { exposeUnsetFields: false });
  }
}
