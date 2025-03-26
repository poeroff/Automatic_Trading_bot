import { Test, TestingModule } from '@nestjs/testing';
import { ExceluploadService } from './excelupload.service';

describe('ExceluploadService', () => {
  let service: ExceluploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExceluploadService],
    }).compile();

    service = module.get<ExceluploadService>(ExceluploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
