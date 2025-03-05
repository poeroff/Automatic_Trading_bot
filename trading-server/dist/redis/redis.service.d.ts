import { ClientProxy } from '@nestjs/microservices';
export declare class RedisService {
    private readonly redisClient;
    constructor(redisClient: ClientProxy);
    setKey(key: string, value: string): Promise<import("rxjs").Observable<any>>;
    getKey(key: string): Promise<any>;
}
