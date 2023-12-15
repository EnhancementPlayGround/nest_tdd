import { PartialType } from '@nestjs/swagger';
import { HoldSeatDto } from './hold-seat.dto';

export class ReserveSeatDto extends PartialType(HoldSeatDto) {}
