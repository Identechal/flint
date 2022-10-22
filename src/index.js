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

// Required modules
import express from 'express';
import { getConfig } from './models/FlintConfig.js';

import { MCServer } from './models/mc/MCServer.js';
import { CannotStartError, CannotStopError } from './models/mc/MCServerError.js';

const { api: apiConfig } = getConfig();
const mcServer = new MCServer();
const app = express();

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
app.get('/api/server', (_req, res) => {
  res.status(200).json(mcServer.status);
});

app.listen(apiConfig.port, () => {
  console.log(`[FLINT] API is ready! Listening on port ${apiConfig.port}.`);
});
