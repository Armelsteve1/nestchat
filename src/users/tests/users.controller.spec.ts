import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { UpdateUserDto } from '../dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const mockUsersService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(
      UsersService,
    ) as jest.Mocked<UsersService>;
  });

  it('should return all users', async () => {
    const users = [
      {
        id: 1,
        email: 'test@example.com',
        password: 'hashed_password',
        isActive: true,
      },
    ];
    service.findAll.mockResolvedValue(users);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(users);
  });

  it('should return a user by ID', async () => {
    const user = {
      id: 1,
      email: 'test@example.com',
      password: 'hashed_password',
      isActive: true,
    };
    service.findOne.mockResolvedValue(user);

    const result = await controller.findOne(1);

    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual(user);
  });

  it('should return a user by email', async () => {
    const user = {
      id: 1,
      email: 'test@example.com',
      password: 'hashed_password',
      isActive: true,
    };
    service.findByEmail.mockResolvedValue(user);

    const result = await controller.findByEmail('test@example.com');

    expect(service.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(result).toEqual(user);
  });

  it('should update a user', async () => {
    const updatedUser = {
      id: 1,
      email: 'test@example.com',
      password: 'hashed_password',
      isActive: true,
    };
    service.update.mockResolvedValue(updatedUser);

    const req = { user: { userId: 1 } };
    const updateUserDto: UpdateUserDto = { password: 'new_password' };

    const result = await controller.update(1, updateUserDto, req);

    expect(service.update).toHaveBeenCalledWith(1, 1, updateUserDto);
    expect(result).toEqual(updatedUser);
  });

  it('should delete a user', async () => {
    const req = { user: { userId: 1 } };

    const result = await controller.remove(1, req);

    expect(service.remove).toHaveBeenCalledWith(1, 1);
    expect(result).toBeUndefined();
  });
});
