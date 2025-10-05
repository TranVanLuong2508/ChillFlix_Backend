import { IsOptional, IsString } from 'class-validator';

export class CreateDirectorDto {
  @IsString()
  directorName: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  story?: string;
}
