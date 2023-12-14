import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

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
});
