import util from 'util'
import * as child from 'child_process'

const execProm = util.promisify(child.exec)

async function getSensorData() {
    return execProm('sensors -j')
        .then(({ stdout }) => JSON.parse(stdout))

        .catch(_err => {
            return {}
        })
}

async function getLspciData() {
    return execProm('lspci -mmv -nnv | jc --lspci')
        .then(({ stdout }) => JSON.parse(stdout))

        .catch(_err => {
            return []
        })
}

// Use when testing on windows...
const localSensorsData = {
    "i350bb-pci-1704": {
        "Adapter": "PCI adapter",
        "loc1": {
            "temp1_input": 54.000,
            "temp1_max": 120.000,
            "temp1_crit": 110.000
        }
    },
    "i350bb-pci-1703": {
        "Adapter": "PCI adapter",
        "loc1": {
            "temp1_input": 54.000,
            "temp1_max": 120.000,
            "temp1_crit": 110.000
        }
    },
    "coretemp-isa-0000": {
        "Adapter": "ISA adapter",
        "Package id 0": {
            "temp1_input": 39.000,
            "temp1_max": 81.000,
            "temp1_crit": 91.000,
            "temp1_crit_alarm": 0.000
        },
        "Core 0": {
            "temp2_input": 34.000,
            "temp2_max": 81.000,
            "temp2_crit": 91.000,
            "temp2_crit_alarm": 0.000
        },
        "Core 1": {
            "temp3_input": 32.000,
            "temp3_max": 81.000,
            "temp3_crit": 91.000,
            "temp3_crit_alarm": 0.000
        },
        "Core 2": {
            "temp4_input": 32.000,
            "temp4_max": 81.000,
            "temp4_crit": 91.000,
            "temp4_crit_alarm": 0.000
        },
        "Core 3": {
            "temp5_input": 30.000,
            "temp5_max": 81.000,
            "temp5_crit": 91.000,
            "temp5_crit_alarm": 0.000
        },
        "Core 4": {
            "temp6_input": 32.000,
            "temp6_max": 81.000,
            "temp6_crit": 91.000,
            "temp6_crit_alarm": 0.000
        },
        "Core 5": {
            "temp7_input": 31.000,
            "temp7_max": 81.000,
            "temp7_crit": 91.000,
            "temp7_crit_alarm": 0.000
        },
        "Core 6": {
            "temp8_input": 31.000,
            "temp8_max": 81.000,
            "temp8_crit": 91.000,
            "temp8_crit_alarm": 0.000
        },
        "Core 7": {
            "temp9_input": 34.000,
            "temp9_max": 81.000,
            "temp9_crit": 91.000,
            "temp9_crit_alarm": 0.000
        },
        "Core 8": {
            "temp10_input": 32.000,
            "temp10_max": 81.000,
            "temp10_crit": 91.000,
            "temp10_crit_alarm": 0.000
        },
        "Core 9": {
            "temp11_input": 39.000,
            "temp11_max": 81.000,
            "temp11_crit": 91.000,
            "temp11_crit_alarm": 0.000
        },
        "Core 10": {
            "temp12_input": 33.000,
            "temp12_max": 81.000,
            "temp12_crit": 91.000,
            "temp12_crit_alarm": 0.000
        },
        "Core 11": {
            "temp13_input": 29.000,
            "temp13_max": 81.000,
            "temp13_crit": 91.000,
            "temp13_crit_alarm": 0.000
        },
        "Core 12": {
            "temp14_input": 35.000,
            "temp14_max": 81.000,
            "temp14_crit": 91.000,
            "temp14_crit_alarm": 0.000
        },
        "Core 13": {
            "temp15_input": 32.000,
            "temp15_max": 81.000,
            "temp15_crit": 91.000,
            "temp15_crit_alarm": 0.000
        },
        "Core 14": {
            "temp16_input": 33.000,
            "temp16_max": 81.000,
            "temp16_crit": 91.000,
            "temp16_crit_alarm": 0.000
        },
        "Core 15": {
            "temp17_input": 35.000,
            "temp17_max": 81.000,
            "temp17_crit": 91.000,
            "temp17_crit_alarm": 0.000
        }
    }
}


export { getSensorData, getLspciData }