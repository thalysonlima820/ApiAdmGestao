import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { RoutePolicyGuard } from 'src/auth/guards/route-policy.guard';
import { SetRoutePolicy } from 'src/auth/decorators/set_route_policy.decorator';
import { RoutePolicy } from 'src/auth/enum/route-policy.enum';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @SetRoutePolicy(RoutePolicy.teste1)
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':codcliente')
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @SetRoutePolicy(RoutePolicy.teste2)
  findOne(@Param('codcliente') codcliente: string) {
    return this.usuarioService.findOne(codcliente);
  }

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }
}
