import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'test@test.com', description: 'Email of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Password of the user' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'Default Username',
    description: 'Username of the user',
    required: false,
  })
  @IsOptional()
  username?: string = 'Anonymous';

  @ApiProperty({
    example: '/default-avatar.png',
    description: 'Photo of the user',
    required: false,
  })
  @IsOptional()
  photo?: string = '/default-avatar.png';
}
