import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MessagingService } from './messaging.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@ApiTags('Messaging')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @ApiOperation({ summary: 'Envoyer un message' })
  @Post()
  sendMessage(@Body() createMessageDto: CreateMessageDto, @Req() req) {
    const loggedInUserId = Number(req.user.userId);
    const senderId = Number(createMessageDto.senderId);

    if (senderId !== loggedInUserId) {
      throw new UnauthorizedException('You can only send messages as yourself');
    }

    return this.messagingService.sendMessage(
      senderId,
      createMessageDto.recipientId,
      createMessageDto.content,
    );
  }

  @ApiOperation({ summary: 'Récupérer les messages entre deux utilisateurs' })
  @Get(':userId1/:userId2')
  getMessagesBetweenUsers(
    @Param('userId1') userId1: number,
    @Param('userId2') userId2: number,
    @Req() req,
  ) {
    const loggedInUserId = Number(req.user.userId);
    if (loggedInUserId !== userId1 && loggedInUserId !== userId2) {
      throw new UnauthorizedException(
        'You can only view conversations you are part of',
      );
    }

    return this.messagingService.getMessagesBetweenUsers(userId1, userId2);
  }

  @ApiOperation({ summary: 'Marquer un message comme lu' })
  @Patch(':messageId/read')
  markAsRead(@Param('messageId') messageId: string) {
    return this.messagingService.markAsRead(messageId);
  }

  @ApiOperation({ summary: 'Modifier un message' })
  @Patch(':messageId')
  updateMessage(
    @Param('messageId') messageId: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @Req() req,
  ) {
    const loggedInUserId = Number(req.user.userId);
    return this.messagingService.updateMessage(
      messageId,
      loggedInUserId,
      updateMessageDto.content,
    );
  }

  @ApiOperation({ summary: 'Supprimer un message' })
  @Delete(':messageId')
  deleteMessage(@Param('messageId') messageId: string, @Req() req) {
    const loggedInUserId = Number(req.user.userId);
    return this.messagingService.deleteMessage(messageId, loggedInUserId);
  }
}
