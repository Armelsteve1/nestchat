import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/schemas/users.schema';
import * as bcrypt from 'bcryptjs';

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
    jest
      .spyOn(userRepository, 'create')
      .mockImplementation((user) => user as User);
    jest.spyOn(userRepository, 'save').mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      password: await bcrypt.hash('password', 10),
      isActive: false,
    } as User);

    const result = await authService.register({
      email: 'test@test.com',
      password: 'password',
    });

    expect(userRepository.create).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: expect.any(String),
    });
    expect(userRepository.save).toHaveBeenCalled();
    expect(result.access_token).toBe('test_token');
  });

  it('should throw an exception for invalid login credentials', async () => {
    jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

    await expect(
      authService.login({ email: 'test@test.com', password: 'password' }),
    ).rejects.toThrow('Invalid credentials');
  });

  it('should log in a user with valid credentials', async () => {
    const hashedPassword = await bcrypt.hash('password', 10);
    jest.spyOn(userRepository, 'findOneBy').mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      password: hashedPassword,
      isActive: false,
    } as User);

    const result = await authService.login({
      email: 'test@test.com',
      password: 'password',
    });

    expect(userRepository.findOneBy).toHaveBeenCalledWith({
      email: 'test@test.com',
    });
    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: true }),
    );
    expect(result.access_token).toBe('test_token');
  });

  it('should log out a user', async () => {
    jest.spyOn(userRepository, 'findOneBy').mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      isActive: true,
      password: 'hashed_password',
    } as User);

    const result = await authService.logout(1);

    expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ isActive: false }),
    );
    expect(result).toEqual({ message: 'Successfully logged out' });
  });

  it('should return user status', async () => {
    jest.spyOn(userRepository, 'findOneBy').mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      isActive: true,
      password: 'hashed_password',
    } as User);

    const result = await authService.getUserStatus(1);

    expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(result).toEqual({ isActive: true });
  });

  it('should throw an exception when user not found in getUserStatus', async () => {
    jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

    await expect(authService.getUserStatus(1)).rejects.toThrow('Invalid user');
  });

  it('should throw an exception when user not found in logout', async () => {
    jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(null);

    await expect(authService.logout(1)).rejects.toThrow('Invalid user');
  });
});
