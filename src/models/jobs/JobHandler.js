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

import { Job } from './Job';
import { JobName } from './JobName';

export class JobHandler {
  /**
   * All active jobs.
   *
   * @type {Job[]}
   */
  static #activeJobs = [];

  /**
   * Constructs and tracks a new Job.
   *
   * @param {JobName} name Name of the job. If the job is already active, it will replaced by this.
   * @param {NodeJS.Timer} timer {@link NodeJS.Timer | Timer}, returned by calling
   *   {@link setInterval}, to track.
   */
  static track(name, timer) {
    if (this.#activeJobs.some((j) => j.name === name)) {
      this.terminate(name);
    }

    const jobCount = this.#activeJobs.push(new Job(name, timer));

    console.log(
      `[FLINT] Tracking the ${name} job. (${jobCount} active job${jobCount > 1 ? 's' : ''})`
    );
  }

  /**
   * Terminates and untracks a {@link Job} by its {@link Job#name}.
   *
   * @param {JobName} name The Job to terminate.
   */
  static terminate(name) {
    const jobIndex = this.#activeJobs.findIndex((j) => j.name === name);

    if (jobIndex === -1) {
      // Job wasn't active
      return;
    }

    // Clear the interval of the job
    clearInterval(this.#activeJobs[jobIndex].timer);

    // Untrack job
    this.#activeJobs = this.#activeJobs.splice(jobIndex, 1);

    const jobCount = this.#activeJobs.length;

    console.log(
      `[FLINT] Terminated the ${name} job. (${jobCount} active job${jobCount > 1 ? 's' : ''})`
    );
  }

  /** Terminates and untracks all {@link Job}s. */
  static terminateAll() {
    if (this.#activeJobs.length === 0) {
      return;
    }

    for (const job of this.#activeJobs) {
      // Clear the interval of the job
      clearInterval(job.timer);
    }

    // Untrack all jobs
    this.#activeJobs = [];

    console.log(`[FLINT] Terminated all jobs.`);
  }
}
