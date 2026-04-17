import { IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class CreateAvaliacaoDto {
  @IsString()
  @IsNotEmpty()
  NUMCUPOM!: string;

  @IsString()
  @IsNotEmpty()
  SERIE!: string;

  @IsNotEmpty()
  VALOR!: string | number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  AVALIACAO!: number;

  @IsOptional()
  @IsString()
  FALARSOBRE?: string;
}