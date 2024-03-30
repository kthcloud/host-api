import * as si from "systeminformation";
import { getSensorData, type AdapterData, type SensorData } from "../hw/read_hw";

async function getCpuTemp() {
  return si.cpuTemperature().then((rawResult) => {
    return {
      main: rawResult.main ? rawResult.main : 0,
      cores: rawResult.cores ? rawResult.cores : 0,
      max: rawResult.max ? rawResult.max : 0,
    };
  });
}

async function getCpuLoad() {
  return si.currentLoad().then((rawResult) => {
    return {
      main: Math.round(rawResult.currentLoad),
      cores: rawResult.cpus.map((cpu) => Math.round(cpu.load)),
    };
  });
}

async function getRamLoad() {
  return si.mem().then((rawResult) => {
    const load = Math.round(
      (rawResult.active / rawResult.total) * 100.0
    );
    return {
      main: load,
    };
  });
}

async function getNetworkUsage() {
  return si.networkStats().then((rawResult) => {
    const seconds = rawResult[0].ms / 1000.0;
    return {
      rxSec:
        rawResult[0].rx_sec == null
          ? 0
          : Math.round(rawResult[0].rx_sec),
      txSec:
        rawResult[0].tx_sec == null
          ? 0
          : Math.round(rawResult[0].tx_sec),
    };
  });
}

function getGpuSensorValue(sensorValues: SensorData | string) : number{
  for (let [sensorName, sensorValue] of Object.entries(sensorValues)) {
    for (let split of sensorName.split("_")) {
      if (split === "input") {
        try {
          return sensorValue
        } catch (error) {
          return 0;
        }
      }
    }
  }
  return 0;
}

function getGpuSensorField(gpuSensor: AdapterData) : number {
  for (let [sensorLocation, sensorValues] of Object.entries(gpuSensor)) {
    if (
      sensorLocation.includes("loc") ||
      sensorLocation.includes("Composite") ||
      sensorLocation.includes("temp1")
    ) {
      return getGpuSensorValue(sensorValues);
    }
  }
  return 0;
}

type GpuTemp = {
  main: number,
};

async function getGpuTemp() : Promise<GpuTemp[]> {
  return getSensorData()
    .then(sensorsData => {
      const gpuSensors = Object.values(sensorsData).filter(
        sensor => sensor.Adapter === "PCI adapter"
      );

      return gpuSensors.map((gpuSensor) => {
        return {
          main: getGpuSensorField(gpuSensor),
        };
      });
    })
    .catch((error) => {
      console.error(`Could not execute sensors command: ${error}`);
      return [];
    })
}

export async function status(req: Request): Promise<Response> {
  // Make all system request
  let status = {
    cpu: {
      temp: await getCpuTemp(),
      load: await getCpuLoad(),
    },
    ram: {
      load: await getRamLoad(),
    },
    network: {
      usage: await getNetworkUsage(),
    },
    gpu: {
      temp: 0,
    },
  };

  let gpuTemp = await getGpuTemp();
  if (gpuTemp.length > 0) {
    // We only support average GPU temperature for now
    status.gpu.temp = gpuTemp.reduce((acc, gpu) => acc + gpu.main, 0) / gpuTemp.length;
  }

  return new Response(JSON.stringify(status), {
    headers: {
      "content-type": "application/json",
    },
  });
}