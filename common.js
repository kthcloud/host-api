import util from "util";
import * as child from "child_process";
import { XMLParser } from "fast-xml-parser";
import fs from "fs";

const useMock = process.env.USE_MOCK === "true";
if (useMock) {
    console.log("Using mock data");
}

const execProm = util.promisify(child.exec);

async function getSensorData() {
    return execProm("sensors -j")
        .then(({ stdout }) => stdout)

        .catch((err) => {
            if (useMock) {
                return localSensorsData;
            }
            throw err;
        })

        .then((json) => JSON.parse(json))

        .catch((err) => {
            console.log(err);
            return {};
        });
}

async function getLspciData() {
    return execProm("lspci -mmv -nnv | jc --lspci")
        .then(({ stdout }) => stdout)

        .catch((err) => {
            if (useMock) {
                return localLspciData;
            }
            throw err;
        })

        .then((json) => JSON.parse(json))

        .catch((err) => {
            console.log(err);
            return [];
        });
}



async function getLshwData() {
    return execProm("lshw -class display -xml")
        .then(({ stdout }) => stdout)

        .catch((err) => {
            if (useMock) {
                return localLshwData;
            }
            throw err;
        })

        .then((xml) => new XMLParser().parse(xml))

        .catch((err) => {
            console.log(err);
            return [];
        });
}

function convertToGb(bytes) {
    return parseInt(Math.round(bytes / 1073741824));
}


// read from mock/sensors.json
const localSensorsData = await readFile("mock/sensors.json")
const localLshwData = await readFile("mock/lshw.xml")
const localLspciData = await readFile("mock/lspci.json")

async function readFile(path) {
    return fs.readFileSync(path, "utf8",
        (err, data) => {
            if (err) {
                console.error(`Error reading file from disk: ${err}`);
                return null;
            }
            return data;
        }
    );
}


export const NVIDIA_VENDOR_ID = "10de";

export { getSensorData, getLspciData, getLshwData, convertToGb };
