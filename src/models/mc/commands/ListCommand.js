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
import { EOL } from 'os';

export class ListCommand {
  #command = 'list';

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
    const handler = this.#listener.bind(this);
    this.#server.stdout.on('data', handler);

    // Execute command from promise
    await new Promise(this.#executor.bind(this));
  }

  /** @param {Buffer} data */
  #listener(data) {
    if (data.toString().includes('players')) {
      console.log(`[FLINT] List command output parsed! It was "${data.toString()}"`);
      this.#emitter.emit('parsed');
    }
  }

  #executor(resolve, reject) {
    // TODO: this seems odd. See if there's a way this listener can be attached in run()
    this.#emitter.on('parsed', (payload) => {
      resolve(payload);
    });

    // Execute command
    this.#server.stdin.write(this.#command);
    this.#server.stdin.write(EOL);

    // TODO: reject promise if taking too long
  }
}
