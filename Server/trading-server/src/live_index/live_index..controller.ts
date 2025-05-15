import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LiveIndexService } from './live_index.service';
import { ConfigService } from '@nestjs/config';



@Controller("liveindex")
export class LiveIndexController {
    constructor(private readonly liveindexservice: LiveIndexService, private configService : ConfigService) {}
    private readonly appkey = this.configService.get<string>('appkey')
    private readonly appsecret = this.configService.get<string>('appsecret')

    @Get("kospi")
    Kospiindex(){
       
      
    }

}
