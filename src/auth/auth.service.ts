import {
  BadRequestException,
  Inject,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { promisify } from 'util';
import { scrypt as _scrypt, randomBytes } from 'crypto';
import { Cron } from '@nestjs/schedule';

import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { jwtConstants } from 'src/constatns/jwt';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_REPOSITORY')
    private usersRepository: Repository<User>,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}
  private readonly MAX_QUEUE_SIZE = 50;
  private queueIssuedIds: Set<string> = new Set();
  private idAndTokenExpiryMap: Map<string, number> = new Map();
  private currentQueueSize = 0;

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

  decodeQueueToken(token: string) {
    return this.jwtService.verify(token, { secret: jwtConstants.secret });
  }

  // ----------------------------------------------------------------
  // Queue management
  inQueue(): number {
    if (this.currentQueueSize >= this.MAX_QUEUE_SIZE) {
      throw new Error('Queue is full');
    }
    return ++this.currentQueueSize;
  }

  calcRemainingTime(myQueue: number): number {
    if (this.currentQueueSize === 0) return 0;
    return (this.currentQueueSize - myQueue) * 3;
  }

  getCurrentQueueSize(): number {
    return this.currentQueueSize;
  }

  outQueue(userId: string): void {
    this.currentQueueSize = Math.max(0, this.currentQueueSize - 1);
    this.queueIssuedIds.delete(userId);
  }

  /** 대기 큐 토큰 발급 */
  generateQueueToken(userId: string) {
    if (this.queueIssuedIds.has(userId)) {
      throw new BadRequestException('User already has a queue token');
    }

    const newQueue = this.inQueue();
    const remainingTime = this.calcRemainingTime(newQueue);
    const payload = { userId, myQueue: newQueue, remainingTime };

    const expiresIn = 5 * 60 * 1000;
    const expiryTime = new Date().getTime() + expiresIn;

    this.queueIssuedIds.add(userId);
    this.idAndTokenExpiryMap.set(userId, expiryTime);

    return {
      queue_token: this.jwtService.sign(payload, { expiresIn: '5m' }),
      currentQueueSize: this.currentQueueSize,
      remainingTime: this.calcRemainingTime(newQueue),
      myQueue: newQueue,
    };
  }

  /** 토큰 확인 */
  checkQueueTokenStatus(token: string) {
    try {
      const decoded = this.decodeQueueToken(token);

      const userQueue = decoded.myQueue;
      const currentQueueSize = this.getCurrentQueueSize();
      const currentRemaining = this.calcRemainingTime(userQueue);

      return {
        currentQueueSize,
        remainingTime: currentRemaining,
        myQueue: userQueue,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  /** 만료 토큰 삭제 */
  @Cron('*/30 * * * * *')
  handleExpiredQueueTokens() {
    const currentTime = new Date().getTime();

    this.idAndTokenExpiryMap.forEach((expiryTime, userId) => {
      if (currentTime >= expiryTime) {
        this.outQueue(userId);
        this.idAndTokenExpiryMap.delete(userId);
      }
    });
  }
}
