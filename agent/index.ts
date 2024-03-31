import log from "../log";
import { getConfig, loadConfig } from "../config/config";
import os from 'os';

type HostRegister = {
  name: string;
  displayName: string;
  ip: string;
  port: number;
  zone: string;
  token: string;
}

loadConfig();

function report() {
  log.info('Reporting status to the server');

  let config = getConfig();

  // Get the host information
  const host: HostRegister = {
    name: os.hostname(),
    displayName: config.displayName || os.hostname(),
    ip: config.ip || 'localhost',
    port: config.port || 8081,
    zone: config.zone,
    token: config.nodeToken,
  }

  fetch(config.statusServerEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(host),
  }).then((response) => {
    if (response.ok) {
      log.info('Status reported successfully');
    } else {
      // If 400, print the error message (json)
      if (response.status === 400) {
        response.json().then((data) => {
          log.error('Error reporting status:', data);
        });
      } else {
        log.error('Error reporting status:', response.statusText);
      }
    }
  }).catch((error) => {
    log.error(`Error reporting status (endpoint: ${config.statusServerEndpoint}): ${error}`);
  });
}

report();
