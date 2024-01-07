import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { serialize } from 'src/interceptors/serialize.interceptor';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '@/utils/jwt-auth/jwt-auth.guards';
import { CreateUserDto } from '@/domains/users/dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';

@Controller('users')
@ApiTags('👩‍👩‍👧‍👦 users')
@serialize(UserDto)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll({});
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    const userId = req.user.userId;
    if (userId !== id)
      new UnauthorizedException(
        'User ' + userId + ' is not authorized to get this user information',
      );
    return this.usersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const userId = req.user.userId;
    if (userId !== id)
      new UnauthorizedException(
        'User ' + userId + ' is not authorized to update this user',
      );

    return this.usersService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    const userId = req.user.userId;
    if (userId !== id)
      new UnauthorizedException(
        'User ' + userId + ' is not authorized to delete this user',
      );

    return this.usersService.remove(id);
  }
}
