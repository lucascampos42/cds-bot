import { IsString, IsNotEmpty } from 'class-validator';

export class WebSocketSendMessageDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  recipient: string;

  @IsString()
  @IsNotEmpty()
  text: string;
}
