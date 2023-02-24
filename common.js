import util from "util";
import * as child from "child_process";

const execProm = util.promisify(child.exec);

async function getSensorData() {
    return execProm("sensors -j")
        .then(({ stdout }) => JSON.parse(stdout))

        .catch((err) => {
            console.log(err);
            return {};
        });
}

async function getLspciData() {
    return execProm("lspci -mmv -nnv | jc --lspci")
        .then(({ stdout }) => JSON.parse(stdout))

        .catch((err) => {
            console.log(err);
            return [];
        });
}

function convertToGb(bytes) {
    return parseInt(Math.round(bytes / 1073741824));
}

// Use when testing on windows...
const localSensorsData = {
    "i350bb-pci-1704": {
        Adapter: "PCI adapter",
        loc1: {
            temp1_input: 54.0,
            temp1_max: 120.0,
            temp1_crit: 110.0,
        },
    },
    "i350bb-pci-1703": {
        Adapter: "PCI adapter",
        loc1: {
            temp1_input: 54.0,
            temp1_max: 120.0,
            temp1_crit: 110.0,
        },
    },
    "coretemp-isa-0000": {
        Adapter: "ISA adapter",
        "Package id 0": {
            temp1_input: 39.0,
            temp1_max: 81.0,
            temp1_crit: 91.0,
            temp1_crit_alarm: 0.0,
        },
        "Core 0": {
            temp2_input: 34.0,
            temp2_max: 81.0,
            temp2_crit: 91.0,
            temp2_crit_alarm: 0.0,
        },
        "Core 1": {
            temp3_input: 32.0,
            temp3_max: 81.0,
            temp3_crit: 91.0,
            temp3_crit_alarm: 0.0,
        },
        "Core 2": {
            temp4_input: 32.0,
            temp4_max: 81.0,
            temp4_crit: 91.0,
            temp4_crit_alarm: 0.0,
        },
        "Core 3": {
            temp5_input: 30.0,
            temp5_max: 81.0,
            temp5_crit: 91.0,
            temp5_crit_alarm: 0.0,
        },
        "Core 4": {
            temp6_input: 32.0,
            temp6_max: 81.0,
            temp6_crit: 91.0,
            temp6_crit_alarm: 0.0,
        },
        "Core 5": {
            temp7_input: 31.0,
            temp7_max: 81.0,
            temp7_crit: 91.0,
            temp7_crit_alarm: 0.0,
        },
        "Core 6": {
            temp8_input: 31.0,
            temp8_max: 81.0,
            temp8_crit: 91.0,
            temp8_crit_alarm: 0.0,
        },
        "Core 7": {
            temp9_input: 34.0,
            temp9_max: 81.0,
            temp9_crit: 91.0,
            temp9_crit_alarm: 0.0,
        },
        "Core 8": {
            temp10_input: 32.0,
            temp10_max: 81.0,
            temp10_crit: 91.0,
            temp10_crit_alarm: 0.0,
        },
        "Core 9": {
            temp11_input: 39.0,
            temp11_max: 81.0,
            temp11_crit: 91.0,
            temp11_crit_alarm: 0.0,
        },
        "Core 10": {
            temp12_input: 33.0,
            temp12_max: 81.0,
            temp12_crit: 91.0,
            temp12_crit_alarm: 0.0,
        },
        "Core 11": {
            temp13_input: 29.0,
            temp13_max: 81.0,
            temp13_crit: 91.0,
            temp13_crit_alarm: 0.0,
        },
        "Core 12": {
            temp14_input: 35.0,
            temp14_max: 81.0,
            temp14_crit: 91.0,
            temp14_crit_alarm: 0.0,
        },
        "Core 13": {
            temp15_input: 32.0,
            temp15_max: 81.0,
            temp15_crit: 91.0,
            temp15_crit_alarm: 0.0,
        },
        "Core 14": {
            temp16_input: 33.0,
            temp16_max: 81.0,
            temp16_crit: 91.0,
            temp16_crit_alarm: 0.0,
        },
        "Core 15": {
            temp17_input: 35.0,
            temp17_max: 81.0,
            temp17_crit: 91.0,
            temp17_crit_alarm: 0.0,
        },
    },
};

export const NVIDIA_VENDOR_ID = "10de";

export { getSensorData, getLspciData, convertToGb };
