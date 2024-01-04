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

import { AuthService } from '@/auth/auth.service';
import { Seats } from '@/entities/seats.entity';

/**
 * SeatsService
 * - 예약가능좌석(가용좌석) 조회 available seats
 * - 특정 날짜의 좌석 조회
 * - 새로운 좌석 생성
 * - 특정 날짜의 좌석 업데이트
 * - 해당 주 초기 설정
 * - 좌석 예약
 * - 좌석 가용 여부 확인
 * - 좌석 임시 배정하기
 * - 만료 임시 배정 처리
 */
@Injectable()
export class SeatsService {
  constructor(
    @Inject('SEATS_REPOSITORY')
    private seatsRepository: Repository<Seats>,
    private authService: AuthService,
  ) {}

  // 예약 가능 좌석 조회
  async getSeats(status?: Seats['status']): Promise<Seats[]> {
    return status
      ? await this.seatsRepository.find({ where: { status } })
      : await this.seatsRepository.query(`SELECT DISTINCT date FROM seats`);
  }

  // 특정 날짜의 좌석 조회
  async getSeatByDate(dateString: string): Promise<Seats> {
    const seat = await this.seatsRepository.findOneBy({ date: dateString });
    if (!seat) {
      throw new NotFoundException(`No seats found for date ${dateString}`);
    }
    return seat;
  }

  // 새로운 좌석 생성
  async createSeats(body: Partial<Seats>): Promise<Seats> {
    const newSeat = this.seatsRepository.create({
      ...body,
      createdAt: new Date(),
    });
    await this.seatsRepository.save(newSeat);
    return newSeat;
  }

  // 특정 날짜의 좌석 업데이트
  async updateSeatByDate(
    dateString: string,
    attr: Partial<Seats>,
  ): Promise<Seats> {
    const seat = await this.getSeatByDate(dateString);
    Object.assign(seat, attr);
    return await this.seatsRepository.save(seat);
  }

  // 해당 주 초기 설정
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

  // 좌석 가용 여부 확인
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
    const queueTokenStatus = this.authService.decodeQueueToken(queueToken);
    if (!queueTokenStatus || queueTokenStatus.userId !== userId) {
      throw new HttpException(
        'Invalid queue token or Id',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 트랜잭션
    return await this.seatsRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // 2. 날짜의 예약정보 찾기
        const seat = await transactionalEntityManager.findOne(Seats, {
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
      },
    );
  }

  // 만료 임시 배정 처리
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
