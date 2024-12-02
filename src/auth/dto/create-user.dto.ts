import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: "Adresse email de l'utilisateur",
    example: 'test@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "Mot de passe de l'utilisateur",
    example: 'password123',
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
