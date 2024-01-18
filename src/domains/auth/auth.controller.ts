import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../utils/jwt-auth/jwt-auth.guards';

@Controller('auth')
@ApiTags('🔑 auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshAccessToken(@Body() body: { refresh_token: string }) {
    return this.authService.refreshAccessToken(body.refresh_token);
  }

  @UseGuards(JwtAuthGuard)
  @Get('queue')
  async getQueueToken(@Req() req) {
    const userId = req.user.userId;
    return this.authService.generateQueueToken(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('queue')
  checkQueueStatus(@Body() body: { queue_token: string }) {
    return this.authService.checkQueueTokenStatus(body.queue_token);
  }
}
