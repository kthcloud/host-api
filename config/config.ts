import fs from 'fs';
import yaml from 'js-yaml';
import log from '../log';


// Define a type for the configuration
type Config = {
    zone: string;
};

// Declare a global namespace to extend the global variable with our config
declare global {
    // Extend the NodeJS global type with our new appConfig property
    var appConfig: Config;
}

// Initialize the appConfig global variable with an initial value
global.appConfig = { zone: '' };

export function getConfig(): Config {
    return global.appConfig;
}

// Function to load configuration from a YAML file
export function loadConfig(): void {
    try {
        // Read the file content
        const fileContents = fs.readFileSync('/etc/kthcloud/config.yml', 'utf8');

        // Parse the YAML string to a JavaScript object
        const parsedConfig = yaml.load(fileContents);

        if (typeof parsedConfig === 'object' && parsedConfig !== null && 'zone' in parsedConfig) {
            // Assign the parsed configuration to the global variable, ensuring it matches the Config type
            global.appConfig = parsedConfig as Config;

            log.info('Configuration loaded successfully');
        } else {
            log.error('Invalid configuration file: The configuration file must contain a "zone" property');
        }
    } catch (e) {
        log.error('Error loading configuration file:', e);
    }
}
