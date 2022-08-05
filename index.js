const { exec } = require('node:child_process');
const path = require('path');
const stream = require('stream');
const app = require('express')();

const config = require('./flint-config.json');

const mcStartScriptFilePath = path.join(
	__dirname,
	config.mc.startScriptLocation
);
const mcServerFolderPath = path.dirname(mcStartScriptFilePath);

/**
 * @type {ChildProcess}
 */
let child_process = null;

let isRunning = false;

// Start
app.post('/api/server', (req, res) => {
	if (!child_process || !isRunning) {
		isRunning = true;

		child_process = exec(
			mcStartScriptFilePath,
			{
				cwd: mcServerFolderPath,
				windowsHide: true,
			},
			(err, stdout, stderr) => {
				if (err) {
					console.log(err);
					isRunning = false;
				}

				if (stderr) {
					console.log(stderr);
				}
			}
		);

		child_process.on('exit', (code, sig) => {
			isRunning = false;
		});

		child_process.stdout.on('data', console.log);
		process.stdin.pipe(child_process.stdin);

		console.log('MC server has been told to start');
	}

	res.sendStatus(200);
});

// Stop
app.delete('/api/server', (req, res) => {
	if (child_process && isRunning) {
		const readable = new stream.Readable();
		readable.push('stop');
		readable.push(null);
		readable.pipe(child_process.stdin);

		console.log('MC server has been told to stop');
	}

	res.sendStatus(200);
});

app.listen(config.api.port, () => {
	console.log('Server is running!');
});
