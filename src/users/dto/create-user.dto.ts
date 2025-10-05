import { Type } from 'class-transformer';
import {
  IsString,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  MinLength,
  Length,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Email must be EMAIL format' })
  @IsNotEmpty({ message: 'Email must not be empty' })
  email: string;

  @IsString({ message: 'fullName must be STRING format' })
  @Length(3, 20, {
    message: 'fullName must be between 3 and 20 characters long',
  })
  fullName: string;

  @IsNotEmpty({ message: 'Password must not be empty' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsNotEmpty({ message: 'phoneNumber must not be empty' })
  @IsString({ message: 'phoneNumber must be STRING format' })
  phoneNumber: string;

  @IsNotEmpty({ message: 'genderCode must not be empty' })
  @IsString({ message: 'genderCode must be STRING format' })
  genderCode: string;

  @IsNotEmpty({ message: 'roleCode must not be empty' })
  @IsString({ message: 'roleCode must be STRING format' })
  roleCode: string;

  @IsNotEmpty({ message: 'isVip must not be empty' })
  @IsBoolean({ message: 'isVip must be BOOLEAN format' })
  @Type(() => Boolean)
  isVip: boolean;

  @IsNotEmpty({ message: 'statusCode must not be empty' })
  @IsString({ message: 'statusCode must be STRING format' })
  statusCode: string;

  @IsNotEmpty({ message: 'isDeleted must not be empty' })
  @IsBoolean({ message: 'isDeleted must be BOOLEAN format' })
  @Type(() => Boolean)
  isDeleted: boolean;
}
