import {
  Controller,
  Post,
  Body,
  Session,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { SignupAuthDto } from './dto/signup-auth.dto';
import { User } from 'src/entities/user.entity';
import { JwtAuthGuard } from './jwt-auth.guards';

@Controller('auth')
@ApiTags('🔑 auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: SignupAuthDto, @Session() session: any) {
    const user = await this.authService.signup(body);
    session.userId = user.id;
    console.log(session.userId);
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
