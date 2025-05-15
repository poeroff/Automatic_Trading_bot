import { Test, TestingModule } from '@nestjs/testing';
import { LiveIndexService } from './live_index.service';

describe('LiveIndexService', () => {
  let service: LiveIndexService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LiveIndexService],
    }).compile();

    service = module.get<LiveIndexService>(LiveIndexService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
