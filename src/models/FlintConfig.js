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

export function getConfig() {
  return FlintConfig.config;
}

export class FlintConfig {
  //#region Static
  /** @type {FlintConfig} */
  static #config;

  static get config() {
    if (!this.#config) {
      this.#config = new FlintConfig(require(join(process.cwd(), 'flint-config.json')));
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

export class API {
  //#region Fields
  /**
   * Port which the Flint API listens to.
   *
   * @type {number}
   */
  port = 25585;
  //#endregion

  constructor(apiJson) {
    if (apiJson?.port) {
      this.port = apiJson.port;
    }
  }
}

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
    if (mcJson?.autoStart === true) {
      this.autoStart = true;
    }

    if (mcJson?.startScript) {
      this.startScript = mcJson.startScript;
    } else {
      throw new Error('mc.startScript is a required configuration property.');
    }

    this.autosave = new Autosave(mcJson?.autosave);
  }
}

class Autosave {
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
