import { PartialType } from '@nestjs/mapped-types';
import { CreateSchedularDto } from './create-schedular.dto';

export class UpdateSchedularDto extends PartialType(CreateSchedularDto) {}
