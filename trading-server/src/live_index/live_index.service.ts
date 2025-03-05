import { Inject, Injectable } from '@nestjs/common';
import { CreateLiveIndexDto } from './dto/create-live_index.dto';
import { UpdateLiveIndexDto } from './dto/update-live_index.dto';
import axios from 'axios';
import { SessionService } from 'src/schedular/SessionService';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class LiveIndexService {
  constructor(private readonly  sessionService: SessionService, private configService : ConfigService,@Inject("REDIS_CLIENT") private readonly redisClient: ClientProxy) {}
  private readonly appkey = this.configService.get<string>('appkey')
  private readonly appsecret = this.configService.get<string>('appsecret')

  async KospiIndex() {

    const url = "https://openapi.koreainvestment.com:9443//uapi/domestic-stock/v1/quotations/inquire-index-price"
    const getAccessToken = await this.redisClient.send('get_key', "AccessToken").toPromise();
    const headers = {
      'Content-Type': 'application/json; charset=UTF-8',
      'authorization': getAccessToken,
      'appkey': this.appkey,
      'appsecret': this.appsecret,
      'tr_id': 'FHPUP02100000', // 주식 차트 데이터 요청 ID
      "custtype" :"P"
    };
    const params = {
      FID_COND_MRKT_DIV_CODE	: 'U',
      FID_INPUT_ISCD: "0001",
    };
    try {
      const response = await axios.get(url, { headers : headers, params : params });
      return response.data.output;
    } catch (error) {
      throw new Error('주봉 데이터 조회 실패');
    }
  }

  findAll() {
    return `This action returns all liveIndex`;
  }

  findOne(id: number) {
    return `This action returns a #${id} liveIndex`;
  }

  update(id: number, updateLiveIndexDto: UpdateLiveIndexDto) {
    return `This action updates a #${id} liveIndex`;
  }

  remove(id: number) {
    return `This action removes a #${id} liveIndex`;
  }
}
