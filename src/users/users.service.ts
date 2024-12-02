import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * @returns
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  /**
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /**
   * @param email
   * @returns
   */
  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  /**
   * @param userId
   * @param loggedInUserId
   * @param updateUserDto
   * @returns
   */
  async update(
    userId: number,
    loggedInUserId: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    console.log(
      `User ID to update: ${userId}, Logged in User ID: ${loggedInUserId}`,
    );

    if (userId !== loggedInUserId) {
      throw new UnauthorizedException('You can only update your own account');
    }

    const user = await this.findOne(userId);
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    const updatedUser = this.userRepository.merge(user, updateUserDto);
    return this.userRepository.save(updatedUser);
  }

  /**
   * @param userId
   * @param loggedInUserId
   */
  async remove(userId: number, loggedInUserId: number): Promise<void> {
    if (userId !== loggedInUserId) {
      throw new UnauthorizedException('You can only delete your own account');
    }

    const user = await this.findOne(userId);
    await this.userRepository.remove(user);
  }
}
