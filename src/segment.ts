/**
 * Powerbar segment formatting for gob running jobs.
 *
 * Each job with historical run data renders its own progress bar.
 * Jobs without progress data are grouped: 1 shows its command, N shows "N jobs".
 * Parts are joined with " · ".
 *
 * Examples:
 *   1 job, no history:    "⚙ npm run dev"
 *   1 job, with history:  "⚙ npm run dev ████░░░░ 57%"
 *   mixed:                "⚙ npm run dev ████░░░░ 57% · 2 jobs"
 *   all with history:     "⚙ npm run dev ████░░░░ 57% · make build ████████ 100%"
 */

import type { JobResponse } from "./types.js";

const BAR_WIDTH = 8;

export interface SegmentData {
	text: string;
	icon: string;
	color: string;
}

/**
 * Compute progress percentage for a running job with known average duration.
 * Returns undefined if no historical data. Clamps to 0–100.
 */
function jobProgress(job: JobResponse): number | undefined {
	if (job.avg_duration_ms <= 0 || !job.started_at) return undefined;

	const start = new Date(job.started_at).getTime();
	const elapsedMs = Date.now() - start;
	const pct = Math.round((elapsedMs / job.avg_duration_ms) * 100);

	return Math.max(0, Math.min(100, pct));
}

/**
 * Render a progress bar using block characters.
 * "████░░░░ 57%" or "████████ 100%"
 */
function renderBar(pct: number): string {
	const filled = Math.round((pct / 100) * BAR_WIDTH);
	const empty = BAR_WIDTH - filled;
	return `${"█".repeat(filled)}${"░".repeat(empty)} ${pct}%`;
}

/**
 * Format running jobs into a powerbar segment payload.
 */
export function formatJobSegment(jobs: JobResponse[]): SegmentData {
	if (jobs.length === 0) {
		return { text: "", icon: "⚙", color: "muted" };
	}

	const withBar: string[] = [];
	const withoutBar: JobResponse[] = [];
	for (const job of jobs) {
		const pct = jobProgress(job);
		if (pct !== undefined) {
			const cmd = job.command.join(" ");
			withBar.push(`${cmd} ${renderBar(pct)}`);
		} else {
			withoutBar.push(job);
		}
	}

	const parts: string[] = [...withBar];

	if (withoutBar.length === 1) {
		parts.push(withoutBar[0].command.join(" "));
	} else if (withoutBar.length > 1) {
		parts.push(`${withoutBar.length} jobs`);
	}

	return { text: parts.join(" · "), icon: "⚙", color: "muted" };
}
