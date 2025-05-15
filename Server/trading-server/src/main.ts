import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';


async function bootstrap() {
 
  // 2️⃣ HTTP/WebSocket 서버 실행 (8080)
  const app = await NestFactory.create(AppModule);


  //마이크로 서비스를 사용해서 트래픽을 줄이기 위해서 redis 서버를 분리한다 (21번째줄에 따로 서버를 실행하는 코드가 있다)
  app.connectMicroservice<MicroserviceOptions>({transport : Transport.REDIS, options : { port : 6379, host:"redis" }})

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors({
    origin: "*",
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization,X-XSRF-TOKEN,Cookie',
    credentials: true,
  });

  await app.startAllMicroservices();
  await app.listen(4000);

  console.log('🚀 HTTP/WebSocket Server is running on port 4000');
}

bootstrap();
