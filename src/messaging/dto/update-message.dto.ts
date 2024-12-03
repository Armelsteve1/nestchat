import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMessageDto {
  @ApiProperty({
    description: 'Nouveau contenu du message',
    example: 'Message modifié avec succès.',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
