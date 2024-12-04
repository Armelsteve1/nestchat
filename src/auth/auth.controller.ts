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
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiQuery } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @ApiResponse({ status: 400, description: 'Invalid data provided.' })
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @ApiOperation({ summary: 'Login an existing user' })
  @ApiResponse({ status: 200, description: 'Login successful.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Logout a user' })
  @ApiResponse({ status: 200, description: 'Logout successful.' })
  @ApiResponse({
    status: 401,
    description: 'Invalid token or user not found.',
  })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req) {
    const userId = req.user.userId;
    return this.authService.logout(userId);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get user status' })
  @ApiResponse({ status: 200, description: 'Status retrieved successfully.' })
  @ApiResponse({
    status: 401,
    description: 'Invalid token or user not found.',
  })
  @UseGuards(JwtAuthGuard)
  @Get('status')
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Optional user ID (otherwise extracted from token).',
  })
  getStatus(@Req() req, @Query('userId') userId?: number) {
    const id = userId || req.user.userId;
    return this.authService.getUserStatus(id);
  }
}
