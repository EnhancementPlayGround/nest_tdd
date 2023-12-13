import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get('dates')
  async getAvailableDates() {
    const dates = await this.reservationsService.getAvailableDates();
    return { dates };
  }

  @Get('seats/:date')
  async getAvailableSeats(@Param('date') date: string) {
    const seats = await this.reservationsService.getAvailableSeats(date);
    return { seats: seats.split(',') };
  }

  @Get('seats/:date/init')
  async initSeats(@Param('date') date: string) {
    this.reservationsService.initializeAvailableDates(new Date(date));
  }

  @Post('reserve')
  async reserveSeat(
    @Body()
    body: {
      date: string;
      seatNumber: number;
      userId: string;
      queueToken: string;
    },
  ) {
    const { date, seatNumber, userId, queueToken } = body;
    return await this.reservationsService.reserveSeat(
      date,
      seatNumber,
      userId,
      queueToken,
    );
  }
}
