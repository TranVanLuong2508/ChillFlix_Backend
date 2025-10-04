import { Type } from 'class-transformer';
import { IsString, IsBoolean, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'must be email format' })
  @IsNotEmpty()
  email: string;

  @IsString()
  fullName: string;

  @IsBoolean()
  @Type(() => Boolean)
  isActive: boolean;
}
