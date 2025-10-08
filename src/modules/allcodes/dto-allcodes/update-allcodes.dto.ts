import { PartialType } from '@nestjs/mapped-types';
import { CreateAllCodeDto } from './create-allcodes.dto';

export class UpdateAllCodeDto extends PartialType(CreateAllCodeDto) {}
