import * as si from "systeminformation";

import { getLspciData, NVIDIA_VENDOR_ID, convertToGb } from "../hw/read_hw";


async function getGpuCount() {
    return getLspciData()
        .then((lspciData) => {
            let count = 0;
            for (let i = 0; i < lspciData.length; i++) {
                const deviceObject = lspciData[i];

                if (!deviceObject.vendor_id || !deviceObject.class) {
                    continue;
                }


                const isNvidiaGpu = deviceObject.vendor_id === NVIDIA_VENDOR_ID;
                const isVgaClass = deviceObject.class.includes("VGA");
                const is3dControllerClass = deviceObject.class.includes("3D controller");


                if (
                    isNvidiaGpu &&
                    (isVgaClass || is3dControllerClass)
                ) {
                    count++;
                }
            }

            return count;
        })
        .catch((error) => {
            console.error(`Could not execute lspci command: ${error}`);
            return 0;
        });
}

async function getRam() {
    return si.mem().then((rawResult) => {
        return {
            total: convertToGb(rawResult.total),
        };
    });
}

async function getCpu() {
    return si.cpu().then((rawResult) => {
        return {
            cores: rawResult.cores,
            vendor: rawResult.vendor,
        };
    });
}

export async function capacities(req: Request): Promise<Response> {
    // Make all capacity request
    let capacities = {
        gpu: {
            count: await getGpuCount(),
        },
        ram: await getRam(),
        cpu: await getCpu(),
    };

    return new Response(JSON.stringify(capacities), {
        headers: {
            "content-type": "application/json",
        },
    });
}

