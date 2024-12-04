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
      const mockToken = { access_token: 'test_token' };

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
      const mockToken = { access_token: 'test_token' };

      authService.login.mockResolvedValue(mockToken);

      const result = await authController.login(loginUserDto);

      expect(authService.login).toHaveBeenCalledWith(loginUserDto);
      expect(result).toEqual(mockToken);
    });

    it('should throw an exception for invalid login credentials', async () => {
      const loginUserDto: LoginUserDto = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      };

      authService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(authController.login(loginUserDto)).rejects.toThrow(
        'Invalid credentials',
      );
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

    it('should throw an exception if user not found during logout', async () => {
      const req = { user: { userId: 999 } };

      authService.logout.mockRejectedValue(
        new UnauthorizedException('Invalid user'),
      );

      await expect(authController.logout(req)).rejects.toThrow('Invalid user');
    });
  });

  describe('getStatus', () => {
    it('should return the user status', async () => {
      const req = { user: { userId: 1 } };
      const mockStatus = { isActive: true };

      authService.getUserStatus.mockResolvedValue(mockStatus);

      const result = await authController.getStatus(req);

      expect(authService.getUserStatus).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockStatus);
    });

    it('should return the user status when userId is provided as a query param', async () => {
      const req = { user: { userId: 1 } };
      const mockStatus = { isActive: true };

      authService.getUserStatus.mockResolvedValue(mockStatus);

      const result = await authController.getStatus(req, 2);

      expect(authService.getUserStatus).toHaveBeenCalledWith(2);
      expect(result).toEqual(mockStatus);
    });

    it('should throw an exception if user not found', async () => {
      const req = { user: { userId: 999 } };

      authService.getUserStatus.mockRejectedValue(
        new UnauthorizedException('Invalid user'),
      );

      await expect(authController.getStatus(req)).rejects.toThrow(
        'Invalid user',
      );
    });
  });
});
