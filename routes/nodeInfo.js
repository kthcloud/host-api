import express from "express";
import global from "../config/config.js";

const routes = express.Router();

routes.get("/nodeInfo", async (_req, res) => {
    let response = {
        zone: global.zone,
    }

    res.status(200).json(response);
});

export default routes;