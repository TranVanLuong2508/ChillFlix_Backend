import { Type } from 'class-transformer';
import { IsString, IsBoolean, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'must be EMAIL format' })
  @IsNotEmpty({ message: 'Email must not be empty' })
  email: string;

  @IsString({ message: 'fullName must be STRING format' })
  fullName: string;

  @IsNotEmpty({ message: 'Password must not be empty' })
  password: string;

  @IsBoolean({ message: 'isActive must be BOOLEAN format' })
  @Type(() => Boolean)
  isActive: boolean;
}
