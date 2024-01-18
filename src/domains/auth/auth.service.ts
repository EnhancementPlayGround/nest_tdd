import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Cron } from '@nestjs/schedule';

import { Auth } from '@entities/auth.entity';
import configuration from '@config/configuration';

/**
 * AuthService
 * - 토큰 생성
 * - 토큰 갱신
 * - JWT 토큰 디코딩
 * - 대기열 토큰 생성
 * - 토큰 상태 확인
 * - 만료된 토큰 처리
 */
@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_REPOSITORY')
    private authRepository: Repository<Auth>,

    private jwtService: JwtService,
  ) {}
  private queue: string[] = []; // index of queue
  private idAndTokenExpiryMap: Map<string, number> = new Map(); // token of userId
  private readonly MAX_PROCESSABLE = 50;

  isInQueue(userId: string): boolean {
    return this.queue.includes(userId);
  }

  enqueueUser(userId: string) {
    if (!this.queue.includes(userId)) {
      this.queue.push(userId);
    }
  }

  getQueuePayload(userId: string) {
    const myQueue = this.queue.indexOf(userId);
    const batchesAhead = Math.floor(myQueue / this.MAX_PROCESSABLE);
    const remainingMinute = batchesAhead * 3; // 각 배치당 3분 가정
    return { userId, myQueue, remainingMinute };
  }

  getExpiredUserIds() {
    const currentTime = new Date().getTime();
    return Array.from(this.idAndTokenExpiryMap)
      .filter(([_, expiryTime]) => currentTime >= expiryTime)
      .map(([userId, _]) => userId);
  }

  removeExpiredUsers(expiredUserIds: string[]) {
    expiredUserIds.forEach((userId) => {
      this.queue = this.queue.filter((id) => id !== userId);
      this.idAndTokenExpiryMap.delete(userId);
    });
  }

  //---------------------------------------------
  // 토큰 생성
  private createToken(payload: object | Buffer, expiresIn: string): string {
    return this.jwtService.sign(payload, { expiresIn });
  }

  // 토큰 갱신
  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const user = this.jwtService.verify(refreshToken);
      const accessToken = this.createToken(
        { username: user.username, sub: user.id },
        '15m',
      );
      const newRefreshToken = this.createToken(
        { username: user.username, sub: user.id },
        '7d',
      );

      // 리프레시 토큰을 데이터베이스에 저장
      await this.authRepository.save({
        userId: user.id,
        refreshToken: newRefreshToken,
      });

      return {
        access_token: accessToken,
        refresh_token: newRefreshToken,
      };
    } catch (e) {
      throw new BadRequestException('Invalid refresh token 🚫');
    }
  }

  // JWT 토큰 디코딩
  decodeQueueToken(token: string): any {
    return this.jwtService.verify(token, {
      secret: configuration().secret,
    });
  }

  // 대기열 토큰 생성
  async generateQueueToken(userId: string) {
    return await this.authRepository.manager.transaction(
      async (transactionalEntityManager) => {
        if (this.isInQueue(userId))
          throw new BadRequestException('User already in queue 🚫');

        this.enqueueUser(userId);
        const payload = this.getQueuePayload(userId);
        const queueToken = this.createToken(payload, '5m');

        await transactionalEntityManager.save(Auth, { userId, queueToken });
        return this.getQueuePayload(userId);
      },
    );
  }

  // 토큰 상태 확인
  checkQueueTokenStatus(token: string) {
    try {
      const decoded = this.decodeQueueToken(token);
      return this.getQueuePayload(decoded.userId);
    } catch (e) {
      throw new BadRequestException('Invalid queue token 🚫');
    }
  }

  // 만료된 토큰 처리
  @Cron('0 0/1 * * * *')
  async handleExpiredQueueTokens() {
    await this.authRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const expiredUserIds = this.getExpiredUserIds();
        const expiredAuths = await transactionalEntityManager.find(Auth, {
          where: { userId: In(expiredUserIds) },
        });

        await Promise.all(
          expiredAuths.map((auth) => transactionalEntityManager.remove(auth)),
        );
        this.removeExpiredUsers(expiredUserIds);
        console.error('Expired tokens cleaned up 🧹');
      },
    );
  }
}
