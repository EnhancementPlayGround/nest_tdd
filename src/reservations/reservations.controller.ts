import { Controller, Get, Param, Query } from '@nestjs/common';
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
    const seats = await this.reservationsService.getAvailableSeats(
      new Date(date),
    );
    return { seats };
  }

  @Get('seats/:date/init')
  async initSeats(@Param('date') date: string) {
    this.reservationsService.initializeAvailableDates(new Date(date));
  }
}
