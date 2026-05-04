import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';
import { CreateCupomDto } from './dto/create-cupom.dto';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';

@Controller('site/usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post('cadastro')
  cadastro(@Body() data: CreateUsuarioDto) {
    return this.usuarioService.CadastroUsuario(data);
  }

  @Post('login')
  login(@Body() data: LoginUsuarioDto) {
    return this.usuarioService.LoginUsuario(data);
  }

  @Post('cupom')
  cupom(@Body() data: CreateCupomDto) {
    return this.usuarioService.CadastroCupom(data);
  }

  @Post('avaliacao')
  avaliacao(@Body() data: CreateAvaliacaoDto) {
    return this.usuarioService.CadastroAvaliacao(data);
  }

  @Post('getcupom')
  GetCupom(@Body('idusuario') idusuario: string) {
    return this.usuarioService.GetCupom(idusuario);
  }
  @Get('getcupom/item/:numped')
  GetCupomItem(@Param('numped') numped: string) {
    return this.usuarioService.GetCupomItem(numped);
  }
  @Get('sorteio')
  Sorteio() {
    return this.usuarioService.Sorteio()
  }
}
