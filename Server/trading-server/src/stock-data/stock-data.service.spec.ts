import { Test, TestingModule } from '@nestjs/testing';
import { StockDataService } from './stock-data.service';

describe('StockDataService', () => {
  let service: StockDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockDataService],
    }).compile();

    service = module.get<StockDataService>(StockDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
