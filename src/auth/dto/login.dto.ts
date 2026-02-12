import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  NOME: string;

  @IsString()
  @IsNotEmpty()
  SENHA: string;
}
