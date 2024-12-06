import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/schemas/users.schema';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<Partial<Repository<User>>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;

  beforeEach(async () => {
    userRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('test_token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should register a new user', async () => {
    const mockUser = {
      email: 'test@test.com',
      password: 'hashed_password',
      username: 'Anonymous',
      photo: '/default-avatar.png',
      isActive: true,
    };

    const savedUser = {
      id: 1,
      ...mockUser,
    };

    userRepository.create.mockReturnValue(mockUser as User);
    userRepository.save.mockResolvedValue(savedUser as User);

    const result = await authService.register({
      email: 'test@test.com',
      password: 'password',
    });

    expect(userRepository.create).toHaveBeenCalledWith(mockUser);
    expect(userRepository.save).toHaveBeenCalledWith(mockUser);
    expect(result).toEqual({
      token: 'test_token',
      userId: 1,
      username: 'Anonymous',
      photo: '/default-avatar.png',
      email: 'test@test.com',
      isActive: true,
    });
  });

  it('should log in a user with valid credentials', async () => {
    const mockUser = {
      id: 1,
      email: 'test@test.com',
      password: 'hashed_password',
      username: 'JohnDoe',
      photo: '/profile-picture.png',
      isActive: true,
    };

    userRepository.findOneBy.mockResolvedValue(mockUser as User);

    const result = await authService.login({
      email: 'test@test.com',
      password: 'password',
    });

    expect(userRepository.findOneBy).toHaveBeenCalledWith({
      email: 'test@test.com',
    });
    expect(userRepository.save).toHaveBeenCalledWith({
      ...mockUser,
      isActive: true,
    });
    expect(result).toEqual({
      token: 'test_token',
      userId: 1,
      username: 'JohnDoe',
      photo: '/profile-picture.png',
      email: 'test@test.com',
      isActive: true,
    });
  });
});
