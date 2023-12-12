import {
  BadRequestException,
  Inject,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { promisify } from 'util';
import { scrypt as _scrypt, randomBytes } from 'crypto';

import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_REPOSITORY')
    private usersRepository: Repository<User>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(body: Partial<User>) {
    const { email, password } = body;
    const users = await this.usersService.findAll({ email });

    if (users.length)
      throw new NotAcceptableException('Email is not available');

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    const result = salt + '.' + hash.toString('hex');

    return await this.usersService.create({
      ...body,
      password: result,
    });
  }

  async signin({ email, password }: Partial<User>) {
    const [user] = await this.usersService.findAll({ email });
    if (!user) throw new NotAcceptableException('User not found');

    const [salt, storedHash] = user.password.split('.');
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash === hash.toString('hex')) {
      const payload = { username: user.username, sub: user.id };
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
      const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

      await this.saveRefreshToken(user.id, refreshToken);

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } else {
      throw new BadRequestException(
        'Please check your email address and password',
      );
    }
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const user = this.jwtService.verify(refreshToken);
      const accessToken = this.jwtService.sign(
        { username: user.username, sub: user.id },
        { expiresIn: '15m' },
      );

      return { access_token: accessToken };
    } catch (e) {
      throw new BadRequestException('Invalid refresh token');
    }
  }

  private async saveRefreshToken(userId: string, refreshToken: string) {
    await this.usersRepository.update(userId, { refreshToken });
  }
}
