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
import { EOL } from 'os';
import { join, dirname } from 'path';

import { MCServerStatus } from './MCServerStatus.js';
import { CannotStartError, CannotStopError } from './MCServerError.js';
import { Players } from './commands/list/Players.js';
import { getConfig } from '../FlintConfig.js';
import { overrideAutosave, runInitializers } from './initializers.js';
import { JobHandler } from '../jobs/JobHandler.js';
import { ListCommand } from './commands/list/ListCommand.js';

export class MCServer {
  //#region Constants
  #DONE_PATTERN =
    /^\[\d+:\d+:\d+\] \[Server thread\/INFO\]: Done \([^)]+\)! For help, type "help"(?:\n|\r\n)?$/;

  #STOPPING_PATTERN = /^\[\d+:\d+:\d+\] \[Server thread\/INFO\]: Stopping the server(?:\n|\r\n)?$/;
  //#endregion

  //#region Fields
  /** @type {String} */
  #startScript;

  /** @type {import('./initializers.js').Initializer[]} */
  #initializers = [];

  /** @type {import('child_process').ChildProcess} */
  #process;

  /** @type {MCServerStatus} */
  #status;

  get status() {
    return this.#status;
  }
  //#endregion

  constructor() {
    const { mc } = getConfig();

    this.#startScript = join(process.cwd(), mc.startScript);
    this.#process = null;
    this.#status = MCServerStatus.STOPPED;

    if (mc.autoStart) {
      try {
        this.start();
      } catch (error) {
        console.error(error);
        // Listen for 'start' command
        process.stdin.on('data', this.#flintStartListener.bind(this));
      }
    } else {
      // Listen for 'start' command
      process.stdin.on('data', this.#flintStartListener.bind(this));
    }
  }

  /** @throws {CannotStartError} Thrown if the MC server is not in a startable status. */
  start() {
    if (!this.#status.canStart) {
      throw new CannotStartError(this.#status);
    }

    // Set status
    this.#status = MCServerStatus.STARTING;

    // Detach start command listener
    process.stdin.removeAllListeners('data');
    console.log('[FLINT] Attempting to start Minecraft server.');

    //#region Prepare Initializers
    const { mc } = getConfig();

    // Autosave
    if (mc.autosave.enable) {
      this.#initializers.push(overrideAutosave(mc.autosave.interval));
    }
    //#endregion

    // Execute script
    this.#process = exec(
      this.#startScript,
      {
        cwd: dirname(this.#startScript),
        windowsHide: true,
      },
      (error) => {
        if (error) {
          console.error(`[FLINT] Failed to execute start script. ${error}`);
          this.#status = MCServerStatus.CRASHED;
        }
      }
    );

    // Listeners

    this.#process.stdout
      // Attach server output handler
      .on('data', this.#outputListener.bind(this))
      // MC output --> Flint output
      .pipe(process.stdout);

    // Attach exit handler
    this.#process.once('exit', this.#exitHandler.bind(this));

    // Flint terminal --> MC input
    process.stdin.pipe(this.#process.stdin);
  }

  /** @throws {CannotStopError} Thrown if the MC server is not in a stoppable status. */
  stop() {
    if (!this.#status.canStop) {
      throw new CannotStopError(this.#status);
    }

    console.log('[FLINT] Attempting to stop Minecraft server.');

    // Write 'stop' to server
    this.#process.stdin.write('stop');
    this.#process.stdin.write(EOL);
  }

  //#region Commands
  /**
   * @returns {Promise<Players>}
   * @throws {Error} Thrown if the command resolves to an error
   */
  async listPlayers() {
    if (this.#status !== MCServerStatus.RUNNING) {
      // Server is not running
      return new Players(0, 0, []);
    }

    // Execute command
    const output = await new ListCommand(this.#process).run();

    if (output[1]) {
      // FIXME: Find out why this never evaluates to true
      throw new Error('Failed to run command: ' + output[1]);
    }

    return output[0];
  }
  //#endregion

  //#region Listeners
  /** @param {Buffer} data */
  #flintStartListener(data) {
    if (data.toString().trim() === 'start') {
      try {
        this.start();
      } catch (error) {
        console.error(error);
      }
    }
  }

  /** @param {Buffer} data */
  #outputListener(data) {
    if (this.#DONE_PATTERN.test(data.toString())) {
      console.log('[FLINT] Minecraft server is running.');
      this.#status = MCServerStatus.RUNNING;

      // Run initializers
      runInitializers(this.#initializers, this.#process.stdin);

      // Clear initializers
      this.#initializers = [];
    } else if (this.#STOPPING_PATTERN.test(data.toString())) {
      // Terminate jobs
      JobHandler.terminateAll();
      console.log('[FLINT] Minecraft server is stopping.');
      this.#status = MCServerStatus.STOPPING;
    }
  }

  /**
   * @param {number} code
   * @param {NodeJS.Signals} signal
   */
  #exitHandler(code, signal) {
    // Terminate jobs
    JobHandler.terminateAll();

    if (code !== null) {
      if (code === 0) {
        this.#status = MCServerStatus.STOPPED;
      } else {
        console.error(`[FLINT] Minecraft server crashed with exit code: ${code}`);
        this.#status = MCServerStatus.CRASHED;
      }
    } else {
      console.error(`[FLINT] Minecraft server exited with signal: ${signal}`);
      this.#status = MCServerStatus.CRASHED;
    }

    process.stdin
      // Flint terminal -/-> MC input
      .unpipe(this.#process.stdin)
      // Listen for 'start' command
      .on('data', this.#flintStartListener.bind(this))
      .resume();

    console.log('[FLINT] Minecraft server has stopped.');
  }
  //#endregion
}
