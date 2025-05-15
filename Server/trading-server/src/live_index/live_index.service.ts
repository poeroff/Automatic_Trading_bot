import { Inject, Injectable } from '@nestjs/common';
import { CreateLiveIndexDto } from './dto/create-live_index.dto';
import { UpdateLiveIndexDto } from './dto/update-live_index.dto';
import axios from 'axios';

import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class LiveIndexService {
  constructor( private configService: ConfigService, @Inject("REDIS_CLIENT") private readonly redisClient: ClientProxy) { }
  private readonly appkey = this.configService.get<string>('appkey')
  private readonly appsecret = this.configService.get<string>('appsecret')

  getCurrentDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1 필요
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  //한국 주요 증시 지수 정보 가져오기
  async Korea_main_stock_marketIndex() {
    const url = "https://openapi.koreainvestment.com:9443//uapi/domestic-stock/v1/quotations/inquire-index-price"
    const getAccessToken = await this.redisClient.send('get_key', "AccessToken").toPromise();
    const headers = {
      'Content-Type': 'application/json; charset=UTF-8',
      'authorization': getAccessToken,
      'appkey': this.appkey,
      'appsecret': this.appsecret,
      'tr_id': 'FHPUP02100000', // 주식 차트 데이터 요청 ID
      "custtype": "P"
    };
    const kospi_response_params = {
      FID_COND_MRKT_DIV_CODE: 'U',
      FID_INPUT_ISCD: "0001",
    };
    const kosdak_response_params = {
      FID_COND_MRKT_DIV_CODE: 'U',
      FID_INPUT_ISCD: "1001",
    };
    const kospi200_response_params = {
      FID_COND_MRKT_DIV_CODE: 'U',
      FID_INPUT_ISCD: "2001",
    };

    //환율 지수 가져오기
    const exchange_rate_url = "https://openapi.koreainvestment.com:9443/uapi/overseas-price/v1/quotations/inquire-daily-chartprice"
    const exchange_rate_headers = {
      'Content-Type': 'application/json; charset=UTF-8',
      'authorization': getAccessToken,
      'appkey': this.appkey,
      'appsecret': this.appsecret,
      'tr_id': 'FHKST03030100', // 주식 차트 데이터 요청 ID
      "custtype": "P"
    };
    const exchange_rate_USD_params = {
      FID_COND_MRKT_DIV_CODE	: 'N',
      FID_INPUT_ISCD: "FX@KRWKFTC",
      FID_INPUT_DATE_1:this.getCurrentDate(),
      FID_INPUT_DATE_2	:this.getCurrentDate(),
      FID_PERIOD_DIV_CODE :"D"
    };
    const exchange_rate_JPY_params = {
      FID_COND_MRKT_DIV_CODE	: 'N',
      FID_INPUT_ISCD: "FX@KRWJS",
      FID_INPUT_DATE_1: this.getCurrentDate(),
      FID_INPUT_DATE_2	:this.getCurrentDate(),
      FID_PERIOD_DIV_CODE :"D"
    };
    
    try {
      const [kospi_response, kosdak_response, kospi200_response, exchange_rate_USD_response, exchange_rate_JPY_response] = await Promise.all([
        axios.get(url, { headers: headers, params: kospi_response_params }),
        axios.get(url, { headers: headers, params: kosdak_response_params }),
        axios.get(url, { headers: headers, params: kospi200_response_params }),
        axios.get(exchange_rate_url, { headers: exchange_rate_headers, params: exchange_rate_USD_params }),
        axios.get(exchange_rate_url, { headers: exchange_rate_headers, params: exchange_rate_JPY_params })
      ]);
      // console.log(kospi_response)
      // console.log(kosdak_response)
      // console.log(kospi200_response)
      // console.log(exchange_rate_USD_response)
      // console.log(exchange_rate_JPY_response)
      
      return {
        kospi: {bstp_nmix_prpr : kospi_response.data.output.bstp_nmix_prpr, bstp_nmix_prdy_vrss : kospi_response.data.output.bstp_nmix_prdy_vrss, bstp_nmix_prdy_ctrt : kospi_response.data.output.bstp_nmix_prdy_ctrt,},
        kosdak: {bstp_nmix_prpr : kosdak_response.data.output.bstp_nmix_prpr, bstp_nmix_prdy_vrss : kosdak_response.data.output.bstp_nmix_prdy_vrss, bstp_nmix_prdy_ctrt : kosdak_response.data.output.bstp_nmix_prdy_ctrt,},
        kospi200: {bstp_nmix_prpr : kospi200_response.data.output.bstp_nmix_prpr, bstp_nmix_prdy_vrss : kospi200_response.data.output.bstp_nmix_prdy_vrss, bstp_nmix_prdy_ctrt : kospi200_response.data.output.bstp_nmix_prdy_ctrt,},
        exchange_rate_USD: {ovrs_nmix_prpr :exchange_rate_USD_response.data.output1.ovrs_nmix_prpr, ovrs_nmix_prdy_vrss:exchange_rate_USD_response.data.output1.ovrs_nmix_prdy_vrss, prdy_ctrt:exchange_rate_USD_response.data.output1.prdy_ctrt},
        exchange_rate_JPY: {ovrs_nmix_prpr :exchange_rate_JPY_response.data.output1.ovrs_nmix_prpr, ovrs_nmix_prdy_vrss:exchange_rate_JPY_response.data.output1.ovrs_nmix_prdy_vrss, prdy_ctrt:exchange_rate_JPY_response.data.output1.prdy_ctrt},
      };
    } catch (error) {
      throw new Error('지수 데이터 조회 실패');
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
