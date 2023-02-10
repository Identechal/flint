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

import { AuthMethod } from '../AuthMethod';
import { Host } from './Host';

export class PublicKey extends AuthMethod {
  //#region Fields
  /**
   * Flint's key pair.
   *
   * @type {Host}
   */
  host;

  /** Authorized clients' key pairs. // TODO: Implement this */
  clients;
  //#endregion

  constructor(publicKeyJson) {
    super(publicKeyJson?.enable);

    this.host = new Host(publicKeyJson?.host);

    // TODO: call host's method to generate a key pair if necessary
  }
}
