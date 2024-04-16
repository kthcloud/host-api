import * as si from "systeminformation";
import { getSensorData, type AdapterData, type SensorData } from "../hw/read_hw";

type GpuTemp = {
  main: number,
};

type GpuStatus = {
  temp: GpuTemp[],
};

type CpuStatus = {
  temp: {
    main: number,
    cores: number[],
    max: number,
  },
  load: {
    main: number,
    cores: number[],
  },
};

type RamStatus = {
  load: {
    main: number,
  }
};

type NetworkStatus = {
  usage: {
    rxSec: number,
    txSec: number,
  },
};

type Status = {
  cpu: CpuStatus,
  ram: RamStatus,
  network: NetworkStatus,
  gpu: GpuStatus | undefined,
};

async function getCpuTemp() {
  return si.cpuTemperature().then((rawResult) => {
    return {
      main: rawResult.main ? rawResult.main : 0,
      cores: rawResult.cores ? rawResult.cores : [],
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

function getGpuSensorValue(sensorValues: SensorData | string): number {
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

function getGpuSensorField(gpuSensor: AdapterData): number {
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


async function getGpuTemp(): Promise<GpuTemp[]> {
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
  let status: Status = {
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
    gpu: undefined,
  };

  let gpuTemp = await getGpuTemp();
  if (gpuTemp.length > 0) {
    status.gpu = {
      temp: gpuTemp,
    };
  }

  return new Response(JSON.stringify(status), {
    headers: {
      "content-type": "application/json",
    },
  });
}