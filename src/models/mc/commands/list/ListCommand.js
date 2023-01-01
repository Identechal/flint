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

import { Command } from '../Command';
import { Players } from './Players';

export class ListCommand extends Command {
  command = 'list';

  /**
   * Groups
   *
   * 1. Number of online players
   * 2. Maximum number of players
   * 3. (?) Comma-separated player names
   */
  outputPattern =
    /^\[\d+:\d+:\d+\] \[Server thread\/INFO\]: There are (\d+) of a max of (\d+) players online: (.+)?(?:\n|\r\n)?$/;

  /** @returns {Promise<Players>} */
  run() {
    return super.run();
  }

  /**
   * @override
   * @inheritdoc
   */
  resolver(matchedOutput) {
    return new Players(
      parseInt(matchedOutput[1]),
      parseInt(matchedOutput[2]),
      matchedOutput[3] ? matchedOutput[3].split(',').map((e) => e.trim()) : []
    );
  }
}
