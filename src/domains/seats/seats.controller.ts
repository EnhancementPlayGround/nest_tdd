import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post as Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SeatsService } from './seats.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/utils/jwt-auth/jwt-auth.guards';
import { Seats } from '@entities/seats.entity';

@Controller('seats')
@ApiTags('🪑 Seats')
@UseGuards(JwtAuthGuard)
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Get('seats')
  @ApiOperation({ summary: '사용 가능한 날짜 조회' })
  @ApiResponse({ status: 200, description: '사용 가능한 날짜 목록 반환 📆' })
  async getAvailableSeats(
    @Query('date') date: Seats['date'],
    @Query('status') status: Seats['status'],
  ): Promise<Seats[]> {
    if (date) return [await this.seatsService.getSeatByDate(date)];

    return await this.seatsService.getSeats(status);
  }

  @Post('seats')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '좌석 추가' })
  @ApiResponse({ status: 201, description: '좌석 업데이트 ✅' })
  @ApiResponse({ status: 400, description: '좌석 업데이트 실패 ❌' })
  async createSeat(
    @Body()
    body: {
      date: string;
      seatNumber: string;
      userId: string;
      queueToken: string;
    },
  ) {
    try {
      return await this.seatsService.createSeats(body);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('seats')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '좌석 업데이트' })
  @ApiResponse({ status: 201, description: '좌석 업데이트 ✅' })
  @ApiResponse({ status: 400, description: '좌석 업데이트 실패 ❌' })
  async reserveSeat(
    @Body()
    body: {
      date: string;
      seatNumber: string;
      userId: string;
      status: string;
    },
  ) {
    try {
      return await this.seatsService.reserveSeat(body);
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('seats/init-week')
  async initSeats(@Param('date') date: string) {
    this.seatsService.initializeAvailableDates(new Date(date));
    return { message: 'Initialization successful' };
  }

  @Post('seats/queue')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '임시 좌석 설정' })
  @ApiResponse({ status: 201, description: '임시 좌석 설정 성공 🕒' })
  @ApiResponse({ status: 400, description: '임시 좌석 설정 실패 ❌' })
  async SeatsQueue(
    @Body()
    body: {
      date: string;
      seatNumber: string;
      userId: string;
      queueToken: string;
    },
  ) {
    try {
      await this.seatsService.setTemporaryHold(body);
      return { message: 'Seat temporarily held' };
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('seats/queue')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '입장 가능 여부 폴링' })
  async SeatsQueuePolling(
    @Body()
    body: {
      date: string;
      seatNumber: string;
      userId: string;
      queueToken: string;
    },
  ) {
    try {
      await this.seatsService.setTemporaryHold(body);
      return { message: 'Seat temporarily held' };
    } catch (err) {
      throw new HttpException(err.message, HttpStatus.BAD_REQUEST);
    }
  }
}
