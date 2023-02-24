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

import { AuthMethod } from './AuthMethod';

export class APIKey extends AuthMethod {
  //#region Fields
  /**
   * Keys that may be used to authenticate requests.
   *
   * @type {Set<string>}
   */
  keys = new Set();
  //#endregion

  constructor(apiKeyJson) {
    super();

    if (apiKeyJson?.enable === true) {
      this.enable = true;
    }

    if (apiKeyJson?.keys) {
      this.keys = new Set(apiKeyJson.keys);
    }

    //#region Validation
    if (this.enable && this.keys.size === 0) {
      throw new Error(
        'api.auth.apiKey.keys must contain at least one key if API key authentication is enabled.'
      );
    }
    //#endregion
  }
}
