import {
  BadRequestException,
  Inject,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { scrypt as _scrypt } from 'crypto';
import * as bcrypt from 'bcrypt';
import { Cron } from '@nestjs/schedule';
import AsyncLock from 'async-lock';

import { User } from '@/entities/user.entity';
import { Auth } from '@/entities/auth.entity';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '@/constatns/jwt';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_REPOSITORY')
    private usersRepository: Repository<User>,
    @Inject('AUTH_REPOSITORY')
    private authRepository: Repository<Auth>,

    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private queue: string[] = [];
  private idAndTokenExpiryMap: Map<string, number> = new Map();
  private lock = new AsyncLock();
  private readonly MAX_WAITING_SIZE = 50;

  async signup(body: Partial<User>) {
    const { email, password } = body;
    const users = await this.usersService.findAll({ email });

    if (users.length) {
      throw new NotAcceptableException('Email is not available');
    }

    const hashedPassword = await this.transformPassword(password);

    return await this.usersService.create({
      ...body,
      password: hashedPassword,
    });
  }

  async transformPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async signin({ email, password }: Partial<User>) {
    const [user] = await this.usersService.findAll({ email });
    if (!user) throw new NotAcceptableException('User not found');

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
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

  decodeQueueToken(token: string) {
    return this.jwtService.verify(token, { secret: jwtConstants.secret });
  }

  // ----------------------------------------------------------------
  // Queue management
  inQueue(userId: string): boolean {
    if (!this.queue.includes(userId)) {
      this.queue.push(userId);
      return true;
    } else {
      return false;
    }
  }

  getRemainQueueSize(userId: string): number {
    const sizeLeft = this.queue.indexOf(userId) - this.MAX_WAITING_SIZE;
    if (sizeLeft < 1) return 0;
    return sizeLeft;
  }

  outQueue(userId?: string) {
    if (userId) {
      const index = this.queue.indexOf(userId);
      if (index > -1) {
        this.queue.splice(index, 1);
      }
    } else {
      this.queue.shift();
    }
  }

  /** 대기 큐 토큰 발급 */
  async generateQueueToken(userId: string) {
    try {
      return this.lock.acquire('queue-lock', async () => {
        if (this.queue.includes(userId)) {
          throw new BadRequestException('User already has a queue token');
        }

        this.inQueue(userId);
        const myQueue = this.queue.indexOf(userId);
        const remainQueueSize = this.getRemainQueueSize(userId);
        const remainingMinute = remainQueueSize * 3;
        const payload = {
          userId,
          myQueue,
          remainingMinute,
        };

        const expiresIn = 5 * 60 * 1000;
        const expiryTime = new Date().getTime() + expiresIn;

        this.idAndTokenExpiryMap.set(userId, expiryTime);

        const queueToken = this.jwtService.sign(payload, { expiresIn: '5m' });

        await this.authRepository.save({
          userId,
          queueToken,
        });

        return {
          queue_token: queueToken,
          remainQueueSize,
          remainingMinute,
          myQueue,
        };
      });
    } catch (e) {
      console.error('Error acquiring lock in generateQueueToken:', e);
      throw new BadRequestException('Error processing request');
    }
  }

  /** 토큰 확인 */
  checkQueueTokenStatus(token: string) {
    try {
      const decoded = this.decodeQueueToken(token);

      const myQueue = this.queue.indexOf(decoded.userId);
      const remainQueueSize = this.getRemainQueueSize(decoded.userId);

      return {
        remainQueueSize,
        remainingMinute: remainQueueSize * 3,
        myQueue,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /** 만료 토큰 삭제 */
  @Cron('*/2 * * * * *')
  async handleExpiredQueueTokens() {
    try {
      await this.lock.acquire('queue-lock', async () => {
        const currentTime = new Date().getTime();
        const expiredUserIds: string[] = [];

        this.idAndTokenExpiryMap.forEach((expiryTime, userId) => {
          if (currentTime >= expiryTime) {
            expiredUserIds.push(userId);
          }
        });

        if (expiredUserIds.length > 0) {
          const expiredAuths = await this.authRepository.find({
            where: { userId: In(expiredUserIds) },
          });
          for (const auth of expiredAuths) {
            await this.authRepository.remove(auth);
          }
        }

        expiredUserIds.forEach((userId) => {
          this.outQueue(userId);
          this.idAndTokenExpiryMap.delete(userId);
        });
      });
    } catch (e) {
      console.error('Error acquiring lock in handleExpiredQueueTokens:', e);
    }
  }
}
