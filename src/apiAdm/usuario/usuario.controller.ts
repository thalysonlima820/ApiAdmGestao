import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { RoutePolicyGuard } from 'src/auth/guards/route-policy.guard';
import { SetRoutePolicy } from 'src/auth/decorators/set_route_policy.decorator';
import { RoutePolicy } from 'src/auth/enum/route-policy.enum';
import { UseInterceptors } from '@nestjs/common';
import { EncryptResponseInterceptor } from 'src/common/interceptors/encrypt-response.interceptor';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @UseInterceptors(EncryptResponseInterceptor)
  @SetRoutePolicy(RoutePolicy.getUsuario)
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':codcliente')
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @UseInterceptors(EncryptResponseInterceptor)
  @SetRoutePolicy(RoutePolicy.getUsuario)
  findOne(@Param('codcliente') codcliente: string) {
    return this.usuarioService.findOne(codcliente);
  }

  @Post()
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
   @SetRoutePolicy(RoutePolicy.upsertUsuario)
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  @Patch(':codusuario')
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
   @SetRoutePolicy(RoutePolicy.upsertUsuario)
  update(
    @Param('codusuario') codusuario: string,
    @Body() updateUsuario: UpdateUsuarioDto,
  ) {
    return this.usuarioService.Update(codusuario, updateUsuario);
  }
}
