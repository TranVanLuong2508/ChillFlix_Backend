import { IsBoolean, IsNotEmpty } from "class-validator"

export class UpdateFilmProducerDto {
  @IsNotEmpty()
  filmId: string

  @IsNotEmpty()
  producerId: number

  @IsNotEmpty()
  @IsBoolean()
  isMain: boolean
}
