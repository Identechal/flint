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

import { join } from 'path';
import { API } from './api/API';
import { MC } from './mc/MC';

export function getConfig() {
  return FlintConfig.config;
}

export class FlintConfig {
  //#region Static
  /** @type {FlintConfig} */
  static #config;

  static get config() {
    if (!this.#config) {
      this.#config = new FlintConfig(import(join(process.cwd(), 'flint-config.json')));
    }

    return this.#config;
  }
  //#endregion

  //#region Fields
  /**
   * Flint API configuration
   *
   * @type {API}
   */
  api;

  /**
   * Minecraft server configuration
   *
   * @type {MC}
   */
  mc;
  //#endregion

  constructor(json) {
    if (!json) {
      throw new Error(
        `Could not find flint-config.json!
        Please make sure it is located in the same directory Flint was launched from.`
      );
    }

    this.api = new API(json.api);
    this.mc = new MC(json.mc);
  }
}
