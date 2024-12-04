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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Retrieve all users' })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Retrieve a user by ID' })
  @Get(':id')
  findOne(@Param('id') userId: number) {
    return this.usersService.findOne(userId);
  }

  @ApiOperation({ summary: 'Retrieve a user by email' })
  @Get('search/by-email')
  findByEmail(@Query('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @ApiOperation({ summary: 'Update your account' })
  @Patch(':id')
  update(
    @Param('id') userId: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req,
  ) {
    const loggedInUserId = req.user.userId;
    return this.usersService.update(
      Number(userId),
      Number(loggedInUserId),
      updateUserDto,
    );
  }

  @ApiOperation({ summary: 'Delete your account' })
  @Delete(':id')
  remove(@Param('id') userId: number, @Req() req) {
    const loggedInUserId = req.user.userId;
    return this.usersService.remove(Number(userId), Number(loggedInUserId));
  }
}
