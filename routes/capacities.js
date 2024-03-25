import express from "express";
import * as si from "systeminformation";

import { getLspciData, NVIDIA_VENDOR_ID, convertToGb } from "../common.js";
import global from "../config/config.js";

const routes = express.Router();

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

routes.get("/capacities", async (_req, res) => {
    // Make all capacity request
    let capacities = {
        gpu: {
            count: getGpuCount(),
        },
        ram: getRam(),
    };

    // Await all requests
    capacities.gpu.count = await capacities.gpu.count;
    capacities.ram = await capacities.ram;

    // Append zone information to the response
    capacities = {
        ...capacities,
        zone: global.zone,
    };

    res.status(200).json(capacities);
});

export default routes;
