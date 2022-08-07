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

import { MCServerStatus } from './MCServerStatus.js';

export class CannotStartError extends Error {
  /** @param {MCServerStatus} status */
  constructor(status) {
    switch (status) {
      case MCServerStatus.STARTING:
        super('The MC server is already starting.');
        break;
      case MCServerStatus.RUNNING:
        super('The MC server is already running.');
        break;
      case MCServerStatus.STOPPING:
        super('The MC server is currently stopping.');
        break;
      default:
        super('The MC server cannot be started.');
        break;
    }
  }
}

export class CannotStopError extends Error {
  /** @param {MCServerStatus} status */
  constructor(status) {
    switch (status) {
      case MCServerStatus.STARTING:
        super('The MC server is currently starting.');
        break;
      case MCServerStatus.STOPPING:
        super('The MC server is already stopping.');
        break;
      case MCServerStatus.STOPPED:
        super('The MC server is already stopped.');
        break;
      default:
        super('The MC server cannot be stopped.');
        break;
    }
  }
}
