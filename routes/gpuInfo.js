import express from "express";

import { getLspciData, NVIDIA_VENDOR_ID } from "../common.js";

const routes = express.Router();

async function getGpuInfo() {
    return getLspciData()
        .then((lspciData) => {
            var result = [];
            for (var i = 0; i < lspciData.length; i++) {
                const deviceObject = lspciData[i];
                if (
                    deviceObject.vendor_id === NVIDIA_VENDOR_ID &&
                    deviceObject.class.includes("VGA")
                ) {
                    let gpuName = deviceObject.device;
                    if (gpuName.includes("[")) {
                        var start = gpuName.indexOf("[");
                        var end = gpuName.indexOf("]");
                        gpuName = gpuName.substring(start + 1, end);
                    }

                    result.push({
                        gpuName: gpuName,
                        slot: deviceObject.slot,
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

    res.status(200).json(gpuInfo);
});

export default routes;
