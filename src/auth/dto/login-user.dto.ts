import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    description: "User's email address",
    example: 'test@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "User's password",
    example: 'password123',
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
