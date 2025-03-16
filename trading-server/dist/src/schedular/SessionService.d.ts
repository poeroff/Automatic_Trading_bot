export declare class SessionService {
    private hashKey;
    private AccessToken;
    private WebSocketToken;
    setHashKey(hash: string): void;
    getHashKey(): string | null;
    setAccessToken(AccessToken: string): void;
    getAccessToken(): string | null;
    setWebSocketToken(WebSocketToken: string): void;
    getWebSocketToken(): string | null;
}
