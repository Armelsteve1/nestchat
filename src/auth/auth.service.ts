import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/schemas/users.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      username: createUserDto.username || 'Anonymous',
      photo: createUserDto.photo || '/default-avatar.png',
      isActive: true,
    });

    const savedUser = await this.userRepository.save(user);
    return this.generateResponse(savedUser);
  }

  async login(loginUserDto: LoginUserDto) {
    const user = await this.userRepository.findOneBy({
      email: loginUserDto.email,
    });
    if (
      !user ||
      !(await bcrypt.compare(loginUserDto.password, user.password))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }
    user.isActive = true;
    await this.userRepository.save(user);
    return this.generateResponse(user);
  }

  async logout(userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    user.isActive = false;
    await this.userRepository.save(user);

    return { message: 'Successfully logged out' };
  }

  async getUserStatus(userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    return { isActive: user.isActive };
  }

  private generateResponse(user: User) {
    return {
      token: this.jwtService.sign(
        { email: user.email, sub: user.id },
        { expiresIn: '15m' },
      ),
      userId: user.id,
      username: user.username || 'Anonymous',
      photo: user.photo || '/default-avatar.png',
      email: user.email,
      isActive: user.isActive,
    };
  }
}
