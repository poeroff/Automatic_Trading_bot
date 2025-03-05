export declare class AppController {
    private redisClient;
    handleSetKey(data: {
        key: string;
        value: string;
        ttl?: number;
    }): Promise<void>;
    handleGetKey(key: string): Promise<string | null>;
}
