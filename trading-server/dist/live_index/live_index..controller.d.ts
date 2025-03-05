import { LiveIndexService } from './live_index.service';
import { ConfigService } from '@nestjs/config';
import { SessionService } from 'src/schedular/SessionService';
export declare class LiveIndexController {
    private readonly liveindexservice;
    private configService;
    private readonly sessionService;
    constructor(liveindexservice: LiveIndexService, configService: ConfigService, sessionService: SessionService);
    private readonly appkey;
    private readonly appsecret;
    Kospiindex(): void;
}
