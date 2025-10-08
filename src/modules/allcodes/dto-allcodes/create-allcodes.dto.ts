import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAllCodeDto {
  @IsNotEmpty()
  @IsString()
  keyMap: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsNotEmpty()
  @IsString()
  valueEn: string;

  @IsNotEmpty()
  @IsString()
  valueVi: string;

  @IsString()
  description?: string;
}
