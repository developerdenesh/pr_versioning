const core = require('@actions/core')
const exec = require('@actions/exec')

const run = async () => {
    try {
        const name = core.getInput('name');
        // await exec.exec(`Hello ${name}`);
        console.log(`Hello ${name}`)
    } catch(error) {
        core.setFailed(error.message);
    }
}

run();