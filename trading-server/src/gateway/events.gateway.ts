import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { LiveIndexService } from 'src/live_index/live_index.service';


@WebSocketGateway(81, { cors : true})
export class EventsGateway  {
  @WebSocketServer()
  server: Server;
   constructor(private readonly liveIndexService: LiveIndexService) {} // ✅ Controller 주입



  // 📌 클라이언트에서 "getKospiIndex" 이벤트 요청 시 Controller의 KospiIndex 실행
  @SubscribeMessage('getKospiIndex')
  async handleKospiIndexRequest() {
    console.log(`📩 WebSocket 요청 수신: Controller의 KospiIndex 실행`);

    try {
      // ✅ Controller의 KospiIndex() 실행 (HTTP 요청 없이 직접 호출)
      const response = await this.liveIndexService.KospiIndex();
   
      // ✅ 실행된 결과를 WebSocket을 통해 클라이언트로 전송
      this.server.emit('IndexData', response);
   
    } catch (error) {
      console.error(`🚨 KospiIndex 실행 중 오류 발생:`, error);
    }
  }

  // onModuleInit() {
  //   // ✅ 30초마다 실행
  //   setInterval(async () => {
  //     await this.handleKospiIndexRequest();
  //   }, 60000); // 30초 (30000ms)
  // }
}
