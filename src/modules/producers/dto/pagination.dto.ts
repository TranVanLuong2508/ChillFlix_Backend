import { IsOptional, IsString, IsNumber } from "class-validator"

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  page?: number

  @IsOptional()
  @IsNumber()
  limit?: number

  @IsOptional()
  @IsString()
  sort?: string

  @IsOptional()
  @IsString()
  filter?: string
}
