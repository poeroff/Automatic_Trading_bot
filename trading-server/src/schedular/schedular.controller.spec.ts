import { Test, TestingModule } from '@nestjs/testing';
import { SchedularController } from './schedular.controller';
import { SchedularService } from './schedular.service';

describe('SchedularController', () => {
  let controller: SchedularController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchedularController],
      providers: [SchedularService],
    }).compile();

    controller = module.get<SchedularController>(SchedularController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
