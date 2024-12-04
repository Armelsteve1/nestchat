import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ description: "Sender's ID", example: 1 })
  @IsNumber()
  @IsNotEmpty()
  senderId: number;

  @ApiProperty({ description: "Recipient's ID", example: 2 })
  @IsNumber()
  @IsNotEmpty()
  recipientId: number;

  @ApiProperty({
    description: 'Message content',
    example: 'Hello, how are you?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
