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

export class Autosave {
  /**
   * The interval, in seconds, between saving the world.
   *
   * @type {number}
   */
  interval = 60;

  /**
   * Whether Flint will override the default autosave functionality of the MC server.
   *
   * @type {boolean}
   */
  enable = false;

  constructor(autosaveJson) {
    if (autosaveJson?.interval) {
      this.interval = autosaveJson.interval;
    }

    if (autosaveJson?.enable === true) {
      this.enable = true;
    }
  }
}
