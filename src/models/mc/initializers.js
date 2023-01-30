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

import { setInterval } from 'timers';
import { JobHandler } from '../jobs/JobHandler';
import { JobName } from '../jobs/JobName';
import { EOL } from 'os';
import { Writable } from 'stream';

/**
 * @param {Initializer[]} initializers
 * @param {Writable} targetStream The MC server process's input stream.
 */
export function runInitializers(initializers, targetStream) {
  console.log(`[FLINT] Running ${initializers.length} initializers`);
  for (const initializer of initializers) {
    initializer(targetStream);
  }
}

/**
 * Code to execute when the MC server has finished starting.
 *
 * @callback Initializer
 * @param {Writable} targetStream The MC server process's input stream.
 * @returns {void}
 */

/**
 * Builds an initializer that overrides Minecraft's default autosave functionality.
 *
 * @param {number} saveInterval The interval, in seconds, between saving the world.
 * @returns {Initializer}
 */
export function overrideAutosave(saveInterval) {
  return (targetStream) => {
    console.log(`[FLINT] Overriding Minecraft's autosave.`);
    // Disable Minecraft's default autosave functionality
    targetStream.write('save-off');
    targetStream.write(EOL);

    // Dispatch Flint's autosave job
    JobHandler.track(
      JobName.AUTOSAVE,
      setInterval(() => {
        console.log(`[FLINT] Saving...`);
        targetStream.write('save-all');
        targetStream.write(EOL);
      }, saveInterval * 1000)
    );
  };
}
