import { IsString } from 'class-validator';

export class LoginUsuarioDto {
  @IsString()
  CPF!: string;
}