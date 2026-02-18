import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdatePrecoDto {
  @IsNumber()
  @IsNotEmpty()
  readonly COD_PRODUTO: number;
  @IsNumber()
  @IsNotEmpty()
  readonly PRECOMINSUG: number;
}
