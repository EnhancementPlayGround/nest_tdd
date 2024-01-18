import { IsEmail, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @Length(5, 255)
  email: string;

  @IsString()
  @Length(6, 50)
  password: string;

  @IsString()
  @Length(2, 50)
  username: string;
}
