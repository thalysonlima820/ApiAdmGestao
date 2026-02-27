import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  IsArray,
  IsEnum,
  IsDateString,
  IsIn,
} from 'class-validator';
import { RoutePolicy } from 'src/juita/auth/enum/route-policy.enum';


export class CreateUsuarioDto {

  @IsString()
  @IsNotEmpty()
  readonly NOME: string;

  @IsEmail()
  @IsNotEmpty()
  readonly EMAIL: string;

  @IsString()
  @IsNotEmpty()
  readonly CPF: string;

  @IsString()
  @MinLength(4)
  readonly SENHA: string;

  @IsOptional()
  @IsDateString()
  readonly DATA_NASCIMENTO?: string;

  // 1 = ativo | 0 = inativo
  @IsOptional()
  @IsNumber()
  @IsIn([0, 1])
  readonly ATIVO?: number;

  // enum array
  @IsArray()
  @IsEnum(RoutePolicy, { each: true })
  readonly ROUTEPOLICIES: RoutePolicy[];
}