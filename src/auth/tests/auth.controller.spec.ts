import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      logout: jest.fn(),
      getUserStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(
      AuthService,
    ) as jest.Mocked<AuthService>;
  });

  describe('register', () => {
    it('should register a user and return a token', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const mockToken = {
        token: 'test_token',
        userId: 1,
        username: 'TestUser',
        photo: '/default-avatar.png',
        email: 'test@test.com',
        isActive: true,
      };

      authService.register.mockResolvedValue(mockToken);

      const result = await authController.register(createUserDto);

      expect(authService.register).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockToken);
    });
  });

  describe('login', () => {
    it('should login a user and return a token', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'test@example.com',
        password: 'password',
      };
      const mockToken = {
        token: 'test_token',
        userId: 1,
        username: 'TestUser',
        photo: '/default-avatar.png',
        email: 'test@test.com',
        isActive: true,
      };

      authService.login.mockResolvedValue(mockToken);

      const result = await authController.login(loginUserDto);

      expect(authService.login).toHaveBeenCalledWith(loginUserDto);
      expect(result).toEqual(mockToken);
    });
  });

  describe('logout', () => {
    it('should log out a user successfully', async () => {
      const req = { user: { userId: 1 } };

      authService.logout.mockResolvedValue({
        message: 'Successfully logged out',
      });

      const result = await authController.logout(req);

      expect(authService.logout).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Successfully logged out' });
    });
  });
});
