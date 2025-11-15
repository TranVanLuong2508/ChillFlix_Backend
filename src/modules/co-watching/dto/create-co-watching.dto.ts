import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class CreateCoWatchingDto {
  @IsString({ message: 'Name must be a string.' })
  @IsNotEmpty({ message: 'Name cannot be empty.' })
  name: string;

  @IsNumber({}, { message: 'Host ID mut be number' })
  @IsNotEmpty({ message: 'Host ID is required.' })
  hostId: number;

  @IsUUID('all', { message: 'Episode ID must be a valid UUID.' })
  @IsNotEmpty({ message: 'Episode ID is required.' })
  episodeId: string;

  @IsString({ message: 'Thumbnail URL must be a string.' })
  @IsNotEmpty({ message: 'Thumbnail URL cannot be empty.' })
  thumbUrl: string;

  @IsNotEmpty({ message: 'isPrivate cannot be empty.' })
  @IsBoolean({ message: 'isPrivate must be a boolean value.' })
  isPrivate: boolean;

  @IsNotEmpty({ message: 'isLive cannot be empty.' })
  @IsBoolean({ message: 'isLive must be a boolean value.' })
  isLive: boolean;
}
