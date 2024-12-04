import { Test, TestingModule } from '@nestjs/testing';
import { MessagingGateway } from '../websocket/messaging.gateway';
import { MessagingService } from '../messaging.service';
import { Server } from 'socket.io';

describe('MessagingGateway', () => {
  let gateway: MessagingGateway;
  let service: jest.Mocked<MessagingService>;

  let mockServer: jest.Mocked<Server>;

  beforeEach(async () => {
    service = {
      sendMessage: jest.fn(),
    } as unknown as jest.Mocked<MessagingService>;

    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as unknown as jest.Mocked<Server>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagingGateway,
        {
          provide: MessagingService,
          useValue: service,
        },
      ],
    }).compile();

    gateway = module.get<MessagingGateway>(MessagingGateway);
    gateway.server = mockServer;
  });

  it('should handle client connection', () => {
    const mockClient: any = {
      id: 'socket1',
      handshake: { query: { userId: '1' } },
      join: jest.fn(),
      disconnect: jest.fn(),
    };

    gateway.handleConnection(mockClient);

    expect(mockClient.join).toHaveBeenCalledWith('user_1');
    expect(gateway['connectedClients'].get('1')).toBe('socket1');
  });

  it('should disconnect a client properly', () => {
    const mockClient: any = {
      id: 'socket1',
      handshake: { query: { userId: '1' } },
      join: jest.fn(),
    };

    gateway['connectedClients'].set('1', 'socket1');

    gateway.handleDisconnect(mockClient);

    expect(gateway['connectedClients'].has('1')).toBe(false);
  });

  it('should handle sendMessage and emit events', async () => {
    const mockClient: any = {
      id: 'socket1',
      emit: jest.fn(),
    };

    const mockData = {
      senderId: 1,
      recipientId: 2,
      content: 'Hello, World!',
    };

    const mockMessage = {
      senderId: 1,
      recipientId: 2,
      content: 'Hello, World!',
      isRead: false,
      _id: 'messageId',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    service.sendMessage.mockResolvedValue(mockMessage as any);

    const result = await gateway.handleSendMessage(mockData, mockClient);

    expect(service.sendMessage).toHaveBeenCalledWith(
      mockData.senderId,
      mockData.recipientId,
      mockData.content,
    );
    expect(mockClient.emit).toHaveBeenCalledWith('messageSent', mockMessage);
    expect(mockServer.to).toHaveBeenCalledWith('user_2');
    expect(mockServer.emit).toHaveBeenCalledWith(
      'messageReceived',
      mockMessage,
    );
    expect(result).toEqual({ status: 'success', data: mockMessage });
  });

  it('should return error for invalid sendMessage payload', async () => {
    const mockClient: any = {
      id: 'socket1',
      emit: jest.fn(),
    };

    const mockData = {
      senderId: null,
      recipientId: 2,
      content: '',
    };

    const result = await gateway.handleSendMessage(mockData, mockClient);

    expect(result).toEqual({ status: 'error', message: 'Invalid payload' });
    expect(service.sendMessage).not.toHaveBeenCalled();
  });

  it('should log an error when sendMessage fails', async () => {
    const mockClient: any = {
      id: 'socket1',
      emit: jest.fn(),
    };

    const mockData = {
      senderId: 1,
      recipientId: 2,
      content: 'Hello',
    };

    service.sendMessage.mockRejectedValue(new Error('Database error'));

    await expect(
      gateway.handleSendMessage(mockData, mockClient),
    ).rejects.toThrow('Database error');
  });
});
