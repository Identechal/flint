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

// Required modules
import express from 'express';
import { getConfig } from './models/config/FlintConfig';
import { MCServer } from './models/mc/MCServer';
import { CannotStartError, CannotStopError } from './models/mc/errors';
import { CommandTimeoutError } from './models/mc/commands/errors';
import { authenticate, isAuthEnabled } from './middleware/authenticate';

const { api: apiConfig } = getConfig();
const mcServer = new MCServer();
const app = express();

//#region Middleware
if (isAuthEnabled()) {
  app.use(authenticate());
}
//#endregion

// Start
app.post('/api/server', (_req, res) => {
  try {
    mcServer.start();
  } catch (error) {
    // TODO: make real error body
    if (error instanceof CannotStartError) {
      res.status(400).json({
        error: error.message,
      });
    } else {
      res.status(500).json({
        error: error.message,
      });
    }

    return;
  }

  res.sendStatus(202);
});

// Stop
app.delete('/api/server', (_req, res) => {
  try {
    mcServer.stop();
  } catch (error) {
    // TODO: make real error body
    if (error instanceof CannotStopError) {
      res.status(400).json({
        error: error.message,
      });
    } else {
      res.status(500).json({
        error: error.message,
      });
    }

    return;
  }

  res.sendStatus(202);
});

// Details
app.get('/api/server', async (_req, res) => {
  let list;
  try {
    list = await mcServer.listPlayers();
  } catch (error) {
    // TODO: make real error body
    if (error instanceof CommandTimeoutError) {
      res.status(408).json({
        error: error.message,
      });
    } else {
      res.status(500).json({
        error: error.message,
      });
    }

    return;
  }

  res.status(200).json({
    status: mcServer.status,
    list: list.toJson(),
  });
});

app.listen(apiConfig.port, () => {
  console.log(`[FLINT] API is ready! Listening on port ${apiConfig.port}.`);
});
