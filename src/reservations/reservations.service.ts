import { Inject, Injectable } from '@nestjs/common';
import { addDays, endOfWeek, format, startOfWeek } from 'date-fns';
import { Repository } from 'typeorm';
import { Reservations } from 'src/entities/reservations.entity';

@Injectable()
export class ReservationsService {
  constructor(
    @Inject('RESERVATIONS_REPOSITORY')
    private reservationsRepository: Repository<Reservations>,
  ) {}

  async getAvailableDates(): Promise<string[]> {
    const availableDates = await this.reservationsRepository.query(`
      SELECT DISTINCT date FROM reservations
    `);

    return availableDates.map((entry) => entry.date);
  }

  async getAvailableSeats(date: Date): Promise<string> {
    const dateString = this.getDateString(date);
    const reservation = await this.reservationsRepository.findOne({
      select: ['availableSeats'],
      where: { date: dateString },
    });

    return reservation ? reservation.availableSeats : '';
  }

  private getDateString(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }

  async initializeAvailableDates(currentDate?: Date) {
    // 이번 주의 시작 날짜와 끝 날짜를 계산합니다.
    let date = currentDate;
    if (!date) {
      date = new Date();
    }

    const startOfCurrentWeek = startOfWeek(currentDate);
    const endOfCurrentWeek = endOfWeek(currentDate);
    const existingDates = new Set(await this.getAvailableDates());

    // 이번 주의 날짜를 생성하고 DB에 추가
    const datesToAdd: Date[] = [];
    let currentDateToAdd = startOfCurrentWeek;

    while (currentDateToAdd <= endOfCurrentWeek) {
      if (!existingDates.has(this.getDateString(currentDateToAdd))) {
        datesToAdd.push(currentDateToAdd);
      }
      currentDateToAdd = addDays(currentDateToAdd, 1);
    }

    datesToAdd.map(async (date) => {
      const result = this.reservationsRepository.create({
        date: this.getDateString(date),
        availableSeats: Array.from(
          { length: 50 },
          (_, index) => index + 1,
        ).join(','),
        created_at: new Date(),
        updated_at: null,
      });

      this.reservationsRepository.save(result);

      return result;
    });
  }
}
