const core = require('@actions/core')
const exec = require('@actions/exec')

const run = async () => {
    const minor_arguments = ["feat", "feature"]
    const patch_arguments = ["fix", "patch", "chore", "docs", "style", "refactor", "ref", "perf", "test", "build", "ci", "revert"]

    try {
        const workspace = core.getInput('workspace');
        const title = core.getInput('title');

        await exec.exec(`echo the name of the workspace is ${workspace}`);
        await exec.exec(`ls`);

        // Adding credentials 
        await exec.exec(`git config --global user.email "runner@runner.com"`);
        await exec.exec(`git config --global user.name "runner_bot"`);
        
        console.log("A tag will be added to the following commit")
        await exec.exec("git log -n1");
        let output = '';
        let error = '';

        const options = {
            listeners: {
                stdout: (data) => {
                    output += data.toString();
                },
                stderr: (data) => {
                    error += data.toString();
                }
            }
        };

        
        try {
            await exec.exec('git', ['describe', '--tags', '--abbrev=0'], options);
        } catch (error) {
            console.log("No previous tag found. Let's create the inaugural tag!")
        }
        
        console.log(`The output is: ${output}`);
        console.log(`The error is: ${error}`);

        // ========================================================================
        // If there is an improper tag create a new tag from scratch
        // ========================================================================
        if (!output) {
            console.log("No previous tag found. Creating a new tag")
            await exec.exec(`git tag v0.0.1`);
            await exec.exec(`git push origin --tags`);
            return
        }

        const argument = title.split(":")[0].toLowerCase()
        const version = output.split(".")

        // =========================================================================
        // There is a strict assumption that all versions will be in the form v0.0.0
        // =========================================================================
        //Take the first part v0 and remove the v to just obtain the number
        let major_str = version[0].slice(1)

        // Take the second part
        let minor_str = version[1]

        // Take the third part
        let patch_str = version[2]

        // ========================================================================
        // If there is an improper tag create a new tag from scratch
        // ========================================================================
        if (!major_str || !minor_str || !patch_str) {
            console.log("Empty string found. Previous tag was does not follow the format: v0.0.0. Creating a new tag")
            await exec.exec(`git tag v0.0.1`);
            await exec.exec(`git push origin --tags`);
            return
        }

        let major = parseInt(major_str)
        let minor = parseInt(minor_str)
        let patch = parseInt(patch_str)

        if (isNaN(major) || isNaN(minor) || isNaN(patch)) {
            console.log("Not a number. Previous tag was does not follow the format: v0.0.0. Creating a new tag")
            await exec.exec(`git tag v0.0.1`);
            await exec.exec(`git push origin --tags`);
            return
        }

        // =========================================================================
        // Update the semantic version according to the Pull Request Title
        // =========================================================================
        if (argument === "breaking" || argument === "break") {
            console.log("This is a breaking change")
            major += 1
            minor = 0
            patch = 0
        } else if (minor_arguments.includes(argument)) {
            console.log("This is a minor change")
            minor += 1
        }
        else if (patch_arguments.includes(argument)) {
            console.log("This is a patched change")
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