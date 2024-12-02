import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Récupérer tous les utilisateurs' })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Récupérer un utilisateur par ID' })
  @Get(':id')
  findOne(@Param('id') userId: number) {
    return this.usersService.findOne(userId);
  }

  @ApiOperation({ summary: 'Récupérer un utilisateur par email' })
  @Get('search/by-email')
  findByEmail(@Query('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @ApiOperation({ summary: 'Mettre à jour votre compte' })
  @Patch(':id')
  update(
    @Param('id') userId: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
  ) {
    const loggedInUserId = req.user.userId;
    console.log(
      `Updating User ID: ${userId}, Logged in User ID: ${loggedInUserId}`,
    );
    return this.usersService.update(userId, loggedInUserId, updateUserDto);
  }

  @ApiOperation({ summary: 'Supprimer votre compte' })
  @Delete(':id')
  remove(@Param('id') userId: number, @Req() req) {
    const loggedInUserId = req.user.userId;
    return this.usersService.remove(userId, loggedInUserId);
  }
}
