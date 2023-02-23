import express from "express";

import { getLspciData } from "../common.js";

const routes = express.Router();

async function getGpuCount() {
    return getLspciData()
        .then((lspciData) => {
            let count = 0;
            for (let i = 0; i < lspciData.length; i++) {
                const deviceObject = lspciData[i];
                if (
                    deviceObject.vendor_id === NVIDIA_VENDOR_ID &&
                    deviceObject.class.includes("VGA")
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

routes.get("/capacities", async (_req, res) => {
    // Make all capacity request
    let capacities = {
        gpu: {
            count: getGpuCount(),
        },
    };

    // Await all requests
    capacities.gpu.count = await capacities.gpu.count;

    res.status(200).json(capacities);
});

export default routes;
