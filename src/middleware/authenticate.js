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

import { getConfig } from '../models/config/FlintConfig';
/**
 * @typedef {import('express').Request} Request
 *
 * @typedef {import('express').Response} Response
 *
 * @typedef {import('express').NextFunction} NextFunction
 *
 * @typedef {import('../models/config/api/auth/AuthMethod').AuthMethod} AuthMethod
 */

/** @returns {boolean} Whether authentication is enabled for the Flint API. */
export function isAuthEnabled() {
  const { auth: authConfig } = getConfig().api;

  return Object.values(authConfig).some((/** @type {AuthMethod} */ authMethod) => {
    return authMethod.enable;
  });
}

/** @returns {middleware} Authentication middleware */
export function authenticate() {
  // Build authenticator middleware from config
  const { auth: authConfig } = getConfig().api;

  /** @type {authenticator[]} Active Authenticators */
  const authenticators = [];

  if (authConfig.apiKey.enable) {
    authenticators.push(buildApiKeyAuthenticator(authConfig.apiKey.keys));
  }
  // Add more authenticators here

  return (req, res, next) => {
    for (const useAuthenticator of authenticators) {
      const authResult = useAuthenticator(req);

      // Check if authentication method was used
      if (authResult.used) {
        if (authResult.authenticated) {
          // Successfully authenticated
          next();
          return;
        } else {
          // Failed authentication
          res.sendStatus(401);
          return;
        }
      }
    }

    // Request was unauthenticated (or did not use a known authentication method)
    res.sendStatus(401);
  };
}

/**
 * @param {Set<string>} keys
 * @returns {authenticator} Authenticator that checks for an API key authentication method.
 */
function buildApiKeyAuthenticator(keys) {
  return (req) => {
    const key = req.header('X-API-Key');

    // Check if authentication method was used
    if (!key) {
      return { used: false, authenticated: false };
    }

    // Test the API key
    return { used: true, authenticated: keys.has(key) };
  };
}

/**
 * @typedef {Object} AuthResult Result of the {@link authenticator}'s check.
 * @property {boolean} used Whether the request used this authentication method.
 * @property {boolean} authenticated Whether the request successfully authenticated.
 */

/**
 * @callback authenticator
 * @param {Request} req
 * @returns {AuthResult}
 */

/**
 * @callback middleware
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
