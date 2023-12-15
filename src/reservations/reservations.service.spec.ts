import { Test, TestingModule } from '@nestjs/testing';
import { ReservationsService } from './reservations.service';
import { HttpException, NotFoundException } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';

const mockReservationsRepository = {
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

describe('ReservationsService', () => {
  let service: ReservationsService;
  let controller: ReservationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        ReservationsService,
        {
          provide: 'RESERVATIONS_REPOSITORY',
          useValue: mockReservationsRepository,
        },
        {
          provide: 'AUTH_REPOSITORY',
          useValue: mockAuthRepository,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isSeatAvailable', () => {
    it('should be', async () => {
      mockReservationsRepository.findOne.mockResolvedValue({
        availableSeats: '1,2,3',
      });

      expect(await service.isSeatAvailable('2023-01-01', 2)).toBeTruthy();
    });

    it('should not be', async () => {
      mockReservationsRepository.findOne.mockResolvedValue({
        availableSeats: '1,3,4',
      });

      expect(await service.isSeatAvailable('2023-01-01', 2)).toBeFalsy();
    });

    it('no reservations for the date', async () => {
      mockReservationsRepository.findOne.mockResolvedValue(null);

      await expect(service.isSeatAvailable('2023-01-01', 2)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('setTemporaryHold', () => {
    it('should be', async () => {
      const date = '2023-01-01';
      const seatNumber = 1;
      const userId = 'user123';
      const queueToken = '';
      const mockReservation = {
        date,
        availableSeats: '1,2,3',
        temporaryHolds: {},
      };
      mockAuthRepository.findOne.mockResolvedValue({});
      mockReservationsRepository.findOne.mockResolvedValue(mockReservation);

      await service.setTemporaryHold({ date, seatNumber, userId, queueToken });

      expect(mockReservation.temporaryHolds[seatNumber]).toBeDefined();
      expect(mockReservation.temporaryHolds[seatNumber].userId).toEqual(userId);
    });

    it('queue token not vaild', async () => {
      mockAuthRepository.findOne.mockResolvedValue(null);

      await expect(
        service.setTemporaryHold({
          date: '2023-01-01',
          seatNumber: 1,
          userId: 'user123',
          queueToken: '',
        }),
      ).rejects.toThrow(HttpException);
    });

    it("can't find reservation", async () => {
      mockAuthRepository.findOne.mockResolvedValue({});
      mockReservationsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.setTemporaryHold({
          date: '2023-01-01',
          seatNumber: 1,
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

  // controller! ----------------------
  describe('holdSeat', () => {
    // it('should successfully hold a seat', async () => {
    //   const mockBody = {
    //     date: '2023-01-01',
    //     seatNumber: 1,
    //     userId: 'user123',
    //   };
    //   const response = await controller.holdSeat(mockBody);
    //   expect(response).toEqual({ message: 'Seat temporarily held' });
    //   expect(service.setTemporaryHold).toHaveBeenCalledWith(
    //     mockBody.date,
    //     mockBody.seatNumber,
    //     mockBody.userId,
    //   );
    // });
  });

  describe('reserveSeat', () => {
    // it('should be successful', async () => {
    //   // Mock the data
    //   const date = '2023-01-01';
    //   const seatNumber = 1;
    //   const userId = 'user123';
    //   const queueToken = 'token123';
    //   const mockReservation = {
    //     date,
    //     availableSeats: '1,2,3',
    //     temporaryHolds: {
    //       '1': { userId, releaseTime: new Date(Date.now() + 60000) },
    //     },
    //   };
    //   // Mock the repository methods
    //   mockReservationsRepository.findOne.mockResolvedValue(mockReservation);
    //   await service.reserveSeat(date, seatNumber, userId, queueToken);
    //   // Check if the seat is removed from availableSeats
    //   expect(
    //     mockReservation.availableSeats.includes(seatNumber.toString()),
    //   ).toBeFalsy();
    //   // Check if the temporary hold is removed
    //   expect(mockReservation.temporaryHolds[seatNumber]).toBeUndefined();
    // });
    // it('should fail to reserve a seat', async () => {
    //   // Mock the data with no available seats
    //   const date = '2023-01-01';
    //   const seatNumber = 1;
    //   const userId = 'user123';
    //   const queueToken = 'token123';
    //   const mockReservation = {
    //     date,
    //     availableSeats: '',
    //     temporaryHolds: {},
    //   };
    //   // Mock the repository method to return no available seats
    //   mockReservationsRepository.findOne.mockResolvedValue(mockReservation);
    //   // Expect the reservation to fail
    //   await expect(
    //     service.reserveSeat(date, seatNumber, userId, queueToken),
    //   ).rejects.toThrow();
    // });
  });
});
