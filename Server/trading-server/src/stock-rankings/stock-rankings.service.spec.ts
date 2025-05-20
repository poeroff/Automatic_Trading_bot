import { Test, TestingModule } from '@nestjs/testing';
import { StockRankingsService } from './stock-rankings.service';

describe('StockRankingsService', () => {
  let service: StockRankingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockRankingsService],
    }).compile();

    service = module.get<StockRankingsService>(StockRankingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
