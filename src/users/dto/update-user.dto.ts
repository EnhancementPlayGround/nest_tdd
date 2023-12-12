import { PartialType } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsEmail()
  @IsOptional()
  @Length(5, 255)
  email?: string;

  @IsString()
  @IsOptional()
  @Length(6, 50)
  password?: string;

  @IsString()
  @Length(2, 50)
  username: string;
}
