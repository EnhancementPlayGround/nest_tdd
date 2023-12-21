import { IsString, IsDateString, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  readonly seat: string;

  @IsDateString()
  readonly date: string;

  @IsUUID()
  readonly userId: string;

  @IsUUID()
  readonly reservationId: number;

  @IsString()
  readonly paymentType: string;
}
