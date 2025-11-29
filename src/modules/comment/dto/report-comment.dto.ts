import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ReportCommentDto {
  @IsString()
  @IsNotEmpty()
  commentId: string;

  @IsString()
  @IsNotEmpty()
  reason: string; 

  @IsOptional()
  @IsString()
  description?: string;
}
