import { Injectable } from '@nestjs/common';

@Injectable()
export class QueueTokenManager {
  // private queue: string[] = [];
  // private idAndTokenExpiryMap: Map<string, number> = new Map();
  // private readonly MAX_WAITING_SIZE = 50;
  //
  // isInQueue(userId: string): boolean {
  //   return this.queue.includes(userId);
  // }
  // enqueueUser(userId: string) {
  //   if (!this.queue.includes(userId)) {
  //     this.queue.push(userId);
  //   }
  // }
  // getQueuePayload(userId: string) {
  //   const myQueue = this.queue.indexOf(userId);
  //   const remainingMinute = Math.floor(myQueue / this.MAX_WAITING_SIZE) * 3;
  //   return { userId, myQueue, remainingMinute };
  // }
  // getQueueStatus(userId: string) {
  //   const myQueue = this.queue.indexOf(userId);
  //   const remainQueueSize = this.queue.length - myQueue - 1;
  //   const remainingMinute = Math.floor(myQueue / this.MAX_WAITING_SIZE) * 3;
  //   return { remainQueueSize, remainingMinute, myQueue };
  // }
  // getExpiredUserIds() {
  //   const currentTime = new Date().getTime();
  //   return Array.from(this.idAndTokenExpiryMap)
  //     .filter(([_, expiryTime]) => currentTime >= expiryTime)
  //     .map(([userId, _]) => userId);
  // }
  // removeExpiredUsers(expiredUserIds: string[]) {
  //   expiredUserIds.forEach((userId) => {
  //     this.queue = this.queue.filter((id) => id !== userId);
  //     this.idAndTokenExpiryMap.delete(userId);
  //   });
  // }
}
