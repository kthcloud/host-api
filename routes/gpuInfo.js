import express from "express";

import { getLspciData, NVIDIA_VENDOR_ID } from "../common.js";
import global from "../config/config.js";

const routes = express.Router();

async function getGpuInfo() {
    return getLspciData()
        .then((lspciData) => {
            var result = [];
            for (var i = 0; i < lspciData.length; i++) {
                const deviceObject = lspciData[i];

                if (!deviceObject.vendor_id || !deviceObject.class || !deviceObject.device || !deviceObject.slot || !deviceObject.bus || !deviceObject.vendor || !deviceObject.device_id) {
                    continue;
                }

                const isNvidiaGpu = deviceObject.vendor_id === NVIDIA_VENDOR_ID;
                const isVgaClass = deviceObject.class.includes("VGA");
                const is3dControllerClass = deviceObject.class.includes("3D controller");

                if (isNvidiaGpu && (isVgaClass || is3dControllerClass)) {

                    let gpuName = deviceObject.device;
                    if (gpuName.includes("[")) {
                        var start = gpuName.indexOf("[");
                        var end = gpuName.indexOf("]");
                        gpuName = gpuName.substring(start + 1, end);
                    }

                    result.push({
                        name: gpuName,
                        slot: deviceObject.slot,
                        bus: deviceObject.bus,
                        vendor: deviceObject.vendor,
                        vendorId: deviceObject.vendor_id,
                        deviceId: deviceObject.device_id,
                    });
                }

            }

            return result;
        })
        .catch((error) => {
            console.error(`Could not execute lspci command: ${error}`);
            return 0;
        });
}

routes.get("/gpuInfo", async (_req, res) => {
    let gpuInfo = await getGpuInfo();

    // Append zone information to the response
    gpuInfo = gpuInfo.map((gpu) => {
        return {
            ...gpu,
            zone: global.zone,
        };
    });

    res.status(200).json(gpuInfo);
});

export default routes;
