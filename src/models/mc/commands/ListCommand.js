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

  /**
   * Groups
   *
   * 1. Number of online players
   * 2. Maximum number of players
   * 3. (?) Comma-separated player names
   */
  #outputPattern =
    /^\[\d+:\d+:\d+\] \[Server thread\/INFO\]: There are (\d+) of a max of (\d+) players online: (.+)?(?:\n|\r\n)?$/;

  /** @type {import('child_process').ChildProcess} */
  #server;

  /** @type {EventEmitter} */
  #emitter;

  constructor(server) {
    this.#server = server;
  }

  /** @returns {Promise<[Players, string]>} */
  async run() {
    // Create emitter
    this.#emitter = new EventEmitter();

    // Attach listener to server
    this.#server.stdout.on('data', this.#listener);

    // Execute command from promise
    return new Promise(this.#executor.bind(this));
  }

  /** @param {RegExpMatchArray} matchedOutput Raw string output of the command */
  #resolver(matchedOutput) {
    return new Players(
      matchedOutput[1],
      matchedOutput[2],
      matchedOutput[3] ? matchedOutput[3].split(',').map((e) => e.trim()) : []
    );
  }

  // TODO: Cleanup docs
  /**
   * @callback OutputListener
   * @param {Buffer} data
   */

  /** Bound function that listens for the command output */
  #listener = /** @type {OutputListener} */ (
    (data) => {
      const output = data.toString().match(this.#outputPattern);
      if (output != null) {
        this.#emitter.emit('parsed', this.#resolver(output));
      }
    }
  ).bind(this);

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
