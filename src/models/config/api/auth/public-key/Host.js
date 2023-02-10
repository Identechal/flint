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

import { KeyObject, createPublicKey, createPrivateKey } from 'crypto';

export class Host {
  //#region Fields
  /** @type {KeyObject} */
  public;

  /** @type {KeyObject} */
  #private;
  //#endregion

  constructor(hostJson) {
    if (hostJson?.public) {
      this.public = createPublicKey(hostJson.public);
    }

    if (hostJson?.private) {
      this.#private = createPrivateKey(hostJson.private);
    }
  }

  // TODO: implement instance method to generate key pair
}
