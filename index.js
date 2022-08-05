// Copyright (C) 2022 Identechal LLC
//
// This file is part of Flint.
//
// Flint is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Flint is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Flint.  If not, see <http://www.gnu.org/licenses/>.

const { exec } = require('node:child_process');
const path = require('path');
const stream = require('stream');
const app = require('express')();

const config = require('./flint-config.json');

const mcStartScriptFilePath = path.join(
	__dirname,
	config.mc.startScript
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
