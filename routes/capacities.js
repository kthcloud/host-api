import express from 'express'

import { getSensorData } from '../common.js'

const routes = express.Router()

async function getGpuCount() {
    return getSensorData()
        .then(sensorsData => {
            return Object.values(sensorsData).reduce((acc, item) => {
                if (item.Adapter === 'PCI adapter') {
                    return acc + 1
                }
                return acc
            }, 0)
        })
        .catch(error => {
            console.error(`Could not execute sensors command: ${error}`);
            return 0
        })
}

routes.get('/capacities', async (_req, res) => {
    // Make all capacity request
    let capacities = {
        gpu: {
            count: getGpuCount()
        }
    }

    // Await all requests
    capacities.gpu.count = await capacities.gpu.count

    res.status(200).json(capacities)
})

export default routes