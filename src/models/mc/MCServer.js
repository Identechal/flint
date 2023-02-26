// Copyright (C) 2023 Identechal LLC
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
import { MCServerStatus } from './MCServerStatus';
import { CannotStartError, CannotStopError } from './errors';
import { Players } from './commands/list/Players';
import { getConfig } from '../config/FlintConfig';
import { overrideAutosave, runInitializers } from './initializers';
import { JobHandler } from '../jobs/JobHandler';
import { ListCommand } from './commands/list/ListCommand';
/**
 * @typedef {import('child_process').ChildProcess} ChildProcess
 *
 * @typedef {import('./initializers').initializer} initializer
 */

export class MCServer {
  //#region Constants
  #DONE_PATTERN =
    /^\[\d+:\d+:\d+\] \[Server thread\/INFO\]: Done \([^)]+\)! For help, type "help"(?:\n|(?:\r\n))?$/;

  #STOPPING_PATTERN =
    /^\[\d+:\d+:\d+\] \[Server thread\/INFO\]: Stopping the server(?:\n|(?:\r\n))??$/;
  //#endregion

  //#region Fields
  /** @type {String} */
  #startScript;

  /** @type {initializer[]} */
  #initializers = [];

  /**
   * Child process of the Minecraft server
   *
   * @type {ChildProcess}
   */
  #server;

  /** @type {MCServerStatus} */
  #status;

  get status() {
    return this.#status;
  }
  //#endregion

  constructor() {
    const { mc } = getConfig();

    this.#startScript = join(process.cwd(), mc.startScript);
    this.#server = null;
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
    this.#server = exec(
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

    this.#server.stdout
      // Attach server output handler
      .on('data', this.#outputListener.bind(this))
      // MC output --> Flint output
      .pipe(process.stdout);

    // Attach exit handler
    this.#server.once('exit', this.#exitHandler.bind(this));

    // Flint terminal --> MC input
    process.stdin.pipe(this.#server.stdin);
  }

  /** @throws {CannotStopError} Thrown if the MC server is not in a stoppable status. */
  stop() {
    if (!this.#status.canStop) {
      throw new CannotStopError(this.#status);
    }

    console.log('[FLINT] Attempting to stop Minecraft server.');

    // Write 'stop' to server
    this.#server.stdin.write('stop');
    this.#server.stdin.write(EOL);
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
    return await new ListCommand(this.#server).run();
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
      runInitializers(this.#initializers, this.#server.stdin);

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
      .unpipe(this.#server.stdin)
      // Listen for 'start' command
      .on('data', this.#flintStartListener.bind(this))
      .resume();

    console.log('[FLINT] Minecraft server has stopped.');
  }
  //#endregion
}
