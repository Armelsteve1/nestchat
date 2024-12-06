import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagingService } from '../messaging.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, string>();
  private processedMessages = new Set<string>();

  constructor(private readonly messagingService: MessagingService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (!userId) {
      client.disconnect();
      return;
    }

    this.connectedClients.set(userId, client.id);
    client.join(`user_${userId}`);
  }

  handleDisconnect(client: Socket) {
    const userId = [...this.connectedClients.entries()].find(
      ([, clientId]) => clientId === client.id,
    )?.[0];

    if (userId) {
      this.connectedClients.delete(userId);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    data: { senderId: number; recipientId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data.senderId || !data.recipientId || !data.content) {
      return { status: 'error', message: 'Invalid payload' };
    }

    try {
      const savedMessage = await this.messagingService.sendMessage(
        data.senderId,
        data.recipientId,
        data.content,
      );

      if (this.processedMessages.has(savedMessage._id.toString())) {
        return { status: 'error', message: 'Message already processed' };
      }

      this.processedMessages.add(savedMessage._id.toString());

      this.server
        .to(`user_${data.recipientId}`)
        .emit('messageReceived', savedMessage);
      this.server
        .to(`user_${data.senderId}`)
        .emit('messageReceived', savedMessage);

      return { status: 'success', data: savedMessage };
    } catch (error) {
      throw error;
    }
  }
}
