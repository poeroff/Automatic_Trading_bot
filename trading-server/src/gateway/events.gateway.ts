import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { LiveIndexService } from 'src/live_index/live_index.service';


@WebSocketGateway(81, { cors : true})
export class EventsGateway  {
  @WebSocketServer()
  server: Server;
   constructor(private readonly liveIndexService: LiveIndexService) {} // ✅ Controller 주입



  // 📌 클라이언트에서 "Korea_main_stock_marketIndex" 이벤트 요청 시 Controller의 Korea_main_stock_marketIndex 실행
  @SubscribeMessage('Korea_main_stock_marketIndex')
  async Korea_main_stock_marketIndex() {
    console.log("Korea_main_stock_marketIndex")
    try {
      // ✅ Controller의 KospiIndex() 실행 (HTTP 요청 없이 직접 호출)
      const response = await this.liveIndexService.Korea_main_stock_marketIndex();
   
      // ✅ 실행된 결과를 WebSocket을 통해 클라이언트로 전송
      this.server.emit('IndexData', response);
   
    } catch (error) {
      console.error(`🚨 KospiIndex 실행 중 오류 발생:`, error);
    }
  }

 
  // // ✅ 30초마다 업데이트
  // onModuleInit() {
  //   setInterval(async () => {
  //     await this.Korea_main_stock_marketIndex();
  //   }, 30000); 
  // }
}
