import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class MessagingService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  async sendMessage(senderId: number, recipientId: number, content: string) {
    const recentMessage = await this.messageModel
      .findOne({ senderId, recipientId, content })
      .sort({ createdAt: -1 })
      .exec();

    if (recentMessage && recentMessage.createdAt) {
      const now = new Date();
      const timeDifference = now.getTime() - recentMessage.createdAt.getTime();

      if (timeDifference < 500) {
        return recentMessage;
      }
    }
    const message = await this.messageModel.create({
      senderId,
      recipientId,
      content,
      isRead: false,
    });

    return message;
  }

  async getMessagesBetweenUsers(
    userId1: number,
    userId2: number,
  ): Promise<Message[]> {
    return this.messageModel
      .find({
        $or: [
          { senderId: userId1, recipientId: userId2 },
          { senderId: userId2, recipientId: userId1 },
        ],
      })
      .sort({ createdAt: 1 })
      .exec();
  }

  async markAsRead(messageId: string): Promise<Message> {
    const message = await this.messageModel.findById(messageId).exec();
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    message.isRead = true;
    return message.save();
  }

  async updateMessage(
    messageId: string,
    userId: number,
    content: string,
  ): Promise<Message> {
    const message = await this.messageModel.findById(messageId).exec();
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    if (message.senderId !== userId) {
      throw new UnauthorizedException('You can only edit your own messages');
    }
    message.content = content;
    return message.save();
  }

  async deleteMessage(messageId: string, userId: number): Promise<void> {
    const message = await this.messageModel.findById(messageId).exec();
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    if (message.senderId !== userId) {
      throw new UnauthorizedException('You can only delete your own messages');
    }
    const deleteResult = await this.messageModel.deleteOne({ _id: messageId });
    if (!deleteResult.deletedCount) {
      throw new NotFoundException('Failed to delete the message');
    }
  }
}
