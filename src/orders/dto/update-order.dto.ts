import { PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @IsOptional()
  @IsString()
  readonly seat?: string;

  @IsOptional()
  @IsDateString()
  readonly date?: string;

  @IsOptional()
  @IsInt()
  readonly reservationId?: number;
}
