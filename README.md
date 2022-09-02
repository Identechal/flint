<!--
 Copyright (C) 2022 Identechal LLC

 This file is part of Flint.

 Flint is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Flint is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with Flint.  If not, see <http://www.gnu.org/licenses/>.
-->

<!--
Minecraft Flint Item Icon links
32x32 ![minecraft-flint-item32](https://user-images.githubusercontent.com/29645789/185534483-309ce8d5-3c0d-4eb4-8111-8560f8a62f01.png)
64x64 ![minecraft-flint-item64](https://user-images.githubusercontent.com/29645789/185534153-d958c64e-4698-457f-b66b-17e50c18aa60.png)
160x160 ![minecraft-flint-item](https://user-images.githubusercontent.com/29645789/185534023-a7dfdb99-c2a5-462f-a701-5b45091c1642.png)
-->

# Flint ![minecraft-flint-item32](https://user-images.githubusercontent.com/29645789/185534483-309ce8d5-3c0d-4eb4-8111-8560f8a62f01.png)

Remote management for self-hosted Minecraft servers.

## What does it do?

Flint is a simple tool enabling you to start or stop your Minecraft server from anywhere.
It achieves this by wrapping your server in a REST API, exposing basic actions.

In addition to remote control, Flint can be used to autosave your Minecraft server on a custom interval.
This can be helpful to reduce the frequency of stuttering caused by saving.

## Installation

By design, Flint is optional and doesn't require you to change anything about your Minecraft server.
Setup is as simple as dropping Flint in your server directory and pointing it at your startup script.

1. Download the latest version of Flint from the [releases](https://github.com/Identechal/flint/releases) page
1. Move the executable into the root of your server directory
1. Create a `flint-config.json` file with the following contents:
   - Be sure to replace the `startScript` value with your own script
   ```json
   {
     "mc": {
       "autoStart": true,
       "startScript": "./start.bat"
     }
   }
   ```
1. Double-click the Flint executable and watch the magic happen! :sparkles:

## Configuration

Flint's behavior is controlled by a simple configuration file, called `flint-config.json`.
This file should be placed in the same directory as Flint.

Example directory structure:

```
mc-server/
├─ start.bat          // server start script
├─ server.jar
├─ flint-win.exe      // mac, windows, or linux executable
├─ flint-config.json
├─ ...
```

### Properties

| Field                  | Type    | Required | Default | Description                                               |
| ---------------------- | ------- | :------: | ------- | --------------------------------------------------------- |
| `api.port`             | Number  |          | `25585` | Flint API port                                            |
| `mc.autoStart`         | Boolean |          | `false` | Start the Minecraft server when Flint is launched         |
| `mc.startScript`       | String  |    x     |         | Relative path to start script                             |
| `mc.autosave.enable`   | Boolean |          | `false` | Override the Minecraft server's default autosave interval |
| `mc.autosave.interval` | Number  |          | `60`    | Seconds between each autosave                             |

## Usage

There are two ways to interact with Flint.
The first is via API endpoints, and the second is through its terminal.

### API Endpoints

Controlling your Minecraft server is as easy as interacting with the following endpoints.

#### Start Server

`POST` /api/server

**Response:** HTTP 202 if the server will start; otherwise, HTTP 400 if it's already running.

#### Stop Server

`DELETE` /api/server

**Response:** HTTP 202 if the server will stop; otherwise, HTTP 400 if it's already stopped.

#### Get Server Status

`GET` /api/server

**Response:**

- **Code:** HTTP 200
- **Content-Type:** application/json
- **Body:** [MCServerStatus](#server-statuses)
  ```json
  {
    "name": "RUNNING",
    "canStart": false,
    "canStop": true
  }
  ```

### Terminal Commands

At the moment, Flint does not yet support running Minecraft commands from the API. If you need to do this, please interact directly with Flint's terminal.

To start the server, simply type `start`. From here, terminal input is passed directly to the Minecraft server. That means commands like `stop`, `list`, `op`, etc. will behave as if you were running them directly on the server.

## Server Statuses

Enumeration of possible Minecraft server statuses.

| name     | canStart | canStop |
| -------- | -------- | ------- |
| STARTING | `false`  | `false` |
| RUNNING  | `false`  | `true`  |
| STOPPING | `false`  | `false` |
| STOPPED  | `true`   | `false` |
| CRASHED  | `true`   | `false` |
