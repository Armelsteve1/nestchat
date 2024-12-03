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
import { MessagingService } from '../messaging/messaging.service';

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

  constructor(private readonly messagingService: MessagingService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (!userId) {
      console.error('[Server] Connection attempt without userId');
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
    } else {
      return client.id;
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    data: { senderId: number; recipientId: number; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data.senderId || !data.recipientId || !data.content) {
      console.error('[Server] Invalid message payload:', data);
      return { status: 'error', message: 'Invalid payload' };
    }

    try {
      const savedMessage = await this.messagingService.sendMessage(
        data.senderId,
        data.recipientId,
        data.content,
      );
      client.emit('messageSent', savedMessage);
      this.server
        .to(`user_${data.recipientId}`)
        .emit('messageReceived', savedMessage);

      return { status: 'success', data: savedMessage };
    } catch (error) {
      console.error('[Server] Error while handling sendMessage:', error);
      throw error;
    }
  }
}
