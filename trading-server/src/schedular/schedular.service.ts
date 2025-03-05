import { Inject, Injectable } from '@nestjs/common';
import { CreateSchedularDto } from './dto/create-schedular.dto';
import { UpdateSchedularDto } from './dto/update-schedular.dto';
import axios from 'axios';
import { SessionService } from './SessionService';
import { ClientProxy } from '@nestjs/microservices';


@Injectable()
export class SchedularService {
  constructor(private readonly sessionService: SessionService, @Inject("REDIS_CLIENT") private readonly redisClient: ClientProxy) {} // ✅ 세션 서비스 주입



  async CreateAuthHashKey(url, headers, data){
    try {
      const response = await axios.post(url, data, { headers: headers });
      this.sessionService.setHashKey(response.data.HASH); //Hashkey 설정
    } catch (error) {
      throw new Error('API request failed');
    }

  }
  
  async CreateAccessToken(url, headers, data) {
    try {
      const response = await axios.post(url, data, { headers: headers });
  
      const accessToken = response.data.token_type + " " + response.data.access_token;
 
  
      // Redis에 저장 (이벤트 발생)
      this.redisClient.emit('set_key', { key: "AccessToken", value: accessToken, ttl : 86400 });
  
  
      // 1초 후 Redis에서 값 가져와서 확인
      setTimeout(async () => {
        const savedToken = await this.redisClient.send('get_key', "AccessToken").toPromise();
        console.log(`✅ Retrieved from Redis: ${savedToken}`);
      }, 1000);
  
      this.sessionService.setAccessToken(accessToken);
    } catch (error) {
      console.error('❌ API request failed:', error.message);
      throw new Error('API request failed');
    }
  }
  
  


  async CreateWebSocketToken(url, headers, data){
    try {
      const response = await axios.post(url, data, { headers: headers });
      this.sessionService.setWebSocketToken(response.data.approval_key)
    } catch (error) {
      throw new Error('API request failed');
    }
  }

  async getWeeklyStockData(url,headers,params){
    
    try {
      const response = await axios.get(url, { headers : headers, params : params });
     
      console.log(response.data.output2)
    
      return response.data;
    } catch (error) {
      throw new Error('주봉 데이터 조회 실패');
    }

  }

  findAll() {
    return `This action returns all schedular`;
  }

  findOne(id: number) {
    return `This action returns a #${id} schedular`;
  }

  update(id: number, updateSchedularDto: UpdateSchedularDto) {
    return `This action updates a #${id} schedular`;
  }

  remove(id: number) {
    return `This action removes a #${id} schedular`;
  }
}
