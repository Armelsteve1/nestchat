import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMessageDto {
  @ApiProperty({
    description: 'New message content',
    example: 'Message updated successfully.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
