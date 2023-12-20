import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/jwt-auth.guards';

@Controller('reservations')
@ApiTags('🪑 Reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get('available-dates')
  @ApiOperation({ summary: '사용 가능한 날짜 조회' })
  @ApiResponse({ status: 200, description: '사용 가능한 날짜 목록 반환 📆' })
  async getAvailableDates() {
    return await this.reservationsService.getAvailableDates();
  }

  @Get('available-seats/:date')
  @ApiOperation({ summary: '특정 날짜의 사용 가능한 좌석 조회' })
  @ApiResponse({ status: 200, description: '사용 가능한 좌석 목록 반환 🪑' })
  async getAvailableSeats(@Param('date') date: string) {
    const seats = await this.reservationsService.getAvailableSeats(date);
    return { seats: seats.split(',') };
  }

  @Post('hold')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '임시 좌석 설정' })
  @ApiResponse({ status: 201, description: '임시 좌석 설정 성공 🕒' })
  @ApiResponse({ status: 400, description: '임시 좌석 설정 실패 ❌' })
  async holdSeat(
    @Body()
    body: {
      date: string;
      seatNumber: string;
      userId: string;
      queueToken: string;
    },
  ) {
    try {
      await this.reservationsService.setTemporaryHold(body);
      return { message: 'Seat temporarily held' };
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('reserve')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '좌석 예약' })
  @ApiResponse({ status: 201, description: '좌석 예약 성공 ✅' })
  @ApiResponse({ status: 400, description: '예약 실패 ❌' })
  async reserveSeat(
    @Body()
    body: {
      date: string;
      seatNumber: string;
      userId: string;
    },
  ) {
    try {
      return await this.reservationsService.reserveSeat(body);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('initialize-dates/:date')
  async initSeats(@Param('date') date: string) {
    this.reservationsService.initializeAvailableDates(new Date(date));
    return { message: 'Initialization successful' };
  }
}
