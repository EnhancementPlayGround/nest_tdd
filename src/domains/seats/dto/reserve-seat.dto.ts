import { PartialType } from '@nestjs/swagger';
import { UpdateSeatDto } from './update-seat.dto';

export class ReserveSeatDto extends PartialType(UpdateSeatDto) {}
