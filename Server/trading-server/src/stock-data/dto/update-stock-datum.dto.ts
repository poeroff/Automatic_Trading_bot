import { PartialType } from '@nestjs/mapped-types';
import { CreateStockDatumDto } from './create-stock-datum.dto';

export class UpdateStockDatumDto extends PartialType(CreateStockDatumDto) {}
