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
import { SetRoutePolicy } from 'src/auth/decorators/set_route_policy.decorator';
import { RoutePolicy } from 'src/auth/enum/route-policy.enum';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Controller('juita/usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  @UseGuards(AuthTokenGuard)
  @SetRoutePolicy(RoutePolicy.getUsuario)
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':codcliente')
  @UseGuards(AuthTokenGuard)
  @SetRoutePolicy(RoutePolicy.getUsuario)
  findOne(@Param('codcliente') codcliente: string) {
    return this.usuarioService.findOne(codcliente);
  }

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    console.log('chegou aqui')
    return this.usuarioService.create(createUsuarioDto);
  }

  @Patch(':codusuario')
  @UseGuards(AuthTokenGuard)
  update(
    @Param('codusuario') codusuario: string,
    @Body() dto: UpdateUsuarioDto,
  ) {
    return this.usuarioService.update(codusuario, dto);
  }
}
