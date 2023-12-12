import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

import { PartialType } from '@nestjs/swagger';
import { SignupAuthDto } from './signup-auth.dto';

export class SigninUserDto extends PartialType(SignupAuthDto) {
  @IsEmail()
  @IsOptional()
  @Length(5, 255)
  email?: string;

  @IsString()
  @IsOptional()
  @Length(6, 50)
  password?: string;
}
