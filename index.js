const core = require('@actions/core')
const exec = require('@actions/exec')

const run = async () => {
    try {
        const workspace = core.getInput('workspace');
        const title = core.getInput('title');
        await exec.exec(`echo the name of the workspace is ${workspace}`);
        await exec.exec(`ls`);
        console.log("A tag will be added to the following commit")
        await exec.exec("git log -n1");
        const { stdout } = await exec.exec("git describe --tags --abbrev=0");

        // ========================================================================
        // If there is an improper tag create a new tag from scratch
        // ========================================================================
        if (!stdout) {
            console.log("No previous tag found. Creating a new tag")
            console.log("--> v0.0.0")
            return
        }

        const argument = title.split(":")[0].toLowerCase()
        const version = stdout.split(".")

        // =========================================================================
        // There is a strict assumption that all versions will be in the form v0.0.0
        // =========================================================================
        //Take the first part v0 and remove the v to just obtain the number
        let major = version[0].slice(1)

        // Take the second part
        let minor = version[1]

        // Take the third part
        let patch = version[2]

        // ========================================================================
        // If there is an improper tag create a new tag from scratch
        // ========================================================================
        if (!major || !minor || !patch) {
            console.log("Previous tag was does not follow the format: v0.0.0. Creating a new tag")
            console.log("--> v0.0.0")
            return
        }

        // =========================================================================
        // Update the semantic version according to the Pull Request Title
        // =========================================================================
        if (argument == "feature" || argument == "feat") {
            console.log("This is a feature")
            major += 1
        } else if (argument == "fix") {
            console.log("This is a fix")
            minor += 1
        }
        else if (argument == "patch") {
            console.log("This is a patch")
            patch += 1
        } else {
            console.log("Unknown prefix for PR: argument")
            return
        }

        await exec.exec(`git tag v${major}.${minor}.${patch}`);
        await exec.exec(`git push origin --tags`);
        console.log("A tag will be added to the following commit")

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();