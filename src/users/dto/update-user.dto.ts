import { IsOptional, IsString, IsEmail } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
