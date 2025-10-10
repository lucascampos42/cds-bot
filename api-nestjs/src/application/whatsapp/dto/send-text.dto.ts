import { IsNotEmpty, IsString } from 'class-validator';

export class SendTextDto {
  @IsString()
  @IsNotEmpty()
  jid!: string; // exemplo: 5511999999999@s.whatsapp.net

  @IsString()
  @IsNotEmpty()
  text!: string;
}