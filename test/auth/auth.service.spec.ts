import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';

import { AuthService } from '../../src/domains/auth/auth.service';

const mockJwtService = { sign: jest.fn(), verify: jest.fn() };
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
          provide: 'AUTH_REPOSITORY',
          useValue: mockAuthRepository,
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
});
