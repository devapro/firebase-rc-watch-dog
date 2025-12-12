const fs = require('fs');

const firebaseRetriever = require('./firebase_retriever.js');

async function createRC(conditionName) {
    const newConfig = await firebaseRetriever.retrieveData();
    const newVersion = newConfig.version.versionNumber;

    const path = "./data/" + newVersion + "_config.json";

    const configStr = JSON.stringify(newConfig, null, 2);
    fs.writeFileSync(path, configStr);
    console.log(`Config saved to ${path}`);

    const rcValues = {}

    Object.keys(newConfig.parameters).forEach(key => {
        const config = newConfig.parameters[key];
        let defaultValue = config.defaultValue.value;
        if (config.conditionalValues !== undefined && config.conditionalValues[conditionName] !== undefined) {
            defaultValue = config.conditionalValues[conditionName].value;
        }
        if (defaultValue !== undefined) {
            rcValues[key] = defaultValue;
        }
    })

    const rcValuesPath = "./data/" + newVersion + "_rc.json";
    const rcConfigStr = JSON.stringify(rcValues, null, 2);

    console.log(rcConfigStr)

    fs.writeFileSync(rcValuesPath, rcConfigStr);
    console.log(`RC Config saved to ${rcValuesPath}`);
}

const conditionName = process.argv[2];

if (!conditionName) {
    console.error('Error: Please provide a condition name as a command line argument');
    console.log('Usage: node rc_conditions_mapper.js <condition_name>');
    process.exit(1);
}

createRC(conditionName);