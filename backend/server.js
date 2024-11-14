// server.js
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Run the database server
async function startDBServer() {
    try {
        const { stdout, stderr } = await execAsync('run-api.bat');
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    } catch (error) {
        console.error(`exec error: ${error}`);
    }
}

function lookForGames() {
    console.log('Looking for games...');

    // TODO
}

startDBServer();
console.log('Database server started');

// wait for input
process.stdin.resume();
console.log('Press any key to exit...');
process.stdin.on('data', process.exit.bind(process, 0));