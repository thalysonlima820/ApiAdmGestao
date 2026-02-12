import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
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

  @IsEnum(RoutePolicy, { each: true })
  readonly ROUTEPOLICIES: RoutePolicy[];
}
