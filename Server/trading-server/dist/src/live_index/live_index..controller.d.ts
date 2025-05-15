import { LiveIndexService } from './live_index.service';
import { ConfigService } from '@nestjs/config';
export declare class LiveIndexController {
    private readonly liveindexservice;
    private configService;
    constructor(liveindexservice: LiveIndexService, configService: ConfigService);
    private readonly appkey;
    private readonly appsecret;
    Kospiindex(): void;
}
