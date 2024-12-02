import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiQuery } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: "Inscription d'un nouvel utilisateur" })
  @ApiResponse({ status: 201, description: 'Utilisateur inscrit avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @ApiOperation({ summary: "Connexion d'un utilisateur existant" })
  @ApiResponse({ status: 200, description: 'Connexion réussie.' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides.' })
  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: "Déconnexion d'un utilisateur" })
  @ApiResponse({ status: 200, description: 'Déconnexion réussie.' })
  @ApiResponse({
    status: 401,
    description: 'Token invalide ou utilisateur non trouvé.',
  })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req) {
    const userId = req.user.userId;
    return this.authService.logout(userId);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: "Obtenir le statut de l'utilisateur" })
  @ApiResponse({ status: 200, description: 'Statut retourné avec succès.' })
  @ApiResponse({
    status: 401,
    description: 'Token invalide ou utilisateur non trouvé.',
  })
  @UseGuards(JwtAuthGuard)
  @Get('status')
  @ApiQuery({
    name: 'userId',
    required: false,
    description: "ID de l'utilisateur (facultatif, sinon extrait du token)",
  })
  getStatus(@Req() req, @Query('userId') userId?: number) {
    const id = userId || req.user.userId;
    return this.authService.getUserStatus(id);
  }
}
