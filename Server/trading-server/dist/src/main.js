"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.connectMicroservice({ transport: microservices_1.Transport.REDIS, options: { port: 6379, host: "redis" } });
    app.useGlobalPipes(new common_1.ValidationPipe({ transform: true }));
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
//# sourceMappingURL=main.js.map