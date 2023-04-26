import express from "express";
import * as si from "systeminformation";
import { getSensorData } from "../common.js";

const routes = express.Router();

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
      (parseFloat(rawResult.active) / parseFloat(rawResult.total)) * 100.0
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

function getGpuSensorValue(sensorValues) {
  for (let [sensorName, sensorValue] of Object.entries(sensorValues)) {
    for (let split of sensorName.split("_")) {
      if (split === "input") {
        try {
          return parseInt(sensorValue)
        } catch (error) {
          return 0;
        }
      }
    }
  }
  return 0;
}

function getGpuSensorField(gpuSensor) {
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

async function getGpuTemp() {
  return getSensorData()
    .then((sensorsData) => {
      const gpuSensors = Object.values(sensorsData).filter(
        (sensor) => sensor.Adapter === "PCI adapter"
      );

      return gpuSensors.map((gpuSensor) => {
        return {
          main: getGpuSensorField(gpuSensor),
        };
      });
    })
    .catch((error) => {
      console.error(`Could not execute sensors command: ${error}`);
      return 0;
    });
}

routes.get("/status", async (req, res) => {
  // Make all system request
  let status = {
    cpu: {
      temp: getCpuTemp(),
      load: getCpuLoad(),
    },
    ram: {
      load: getRamLoad(),
    },
    network: {
      usage: getNetworkUsage(),
    },
  };

  let gpuTemp = await getGpuTemp();

  // Await all requests
  gpuTemp = await gpuTemp;
  status.cpu.temp = await status.cpu.temp;
  status.cpu.load = await status.cpu.load;
  status.ram.load = await status.ram.load;
  status.network.usage = await status.network.usage;

  // Zero means either that the GPU doesn't exist, or the parsing failed
  if (gpuTemp != 0) {
    status.gpu = {
      temp: gpuTemp,
    };
  }

  res.status(200).json(status);
});

export default routes;
