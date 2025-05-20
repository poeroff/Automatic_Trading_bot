import { PartialType } from '@nestjs/mapped-types';
import { CreateStockRankingDto } from './create-stock-ranking.dto';

export class UpdateStockRankingDto extends PartialType(CreateStockRankingDto) {}
