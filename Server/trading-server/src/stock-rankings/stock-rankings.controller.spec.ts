import { Test, TestingModule } from '@nestjs/testing';
import { StockRankingsController } from './stock-rankings.controller';
import { StockRankingsService } from './stock-rankings.service';

describe('StockRankingsController', () => {
  let controller: StockRankingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockRankingsController],
      providers: [StockRankingsService],
    }).compile();

    controller = module.get<StockRankingsController>(StockRankingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
