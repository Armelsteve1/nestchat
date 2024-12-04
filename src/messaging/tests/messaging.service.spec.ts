import { Test, TestingModule } from '@nestjs/testing';
import { MessagingService } from '../messaging.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageDocument } from '../schemas/message.schema';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('MessagingService', () => {
  let service: MessagingService;
  let messageModel: jest.Mocked<Model<MessageDocument>>;

  beforeEach(async () => {
    messageModel = {
      findOne: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      deleteOne: jest.fn(),
    } as unknown as jest.Mocked<Model<MessageDocument>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagingService,
        { provide: getModelToken('Message'), useValue: messageModel },
      ],
    }).compile();

    service = module.get<MessagingService>(MessagingService);
  });

  it('should send a message without duplication', async () => {
    const mockMessage = {
      senderId: 1,
      recipientId: 2,
      content: 'Hello',
      isRead: false,
    };
    const mockQuery = {
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(null),
    };

    messageModel.findOne.mockReturnValue(mockQuery as any);
    messageModel.create.mockResolvedValue(mockMessage as any);

    const result = await service.sendMessage(1, 2, 'Hello');

    expect(messageModel.findOne).toHaveBeenCalledWith({
      senderId: 1,
      recipientId: 2,
      content: 'Hello',
    });
    expect(messageModel.create).toHaveBeenCalledWith({
      senderId: 1,
      recipientId: 2,
      content: 'Hello',
      isRead: false,
    });
    expect(result).toEqual(mockMessage);
  });

  it('should retrieve messages between two users', async () => {
    const mockMessages = [
      { senderId: 1, recipientId: 2, content: 'Hello', isRead: false },
      { senderId: 2, recipientId: 1, content: 'Hi', isRead: true },
    ];

    const mockQuery = {
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockMessages),
    };

    messageModel.find.mockReturnValue(mockQuery as any);

    const result = await service.getMessagesBetweenUsers(1, 2);

    expect(messageModel.find).toHaveBeenCalledWith({
      $or: [
        { senderId: 1, recipientId: 2 },
        { senderId: 2, recipientId: 1 },
      ],
    });
    expect(result).toEqual(mockMessages);
  });

  it('should throw NotFoundException when marking a nonexistent message as read', async () => {
    messageModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    } as any);

    await expect(service.markAsRead('nonexistentId')).rejects.toThrow(
      new NotFoundException('Message not found'),
    );

    expect(messageModel.findById).toHaveBeenCalledWith('nonexistentId');
  });

  it('should mark a message as read', async () => {
    const mockMessage = {
      _id: 'msgId',
      senderId: 1,
      isRead: false,
      save: jest.fn().mockResolvedValue({
        _id: 'msgId',
        senderId: 1,
        isRead: true,
      }),
    };

    messageModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockMessage),
    } as any);

    const result = await service.markAsRead('msgId');

    expect(messageModel.findById).toHaveBeenCalledWith('msgId');
    expect(mockMessage.save).toHaveBeenCalled();
    expect(result.isRead).toBe(true);
  });

  it('should update a message', async () => {
    const mockMessage = {
      _id: 'msgId',
      senderId: 1,
      content: 'Old message',
      save: jest.fn().mockResolvedValue({
        _id: 'msgId',
        senderId: 1,
        content: 'Updated message',
      }),
    };

    messageModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockMessage),
    } as any);

    const result = await service.updateMessage('msgId', 1, 'Updated message');

    expect(messageModel.findById).toHaveBeenCalledWith('msgId');
    expect(mockMessage.save).toHaveBeenCalled();
    expect(result.content).toBe('Updated message');
  });

  it("should throw UnauthorizedException if user tries to update someone else's message", async () => {
    const mockMessage = {
      _id: 'msgId',
      senderId: 2,
      content: 'Message',
    };

    messageModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockMessage),
    } as any);

    await expect(
      service.updateMessage('msgId', 1, 'Updated message'),
    ).rejects.toThrow(
      new UnauthorizedException('You can only edit your own messages'),
    );

    expect(messageModel.findById).toHaveBeenCalledWith('msgId');
  });

  it('should delete a message', async () => {
    const mockMessage = { _id: 'msgId', senderId: 1 };

    messageModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockMessage),
    } as any);
    messageModel.deleteOne.mockResolvedValue({ deletedCount: 1 } as any);

    await service.deleteMessage('msgId', 1);

    expect(messageModel.findById).toHaveBeenCalledWith('msgId');
    expect(messageModel.deleteOne).toHaveBeenCalledWith({ _id: 'msgId' });
  });

  it("should throw UnauthorizedException if user tries to delete someone else's message", async () => {
    const mockMessage = { _id: 'msgId', senderId: 2 };

    messageModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockMessage),
    } as any);

    await expect(service.deleteMessage('msgId', 1)).rejects.toThrow(
      new UnauthorizedException('You can only delete your own messages'),
    );

    expect(messageModel.findById).toHaveBeenCalledWith('msgId');
  });

  it('should throw NotFoundException if trying to delete a nonexistent message', async () => {
    messageModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    } as any);

    await expect(service.deleteMessage('nonexistentId', 1)).rejects.toThrow(
      new NotFoundException('Message not found'),
    );

    expect(messageModel.findById).toHaveBeenCalledWith('nonexistentId');
  });
});
