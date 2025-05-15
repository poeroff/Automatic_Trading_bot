export declare class AppController {
    HELLO(): string;
    private redisClient;
    handleSetKey(data: {
        key: string;
        value: string;
        ttl?: number;
    }): Promise<void>;
    handleGetKey(key: string): Promise<string | null>;
    handleTask(data: any): {
        result: string;
    };
}
