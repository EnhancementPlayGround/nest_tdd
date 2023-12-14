import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { addDays, endOfWeek, format, startOfWeek } from 'date-fns';
import { Repository } from 'typeorm';
import { Reservations } from '@/entities/reservations.entity';

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

  async getAvailableSeats(dateString: string): Promise<string> {
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

  async reserveSeat(
    date: string,
    seatNumber: number,
    userId: string,
    queueToken: string,
  ) {
    try {
      if (!this.isSeatAvailable(date, seatNumber)) {
        throw new Error('Seat is not available');
      }

      this.setTemporaryHold(date, seatNumber, userId);

      // 임시
      return {
        date: date,
        seatNumber: seatNumber,
        status: 'reserved',
        temporaryHoldUntil: new Date(Date.now() + 5 * 60000),
      };
    } catch (err) {
      throw new HttpException('Reservation failed', HttpStatus.BAD_REQUEST);
    }
  }

  isSeatAvailable(date: string, seatNumber: number): boolean {
    // 좌석 예약 가능 여부를 확인하는 로직
    // 1. 데이터베이스에 해당 날짜와 좌석 번호의 예약완료 여부
    // 2. 데이터베이스의 해당 날짜와 좌석 번호에 대한 임시 배정 여부

    this.getAvailableSeats(date);
    return true; // 임시 true
  }

  setTemporaryHold(date: string, seatNumber: number, userId: string) {
    // 임시 배정
    // 1. 데이터베이스의 해당 날짜와 좌석 번호에 임시 배정 정보를 저장 (userId, 배정 해제 시각)
    // 2. 일정 시간 후에 자동으로 배정을 해제
  }

  releaseExpiredReservations() {
    // 배정 해제 로직
    // - AuthService의 handleExpiredQueueTokens과 같이, Cron 사용
    // - 특정 시간마다 배정해제 필요 여부를 확인하고, 배정 해제 후 DB를 업데이트 합니다.
  }
}
