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

import EventEmitter from 'events';
import { setTimeout } from 'timers';
import { EOL } from 'os';
import { CommandTimeoutError } from './errors';

/** @abstract */
export class Command {
  /**
   * Literal command to execute
   *
   * @type {string}
   */
  command;

  /** @type {RegExp} */
  outputPattern;

  /** @typedef {import('child_process').ChildProcess} ChildProcess */

  /**
   * Child process of the MC server
   *
   * @type {ChildProcess}
   */
  #server;

  /** @type {EventEmitter} */
  #emitter;

  /** @param {ChildProcess} server */
  constructor(server) {
    if (this.constructor == Command) {
      throw new Error('Abstract classes cannot be instantiated.');
    }

    this.#server = server;
  }

  /**
   * @abstract
   * @param {RegExpMatchArray} matchedOutput Raw string output of the command
   */
  resolver(matchedOutput) {
    throw new Error('This method must be overridden.');
  }

  async run() {
    // Create emitter
    this.#emitter = new EventEmitter();

    // Attach listener to server
    this.#server.stdout.on('data', this.#listener);

    // Execute command from promise
    return new Promise(this.#executor.bind(this));
  }

  /**
   * @callback OutputListener
   * @param {Buffer} data
   * @returns {void}
   */

  /**
   * Bound function that listens for the command output
   *
   * @type {OutputListener}
   */
  #listener = /** @type {OutputListener} */ (
    (data) => {
      const output = data.toString().match(this.outputPattern);
      if (output != null) {
        // Fire the 'parsed' event and pass the result
        this.#emitter.emit('parsed', this.resolver(output));
      }
    }
  ).bind(this);

  /** Executor callback for the promise returned by run() */
  #executor(resolve, reject) {
    // Reject promise if taking too long
    const timeout = setTimeout(() => {
      const error = new CommandTimeoutError(this.command);
      reject(error);
      this.#server.stdout.removeListener('data', this.#listener);
      console.warn(`[FLINT] ${error.message}`);
    }, 2000);

    // Resolve promise once the output has been parsed
    this.#emitter.once('parsed', (payload) => {
      clearTimeout(timeout);
      resolve(payload);
      this.#server.stdout.removeListener('data', this.#listener);
    });

    // Execute command
    this.#server.stdin.write(this.command);
    this.#server.stdin.write(EOL);
  }
}
