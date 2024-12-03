import { Module } from '@nestjs/common';
import { MessagingGateway } from './messaging.gateway';
import { MessagingService } from '../messaging/messaging.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from '../messaging/schemas/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  providers: [MessagingGateway, MessagingService],
  exports: [MessagingGateway],
})
export class WebSocketModule {}
