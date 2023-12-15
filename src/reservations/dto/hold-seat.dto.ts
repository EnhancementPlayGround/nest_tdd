import { IsDateString, IsInt, IsJWT, IsUUID, Max, Min } from 'class-validator';

export class HoldSeatDto {
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
}
