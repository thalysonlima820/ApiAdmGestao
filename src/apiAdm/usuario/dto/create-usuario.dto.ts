import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { RoutePolicy } from 'src/auth/enum/route-policy.enum';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  readonly CODUSUARIO: any;

  @IsString()
  @IsNotEmpty()
  readonly NOME: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  readonly SENHA: string;

  @IsOptional()
  @IsNumber()
  readonly IDTELEGRAM?: number;

  @IsOptional()
  readonly ACTIVE?: any;

  @IsEnum(RoutePolicy, { each: true })
  readonly ROUTEPOLICIES: RoutePolicy[];

  @IsNotEmpty()
  @IsEmail()
  readonly EMAIL: string;
}
