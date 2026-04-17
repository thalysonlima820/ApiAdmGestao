import { IsEmail, IsString } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  NOME!: string;

  @IsEmail()
  EMAIL!: string;

  @IsString()
  CPF!: string;

  @IsString()
  TELEFONE!: string;

  @IsString()
  BAIRRO!: string;
}