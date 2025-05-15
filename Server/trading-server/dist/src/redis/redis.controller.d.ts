import { RedisService } from './redis.service';
export declare class RedisController {
    private readonly redisService;
    constructor(redisService: RedisService);
    setKey(key: string, value: string): Promise<{
        message: string;
    }>;
    getKey(key: string): Promise<{
        key: string;
        value: any;
        message?: undefined;
    } | {
        message: string;
        key?: undefined;
        value?: undefined;
    }>;
}
