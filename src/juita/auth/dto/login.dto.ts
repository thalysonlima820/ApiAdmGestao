import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  EMAIL: string;

  @IsString()
  @IsNotEmpty()
  SENHA: string;
}
