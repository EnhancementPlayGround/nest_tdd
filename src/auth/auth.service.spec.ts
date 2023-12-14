import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { BadRequestException, NotAcceptableException } from '@nestjs/common';

const mockUsersService = { findAll: jest.fn(), create: jest.fn() };
const mockJwtService = { sign: jest.fn(), verify: jest.fn() };
const mockUsersRepository = { update: jest.fn() };
const mockAuthRepository = {
  save: jest.fn(),
  find: jest.fn(),
  remove: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'USER_REPOSITORY',
          useValue: mockUsersRepository,
        },
        {
          provide: 'AUTH_REPOSITORY',
          useValue: mockAuthRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 회원 가입
  describe('signup', () => {
    it('should successfully sign up a new user', async () => {
      mockUsersService.findAll.mockResolvedValue([]);
      const newUser = { email: 'test@example.com', password: '1234567890!' };
      mockUsersService.create.mockResolvedValue(newUser);

      expect(await service.signup(newUser)).toEqual(newUser);
    });

    it('should throw an exception if email already exists', async () => {
      mockUsersService.findAll.mockResolvedValue([{}]); // 반환된 유저가 있음

      await expect(
        service.signup({ email: 'test@example.com', password: '1234567890!' }),
      ).rejects.toThrow(NotAcceptableException);
    });
  });

  // 로그인
  describe('signin', () => {
    it('should successfully sign in a user', async () => {
      // password를 hash로 변경 필요
    });

    it('should throw an exception for invalid credentials', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      await expect(
        service.signin({
          email: 'test@example.com',
          password: 'wrongPassword',
        }),
      ).rejects.toThrow(NotAcceptableException);
    });
  });

  // JWT
  describe('refreshAccessToken', () => {
    it('should successfully refresh access token', async () => {
      mockJwtService.verify.mockReturnValue({ username: '유저명', sub: '1' });
      mockJwtService.sign.mockReturnValue('갱신_access_token');

      const result = await service.refreshAccessToken('유효_refresh_token');

      expect(mockJwtService.verify).toHaveBeenCalledWith('유효_refresh_token');
      expect(result).toHaveProperty('access_token', '갱신_access_token');
    });

    it('should throw an exception for invalid refresh token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error();
      });

      await expect(service.refreshAccessToken('invalidToken')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ----------------------------------------------------------------
  // Queue management
  describe('Queue Management', () => {
    describe('inQueue', () => {
      it('should add a user to the queue if not already in it', () => {
        const result = service.inQueue('user1');
        expect(result).toBeTruthy();
        expect(service['queue']).toContain('user1');
      });

      it('should not add a user to the queue if already present', () => {
        service['queue'].push('user1');

        const result = service.inQueue('user1');
        expect(result).toBeFalsy();
        expect(service['queue'].length).toBe(1);
      });
    });

    describe('outQueue', () => {
      it('should remove a **specific user** from the queue', () => {
        service['queue'].push('user1', 'user2');
        service.outQueue('user2');
        expect(service['queue']).toContain('user1');
        expect(service['queue']).not.toContain('user2');
      });

      it('should remove the first user from the queue if no userId is given', () => {
        service['queue'].push('user1', 'user2');
        service.outQueue();
        expect(service['queue']).not.toContain('user1');
        expect(service['queue']).toContain('user2');
      });
    });
  });

  describe('handleExpiredQueueTokens', () => {
    it('should remove expired tokens and update the queue', async () => {
      service['idAndTokenExpiryMap'].set('user1', Date.now() - 1000); // Expired
      service['queue'].push('user1');

      jest.spyOn(service, 'outQueue').mockImplementation();
      jest
        .spyOn(mockAuthRepository, 'find')
        .mockResolvedValue([{ userId: 'user1' }]);
      jest.spyOn(mockAuthRepository, 'remove').mockResolvedValue('user1');

      await service.handleExpiredQueueTokens();

      expect(service['outQueue']).toHaveBeenCalledWith('user1');
      expect(service['idAndTokenExpiryMap'].has('user1')).toBeFalsy();
    });
  });
});
