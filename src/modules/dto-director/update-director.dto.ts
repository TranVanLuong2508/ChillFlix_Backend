import { IsOptional, IsString } from 'class-validator';

export class UpdateDirectorDto {
  @IsOptional()
  @IsString()
  directorName?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  story?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  nationality?: string;
}
