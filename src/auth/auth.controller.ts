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
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { User } from '@/entities/user.entity';
import { AuthService } from './auth.service';
import { SignupAuthDto } from './dto/signup-auth.dto';
import { JwtAuthGuard } from './jwt-auth.guards';

@Controller('auth')
@ApiTags('🔑 auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiBody({ type: SignupAuthDto })
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async signup(@Body() body: SignupAuthDto) {
    const user = await this.authService.signup(body);
    return user;
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(@Body() user: Partial<User>) {
    return this.authService.signin(user);
  }

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
