import { Module } from '@nestjs/common';

import { EventsGateway } from './events.gateway';
import { LiveIndexModule } from 'src/live_index/live_index.module';

@Module({
  imports :[LiveIndexModule],
  controllers: [],
  providers: [EventsGateway],
})
export class GatewayModule {}
