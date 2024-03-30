import { serve } from 'bun';
import { capacities } from './routes/capacities';
import { nodeInfo } from './routes/nodeInfo';
import { status } from './routes/status';
import { gpuInfo } from './routes/gpuInfo';
import { loadConfig } from './config/config';
import log from './log';

loadConfig();

const port = 8081;

log.info('Starting server on port', port);

serve({
    port: port,
    async fetch(request: Request) {
        const startTime = Date.now();
        const { pathname } = new URL(request.url);
        let response: Response;

        switch (pathname) {
            case '/capacities':
                response = await capacities(request);
                break;
            case '/nodeInfo':
                response = await nodeInfo(request);
                break;
            case '/status':
                response = await status(request);
                break;
            case '/gpuInfo':
                response = await gpuInfo(request);
                break;
            default:
                response = new Response('Not Found', { status: 404 });
                break;
        }

        const duration = Date.now() - startTime;
        const httpStatus = response.status || 200; // Default to 200 if not specified

        log.info(`[${request.method}] ${pathname} ${httpStatus} ${duration}ms`);

        return response;
    },
});