import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { addDays, endOfWeek, format, startOfWeek } from 'date-fns';

import { Auth } from '@/entities/auth.entity';
import { AuthService } from '@/auth/auth.service';
import { Seats } from '@/entities/seats.entity';

@Injectable()
export class SeatsService {
  constructor(
    @Inject('SEATS_REPOSITORY')
    private seatsRepository: Repository<Seats>,
    @Inject('AUTH_REPOSITORY')
    private authRepository: Repository<Auth>,

    private authService: AuthService,
  ) {}

  //-----------------------------------------------
  // 예약가능 좌석 / 가용좌석 available seats
  async getSeats(status?: Seats['status']): Promise<Seats[]> {
    if (status) {
      return await this.seatsRepository.query(
        `
      SELECT * FROM seats WHERE status = $1
    `,
        [status],
      );
    }

    return await this.seatsRepository.query(`
      SELECT DISTINCT date FROM seats
    `);
  }

  async getSeatByDate(dateString: string): Promise<Seats> {
    const seat = await this.seatsRepository.findOne({
      select: ['availableSeats'],
      where: { date: dateString },
    });
    if (!seat) {
      throw new NotFoundException(`No seats found for seat`);
    }

    return seat;
  }

  async createSeats(body: Partial<Seats>): Promise<Seats> {
    const result = this.seatsRepository.create({
      ...body,
      createdAt: new Date(),
    });
    this.seatsRepository.save(result);

    return result;
  }

  async updateSeatByDate(
    dateString: string,
    attr: Partial<Seats>,
  ): Promise<Seats> {
    const seat = await this.getSeatByDate(dateString);

    Object.assign(seat, attr);

    return await this.seatsRepository.save(seat);
  }

  async initializeAvailableDates(currentDate?: Date) {
    let date = currentDate;
    if (!date) {
      date = new Date();
    }

    const startOfCurrentWeek = startOfWeek(currentDate);
    const endOfCurrentWeek = endOfWeek(currentDate);
    const existingDates = new Set((await this.getSeats()).map((e) => e.date));

    // 이번 주의 날짜를 생성하고 DB에 추가
    const datesToAdd: Date[] = [];
    let currentDateToAdd = startOfCurrentWeek;

    while (currentDateToAdd <= endOfCurrentWeek) {
      if (!existingDates.has(this.formatDateString(currentDateToAdd))) {
        datesToAdd.push(currentDateToAdd);
      }
      currentDateToAdd = addDays(currentDateToAdd, 1);
    }

    datesToAdd.map(async (date) => {
      const result = this.seatsRepository.create({
        date: this.formatDateString(date),
        availableSeats: Array.from(
          { length: 50 },
          (_, index) => index + 1,
        ).join(','),
        createdAt: new Date(),
        updatedAt: null,
      });

      this.seatsRepository.save(result);

      return result;
    });
  }

  // -----------------------------------------------

  // -----------------------------------------------
  // 예약 정보 seats
  async reserveSeat({
    date,
    seatNumber,
    userId,
  }: {
    date: string;
    seatNumber: string;
    userId: string;
  }) {
    // 1. 좌석 예약가능 여부 확인
    if (!(await this.isSeatAvailable(date, seatNumber))) {
      throw new HttpException('Seat is not available', HttpStatus.BAD_REQUEST);
    }

    // 2. 날짜의 예약정보 찾기
    let seat = await this.seatsRepository.findOne({
      where: { date },
    });
    if (!seat) {
      throw new NotFoundException(`No seat found for date ${date}`);
    }

    // 3. 임시 배정 확인
    const temporaryHold = seat.temporaryHolds[seatNumber];
    if (!temporaryHold || temporaryHold.userId !== userId) {
      throw new BadRequestException('Temporary hold data is not match');
    }

    // 4. 예약 가능한 좌석에서 해당 좌석 & 임시 배정 정보 삭제
    const availableSeats = seat.availableSeats.split(',');
    const seatIndex = availableSeats.indexOf(seatNumber);
    if (seatIndex > -1) {
      availableSeats.splice(seatIndex, 1);
    }
    seat.availableSeats = availableSeats.join(',');

    delete seat.temporaryHolds[seatNumber];

    // 5. 날짜의 예약정보 저장
    await this.seatsRepository.save(seat);
    return { message: 'seat successful' };
  }

  async isSeatAvailable(date: string, seatNumber: string): Promise<boolean> {
    const seat = await this.seatsRepository.findOne({
      where: { date },
    });

    if (seat && seat.availableSeats) {
      const availableSeats = seat.availableSeats.split(',');
      return availableSeats.includes(seatNumber);
    } else {
      throw new NotFoundException(`seat for date ${date} not found`);
    }
  }

  // -----------------------------------------------
  // 임시 배정 temporary hold
  async setTemporaryHold({
    date,
    seatNumber,
    userId,
    queueToken,
  }: {
    date: string;
    seatNumber: string;
    userId: string;
    queueToken: string;
  }) {
    // 1. queueToken 검증
    const isInQueue = await this.authRepository.findOne({
      where: { userId, queueToken },
    });
    if (!isInQueue) {
      throw new HttpException(
        'Invalid queue token or Id',
        HttpStatus.BAD_REQUEST,
      );
    }
    const remainQueueSize = await this.authService.getRemainQueueSize(userId);
    if (remainQueueSize <= 0) {
      throw new HttpException('Invalid queue size', HttpStatus.BAD_REQUEST);
    }

    // 2. 날짜의 예약정보 찾기
    const seat = await this.seatsRepository.findOne({
      where: { date },
    });
    if (!seat) {
      throw new NotFoundException(`seat for date ${date} not found`);
    }

    // 3. userId로 이미 임시 보유된 좌석 여부 확인
    const alreadyHeldSeat =
      seat.temporaryHolds !== null &&
      Object?.keys(seat.temporaryHolds).find(
        (seatIndex) => seat.temporaryHolds[seatIndex].userId === userId,
      );

    // 4. put temporaryHolds
    if (alreadyHeldSeat) {
      delete seat.temporaryHolds[alreadyHeldSeat];
    }
    const releaseTime = new Date();
    releaseTime.setMinutes(releaseTime.getMinutes() + 5);

    seat.temporaryHolds = {
      ...seat.temporaryHolds,
      [seatNumber]: { userId, releaseTime },
    };

    // 5. seat 저장
    await this.seatsRepository.save(seat);
  }

  @Cron('*/5 * * * *')
  async releaseExpiredseats() {
    const seats = await this.seatsRepository.find();
    const currentTime = new Date();

    seats.forEach(async (seat) => {
      if (seat.temporaryHolds) {
        Object.keys(seat.temporaryHolds).forEach((seatNumber) => {
          const hold = seat.temporaryHolds[seatNumber];

          if (hold.releaseTime < currentTime) {
            seat.availableSeats += `,${seatNumber}`;
            delete seat.temporaryHolds[seatNumber];
          }
        });
        await this.seatsRepository.save(seat);
      }
    });
  }

  private formatDateString(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }
}
