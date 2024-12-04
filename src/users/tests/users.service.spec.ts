import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../schemas/users.schema';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Partial<Repository<User>>>;

  beforeEach(async () => {
    userRepository = {
      find: jest.fn(),
      findOneBy: jest.fn(),
      merge: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all users', async () => {
    const users: User[] = [
      {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_password',
        isActive: true,
      },
    ];
    userRepository.find.mockResolvedValue(users);

    const result = await service.findAll();

    expect(userRepository.find).toHaveBeenCalled();
    expect(result).toEqual(users);
  });

  it('should return a user by ID', async () => {
    const user: User = {
      id: 1,
      email: 'test@example.com',
      password: 'hashed_password',
      isActive: true,
    };
    userRepository.findOneBy.mockResolvedValue(user);

    const result = await service.findOne(1);

    expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    expect(result).toEqual(user);
  });

  it('should throw NotFoundException if user is not found by ID', async () => {
    userRepository.findOneBy.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('should return a user by email', async () => {
    const user: User = {
      id: 1,
      email: 'test@example.com',
      password: 'hashed_password',
      isActive: true,
    };
    userRepository.findOneBy.mockResolvedValue(user);

    const result = await service.findByEmail('test@example.com');

    expect(userRepository.findOneBy).toHaveBeenCalledWith({
      email: 'test@example.com',
    });
    expect(result).toEqual(user);
  });

  it('should throw NotFoundException if user is not found by email', async () => {
    userRepository.findOneBy.mockResolvedValue(null);

    await expect(
      service.findByEmail('nonexistent@example.com'),
    ).rejects.toThrow(NotFoundException);
  });

  it('should update a user', async () => {
    const user: User = {
      id: 1,
      email: 'test@example.com',
      password: 'old_password',
      isActive: true,
    };
    userRepository.findOneBy.mockResolvedValue(user);
    userRepository.merge.mockReturnValue({
      ...user,
      password: 'hashed_new_password',
    });
    userRepository.save.mockResolvedValue({
      ...user,
      password: 'hashed_new_password',
    });

    const updateUserDto = { password: 'new_password' };
    jest
      .spyOn(bcrypt, 'hash')
      .mockImplementation(async () => 'hashed_new_password');
    const result = await service.update(1, 1, updateUserDto);

    expect(userRepository.merge).toHaveBeenCalledWith(user, {
      password: 'hashed_new_password',
    });
    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ password: 'hashed_new_password' }),
    );
    expect(result.password).toBe('hashed_new_password');
  });

  it('should throw UnauthorizedException if user tries to update another account', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await expect(
      service.update(2, 1, { password: 'new_password' }),
    ).rejects.toThrow(UnauthorizedException);

    consoleSpy.mockRestore();
  });

  it('should delete a user', async () => {
    const user: User = {
      id: 1,
      email: 'test@example.com',
      password: 'password',
      isActive: true,
    };
    userRepository.findOneBy.mockResolvedValue(user);

    await service.remove(1, 1);

    expect(userRepository.remove).toHaveBeenCalledWith(user);
  });

  it('should throw UnauthorizedException if user tries to delete another account', async () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    await expect(service.remove(2, 1)).rejects.toThrow(UnauthorizedException);

    consoleSpy.mockRestore();
  });
});
