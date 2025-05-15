import { PartialType } from '@nestjs/mapped-types';
import { CreateLiveIndexDto } from './create-live_index.dto';

export class UpdateLiveIndexDto extends PartialType(CreateLiveIndexDto) {}
