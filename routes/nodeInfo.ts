
import {getConfig} from '../config/config';

export async function nodeInfo(req: Request): Promise<Response> {
    let response = {
        zone: getConfig().zone,
    }

    return new Response(JSON.stringify(response), {
        headers: {
            "content-type": "application/json",
        },
    });
}