import {
  Controller,
  Post,
  Body,
  Session,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupAuthDto } from './dto/signup-auth.dto';
import { SigninUserDto } from './dto/siginin-auth.dto';
import { ApiTags } from '@nestjs/swagger';
import { User } from 'src/entities/user.entity';

@Controller('auth')
@ApiTags('🔑 auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
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

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refreshAccessToken(@Body() body: { refresh_token: string }) {
    return this.authService.refreshAccessToken(body.refresh_token);
  }
}
