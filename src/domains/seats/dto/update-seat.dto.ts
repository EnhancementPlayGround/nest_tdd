import {
  IsDateString,
  IsInt,
  IsJWT,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class UpdateSeatDto {
  @IsDateString()
  date: string;

  @IsInt()
  @Min(1)
  @Max(50)
  seatNumber: number;

  @IsUUID()
  userId: string;

  @IsJWT()
  queueToken: string;

  @IsString()
  status: 'created' | 'completed';
}
