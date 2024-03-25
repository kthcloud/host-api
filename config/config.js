import fs from 'fs';
import yaml from 'js-yaml';

// Define a global variable to hold the configuration
global.appConfig = {};

// Function to load configuration from a YAML file
function loadConfig() {
    console.log('Loading configuration...');
    try {
        // Read the file content
        const fileContents = fs.readFileSync('/etc/kthcloud/config.yml', 'utf8');

        // Parse the YAML string to a JavaScript object
        const parsedConfig = yaml.load(fileContents);

        // Assign the parsed configuration to the global variable
        global.appConfig = parsedConfig;

        console.log('Configuration loaded successfully.');
    } catch (e) {
        console.error('Failed to load the configuration:', e);
    }
}

// Call the function to load the configuration
loadConfig();

export default global.appConfig;