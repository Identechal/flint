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

import { JobName } from './JobName';

export class Job {
  //#region Fields
  /** @type {JobName} */
  #name;

  get name() {
    return this.#name;
  }

  /** @type {NodeJS.Timer} */
  #timer;

  get timer() {
    return this.#timer;
  }
  //#endregion

  constructor(name, timer) {
    this.#name = name;
    this.#timer = timer;
  }
}
