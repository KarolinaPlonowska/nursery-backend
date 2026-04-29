import { Injectable, BadRequestException } from '@nestjs/common';
import { RateLimiterMemory } from 'rate-limiter-flexible';

@Injectable()
export class AuthRateLimiterService {
  private limiter = new RateLimiterMemory({
    points: 5, // 5 prób
    duration: 60 * 5, // w ciągu 5 minut
    blockDuration: 60 * 5, // zablokuj IP na 5 minut po przekroczeniu
  });

  async consume(ip: string) {
    try {
      await this.limiter.consume(ip);
    } catch (err) {
      throw new BadRequestException(
        'Zbyt wiele prób logowania. Spróbuj później.',
      );
    }
  }

  reset(ip: string) {
    return this.limiter.delete(ip);
  }
}
