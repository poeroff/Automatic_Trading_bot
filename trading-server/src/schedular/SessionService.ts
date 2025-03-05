import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionService {
  private hashKey: string | null = null; // 세션에 저장할 값
  private AccessToken: string | null = null; // 세션에 저장할 값
  private WebSocketToken: string | null = null; // 세션에 저장할 값
  setHashKey(hash: string) {
    this.hashKey = hash;
  }

  getHashKey(): string | null {
    return this.hashKey;
  }

  setAccessToken(AccessToken: string) {
    this.AccessToken = AccessToken;
  }

  getAccessToken(): string | null {
    return this.AccessToken;
  }

  setWebSocketToken(WebSocketToken: string) {
    this.WebSocketToken = WebSocketToken;
  }

  getWebSocketToken(): string | null {
    return this.WebSocketToken;
  }
}
