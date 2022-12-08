import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors'

import status from './routes/status.js';
import capacities from './routes/capacities.js';

const app = express(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/', status, capacities);

const port = process.env.PORT || 8081;
app.listen(port);
console.log('server started on port: ' + port);

