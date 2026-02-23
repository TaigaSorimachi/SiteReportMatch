import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAvailabilityDto {
  @ApiProperty({ description: '稼働状況 (available/busy/on_leave/unavailable)', maxLength: 20 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  availability: string;
}
