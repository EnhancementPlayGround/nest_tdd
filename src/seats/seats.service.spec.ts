import { Test, TestingModule } from '@nestjs/testing';
import { SeatsService } from './seats.service';
import { HttpException, NotFoundException } from '@nestjs/common';
import { SeatsController } from './seats.controller';
import { AuthService } from '@/auth/auth.service';

const mockSeatsRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};
const mockAuthRepository = {
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  remove: jest.fn(),
};
const mockAuthService = { getRemainQueueSize: jest.fn() };

/**
 * 좌석 대기열
 */

describe('SeatsService', () => {
  let service: SeatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeatsController],
      providers: [
        SeatsService,
        {
          provide: 'SEATS_REPOSITORY',
          useValue: mockSeatsRepository,
        },
        {
          provide: 'AUTH_REPOSITORY',
          useValue: mockAuthRepository,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    service = module.get<SeatsService>(SeatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isSeatAvailable', () => {
    it('should be', async () => {
      mockSeatsRepository.findOne.mockResolvedValue({
        availableSeats: '1,2,3',
      });

      expect(await service.isSeatAvailable('2023-01-01', '2')).toBeTruthy();
    });

    it('should not be', async () => {
      mockSeatsRepository.findOne.mockResolvedValue({
        availableSeats: '1,3,4',
      });

      expect(await service.isSeatAvailable('2023-01-01', '2')).toBeFalsy();
    });

    it('no reservations for the date', async () => {
      mockSeatsRepository.findOne.mockResolvedValue(null);

      await expect(service.isSeatAvailable('2023-01-01', '2')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('setTemporaryHold', () => {
    it('should be', async () => {
      const date = '2023-01-01';
      const seatNumber = '1';
      const userId = 'user123';
      const queueToken = '';
      const mockReservation = {
        date,
        availableSeats: '1,2,3',
        temporaryHolds: {},
      };
      mockAuthRepository.findOne.mockResolvedValue({});
      mockSeatsRepository.findOne.mockResolvedValue(mockReservation);

      await service.setTemporaryHold({ date, seatNumber, userId, queueToken });

      expect(mockReservation.temporaryHolds[seatNumber]).toBeDefined();
      expect(mockReservation.temporaryHolds[seatNumber].userId).toEqual(userId);
    });

    it('queue token not vaild', async () => {
      mockAuthRepository.findOne.mockResolvedValue(null);

      await expect(
        service.setTemporaryHold({
          date: '2023-01-01',
          seatNumber: '1',
          userId: 'user123',
          queueToken: '',
        }),
      ).rejects.toThrow(HttpException);
    });

    it("can't find reservation", async () => {
      mockAuthRepository.findOne.mockResolvedValue({});
      mockSeatsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.setTemporaryHold({
          date: '2023-01-01',
          seatNumber: '1',
          userId: 'user123',
          queueToken: '',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('releaseExpiredReservations', () => {
    // it('should remove', async () => {
    //   const expiredTime = new Date();
    //   expiredTime.setMinutes(expiredTime.getMinutes() - 5); // 5분 전
    //   const reservationsData = [
    //     {
    //       date: '2023-01-01',
    //       availableSeats: '1,2,3',
    //       temporaryHolds: {
    //         '1': { userId: 'user1', releaseTime: expiredTime }, // 만료
    //         '2': {
    //           userId: 'user2',
    //           releaseTime: new Date(expiredTime.getTime() + 60000), // 싱싱함
    //         },
    //       },
    //     },
    //   ];
    //   mockReservationsRepository.find.mockResolvedValue(reservationsData);
    //   await service.releaseExpiredReservations();
    //   expect(reservationsData[0].temporaryHolds['1']).toBeUndefined();
    //   expect(reservationsData[0].temporaryHolds['2']).toBeDefined();
    // });
  });
});
