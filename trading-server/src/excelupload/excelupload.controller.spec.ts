import { Test, TestingModule } from '@nestjs/testing';
import { ExceluploadController } from './excelupload.controller';
import { ExceluploadService } from './excelupload.service';

describe('ExceluploadController', () => {
  let controller: ExceluploadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExceluploadController],
      providers: [ExceluploadService],
    }).compile();

    controller = module.get<ExceluploadController>(ExceluploadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
