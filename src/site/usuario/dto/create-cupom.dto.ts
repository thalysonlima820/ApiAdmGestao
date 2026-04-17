import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCupomDto {
  @IsString()
  @IsNotEmpty()
  NUMCUPOM!: string;

  @IsString()
  @IsNotEmpty()
  SERIE!: string;

  @IsString()
  @IsNotEmpty()
  IDUSUARIO!: string;

  @IsNotEmpty()
  VALOR!: string | number;
}