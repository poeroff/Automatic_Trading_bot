import { Server } from 'socket.io';
import { LiveIndexService } from 'src/live_index/live_index.service';
export declare class EventsGateway {
    private readonly liveIndexService;
    server: Server;
    constructor(liveIndexService: LiveIndexService);
    handleKospiIndexRequest(): Promise<void>;
}
