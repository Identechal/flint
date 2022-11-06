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
import { Players } from '../Players';

export class ListCommand {
  #command = 'list';
  #outputPattern = /players online/; // TODO: define reliable output pattern

  /** @type {import('child_process').ChildProcess} */
  #server;

  /** @type {EventEmitter} */
  #emitter;

  constructor(server) {
    this.#server = server;
  }

  /** @returns {Promise} */
  async run() {
    // Create emitter
    this.#emitter = new EventEmitter();

    // Attach listener to server
    this.#server.stdout.on('data', this.#listener);

    // Execute command from promise
    return new Promise(this.#executor.bind(this));
  }

  /** @param {string} matchedOutput Raw string output of the command */
  #resolver(matchedOutput) {
    // TODO: parse matched output and return new Players instance
    return new Players(1, ['Steve']);
  }

  /** Bound function that listens for the command output */
  #listener = /**
   * @function OutputListener
   * @param {Buffer} data
   */ ((data) => {
    const output = data.toString();
    if (this.#outputPattern.test(output)) {
      console.log(`[FLINT] List command output parsed! It was "${output}"`);
      this.#emitter.emit('parsed', this.#resolver(output));
    }
  }).bind(this);

  #executor(resolve, reject) {
    // Reject promise if taking too long
    const timeout = setTimeout(() => {
      reject([null, 'Timeout']);
      this.#server.stdout.removeListener('data', this.#listener);
    }, 2000);

    // Resolve promise once the output has been parsed
    this.#emitter.once('parsed', (payload) => {
      console.log(`[FLINT] Emitter fired! Resolving promise.`);
      clearTimeout(timeout);
      resolve([payload, null]);
      this.#server.stdout.removeListener('data', this.#listener);

      // TODO: find out it the emitter will automatically destroy itself
    });

    // Execute command
    this.#server.stdin.write(this.#command);
    this.#server.stdin.write(EOL);
  }
}
