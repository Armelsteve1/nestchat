import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ description: "ID de l'expéditeur", example: 1 })
  @IsNumber()
  @IsNotEmpty()
  senderId: number;

  @ApiProperty({ description: 'ID du destinataire', example: 2 })
  @IsNumber()
  @IsNotEmpty()
  recipientId: number;

  @ApiProperty({
    description: 'Contenu du message',
    example: 'Bonjour, comment ça va ?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
