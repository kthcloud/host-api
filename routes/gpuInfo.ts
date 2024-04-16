import { getLspciData, NVIDIA_VENDOR_ID } from "../hw/read_hw";

type GPUInfo = {
    name: string;
    slot: string;
    bus: string;
    vendor: string;
    vendorId: string;
    deviceId: string;
    passthrough: boolean;
};

async function getGpuInfo() {
    return getLspciData()
        .then((lspciData) => {
            var result : GPUInfo[] = [];
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

                    let passthrough = false;
                    if (deviceObject.driver && deviceObject.driver === "vfio-pci") {
                        passthrough = true;
                    }

                    result.push({
                        name: gpuName,
                        slot: deviceObject.slot,
                        bus: deviceObject.bus,
                        vendor: deviceObject.vendor,
                        vendorId: deviceObject.vendor_id,
                        deviceId: deviceObject.device_id,
                        passthrough: passthrough,
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

export async function gpuInfo(req: Request): Promise<Response> {
    let gpuInfo = await getGpuInfo();

    return new Response(JSON.stringify(gpuInfo), {
        headers: {
            "content-type": "application/json",
        },
    });
}