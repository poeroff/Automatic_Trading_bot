import { PartialType } from '@nestjs/mapped-types';
import { CreateExceluploadDto } from './create-excelupload.dto';

export class UpdateExceluploadDto extends PartialType(CreateExceluploadDto) {}
