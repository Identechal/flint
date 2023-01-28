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

import { Autosave } from './Autosave';

export class MC {
  //#region Fields
  /**
   * Whether the MC server will automatically start during Flint's launch.
   *
   * @type {boolean}
   */
  autoStart = false;

  /**
   * Path of the MC server startup script relative to the current working directory (where Flint was
   * launched).
   *
   * @type {string}
   */
  startScript;

  /**
   * Autosave configuration.
   *
   * @type {Autosave}
   */
  autosave;
  //#endregion

  constructor(mcJson) {
    if (mcJson?.startScript) {
      this.startScript = mcJson.startScript;
    } else {
      throw new Error('mc.startScript is a required configuration property.');
    }

    if (mcJson.autoStart === true) {
      this.autoStart = true;
    }

    this.autosave = new Autosave(mcJson.autosave);
  }
}
