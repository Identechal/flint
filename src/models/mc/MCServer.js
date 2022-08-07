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

import { exec } from 'child_process';
import { join, dirname } from 'path';
import { Readable } from 'stream';

import { MCServerStatus } from './MCServerStatus.js';
import { CannotStartError, CannotStopError } from './MCServerError.js';

export class MCServer {
  /** @type {String} */
  #startScript;
  /** @type {import('child_process').ChildProcess} */
  #process;
  /** @type {MCServerStatus} */
  #status;

  /**
   * @param {{startScript:String}} config The MC server process config from `flint-config.json`.
   */
  constructor(config) {
    this.#startScript = join(process.cwd(), config.startScript);
    this.#process = null;
    this.#status = MCServerStatus.STOPPED;
  }

  /** @returns {MCServerStatus} */
  get status() {
    return this.#status;
  }

  /**
   * @throws {CannotStartError} Thrown if the MC server is not {@link MCServerStatus.STOPPED stopped}.
   */
  start() {
    if (this.#status !== MCServerStatus.STOPPED) {
      throw new CannotStartError(this.#status);
    }

    // Set status
    this.#status = MCServerStatus.STARTING;

    // Execute script
    this.#process = exec(
      this.#startScript,
      {
        cwd: dirname(this.#startScript),
        windowsHide: true,
      },
      (error, _stdout, stderr) => {
        if (error) {
          console.error(error);
          this.#status = MCServerStatus.STOPPED;
        } else if (stderr) {
          console.error(`Logging from callback: ${stderr}`);
          this.#status = MCServerStatus.STOPPED;
        }
      }
    );

    // Add event listeners
    this.#process.stderr.on('data', (chunk) => {
      console.error(`Erroring from listener: ${chunk}`);
    });

    // this.#process.stdout.on('data', (chunk) => {
    //   // console.log(`Logging from listener: ${chunk}`);
    // });

    this.#process.stdout.pipe(process.stdout);

    this.#process.on('exit', (code, signal) => {
      if (code !== null) {
        console.log('MC server exited with code: ', code);
        this.#status =
          code === 0 ? MCServerStatus.STOPPED : MCServerStatus.CRASHED;
      } else {
        console.log('MC server exited with signal: ', signal);
        this.#status = MCServerStatus.CRASHED;
      }
    });

    // Connect input streams
    process.stdin.pipe(this.#process.stdin);
  }

  /**
   * @throws {CannotStopError} Thrown if the MC server is not {@link MCServerStatus.RUNNING running}.
   */
  stop() {
    if (this.#status !== MCServerStatus.RUNNING) {
      throw new CannotStopError(this.#status);
    }

    // Pipe 'stop' to server
    const stopStream = new Readable();
    stopStream.push('stop');
    stopStream.push(null);
    stopStream.pipe(this.#process.stdin);
  }
}