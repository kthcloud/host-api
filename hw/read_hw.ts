import util from "util";
import * as child from "child_process";
import { XMLParser } from "fast-xml-parser";
import fs from "fs";
import log from "../log";

const useMock: boolean = process.env.USE_MOCK === "true";

export type SensorData = {
    [key: string]: number;
};

export type AdapterData = {
    Adapter: string;
    [location: string]: SensorData | string; // Mixed type, could be a string (for the Adapter) or SensorData
};

export type SystemSensors = {
    [deviceName: string]: AdapterData;
};

if (useMock) {
    log.info("Using mock data");
}

const execProm = util.promisify(child.exec);

async function getSensorData(): Promise<SystemSensors> {
    if (useMock) {
        return JSON.parse(localSensorsData);
    }

    return execProm("sensors -j")
        .then(({ stdout }) => stdout)
        .catch((err) => {
            if (useMock) {
                return localSensorsData;
            }
            throw err;
        })
        .then((json: string) => JSON.parse(json))
        .catch((err) => {
            // If error contains "No sensors found!" return empty object and log "No sensors found, is the correct version of lm-sensors installed?"
            if (err.message.includes("No sensors found!")) {
                log.error("No sensors found, is the correct version of lm-sensors installed?");
                return {};
            }
            log.error(err);
            return {};
        });
}

async function getLspciData(): Promise<any> {
    if (useMock) {
        return JSON.parse(localLspciData);
    }

    return execProm("lspci -mmv -nnv | jc --lspci")
        .then(({ stdout }) => stdout)
        .catch((err) => {
            if (useMock) {
                return localLspciData;
            }
            throw err;
        })
        .then((json: string) => JSON.parse(json))
        .catch((err) => {
            log.error(err);
            return [];
        });
}

async function getLshwData(): Promise<any> {
    if (useMock) {
        return new XMLParser().parse(localLshwData);
    }

    return execProm("lshw -class display -xml")
        .then(({ stdout }) => stdout)
        .catch((err) => {
            if (useMock) {
                return localLshwData;
            }
            throw err;
        })
        .then((xml: string) => new XMLParser().parse(xml))
        .catch((err) => {
            log.error(err);
            return [];
        });
}

function convertToGb(bytes: number): number {
    return Math.round(bytes / 1073741824);
}

// Mock data
let localSensorsData: string;
let localLshwData: string;
let localLspciData: string;

// Improved readFile function to use async/await pattern
async function readFile(path: string): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.readFile(path, "utf8", (err, data) => {
            if (err) {
                console.error(`Error reading file from disk: ${err}`);
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

// Async IIFE to load mock data
(async () => {
    localSensorsData = await readFile("mock/sensors.json");
    localLshwData = await readFile("mock/lshw.xml");
    localLspciData = await readFile("mock/lspci.json");
})();

export const NVIDIA_VENDOR_ID: string = "10de";

export { getSensorData, getLspciData, getLshwData, convertToGb };