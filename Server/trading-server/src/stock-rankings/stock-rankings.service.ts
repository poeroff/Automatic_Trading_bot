import { Injectable } from '@nestjs/common';
import { CreateStockRankingDto } from './dto/create-stock-ranking.dto';
import { UpdateStockRankingDto } from './dto/update-stock-ranking.dto';
import { Get } from 'utils/axios_get';

@Injectable()
export class StockRankingsService {
  async tradingvolume(url , headers, params) {
    const response = await Get(url,headers,params)
    return response.data.output
  }

  findAll() {
    return `This action returns all stockRankings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} stockRanking`;
  }

  update(id: number, updateStockRankingDto: UpdateStockRankingDto) {
    return `This action updates a #${id} stockRanking`;
  }

  remove(id: number) {
    return `This action removes a #${id} stockRanking`;
  }
}
