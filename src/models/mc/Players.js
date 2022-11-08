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

export class Players {
  //#region Fields
  /** @type {number} */
  #online;

  /** @type {number} */
  #max;

  /** @type {string[]} */
  #roster;
  //#endregion

  /**
   * @param {number} count
   * @param {number} max
   * @param {string[]} roster
   */
  constructor(online, max, roster) {
    this.#online = online;
    this.#max = max;
    this.#roster = roster;
  }

  toJson() {
    return {
      online: this.#online,
      max: this.#max,
      roster: this.#roster,
    };
  }
}
