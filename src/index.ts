/**
 * Gob Extension
 *
 * Manages gob background jobs from within pi.
 * Use /gob to view and interact with running and stopped jobs.
 * Jobs are displayed with their status, and you can view logs, stop, restart, or remove them.
 */

import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { DynamicBorder } from "@mariozechner/pi-coding-agent";
import { Container, Key, matchesKey, type SelectItem, SelectList, Text } from "@mariozechner/pi-tui";

interface GobJob {
	id: string;
	pid: string;
	status: "running" | "stopped";
	exitCode?: string;
	command: string;
	description?: string;
}

function parseGobList(output: string): GobJob[] {
	const jobs: GobJob[] = [];
	const lines = output.split("\n").filter((l) => l.trim().length > 0);

	let i = 0;
	while (i < lines.length) {
		const line = lines[i];
		// Format: <job_id>: [<pid>] <status> (<exit_code>): <command>
		const match = line.match(/^(\S+): \[(\S+)\] (\S+)(?: \((\d+)\))?: (.+)$/);
		if (match) {
			const job: GobJob = {
				id: match[1],
				pid: match[2],
				status: match[3] as "running" | "stopped",
				exitCode: match[4],
				command: match[5],
			};

			// Check for description on next line (indented)
			if (i + 1 < lines.length && lines[i + 1].startsWith("         ")) {
				job.description = lines[i + 1].trim();
				i++;
			}

			jobs.push(job);
		}
		i++;
	}

	return jobs;
}

async function fetchJobs(pi: ExtensionAPI): Promise<GobJob[]> {
	const result = await pi.exec("gob", ["list"]);
	if (result.code !== 0) {
		return [];
	}
	return parseGobList(result.stdout);
}

export default function (pi: ExtensionAPI) {
	const showJobList = async (ctx: ExtensionContext) => {
		if (!ctx.hasUI) {
			ctx.ui.notify("No UI available", "error");
			return;
		}

		const jobs = await fetchJobs(pi);

		if (jobs.length === 0) {
			ctx.ui.notify("No gob jobs found", "info");
			return;
		}

		await ctx.ui.custom<void>((tui, theme, _kb, done) => {
			const container = new Container();

			// Top border
			container.addChild(new DynamicBorder((s: string) => theme.fg("accent", s)));

			// Title
			container.addChild(new Text(theme.fg("accent", theme.bold(" Gob Jobs")), 0, 0));

			// Build select items
			const items: SelectItem[] = jobs.map((job) => {
				const statusColor = job.status === "running" ? "success" : "muted";
				const statusIcon = job.status === "running" ? "●" : "○";
				const exitInfo =
					job.status === "stopped" && job.exitCode !== undefined ? theme.fg("dim", ` (${job.exitCode})`) : "";
				const status = theme.fg(statusColor, statusIcon);
				const label = `${status} ${theme.fg("dim", job.id)} ${job.command}${exitInfo}`;
				const description = job.description ? theme.fg("muted", job.description) : undefined;
				return {
					value: job.id,
					label,
					description,
				};
			});

			const visibleRows = Math.min(jobs.length, 15);
			let currentIndex = 0;

			const selectList = new SelectList(items, visibleRows, {
				selectedPrefix: (t) => theme.fg("accent", t),
				selectedText: (t) => t,
				description: (t) => t,
				scrollInfo: (t) => theme.fg("dim", t),
				noMatch: (t) => theme.fg("warning", t),
			});

			selectList.onSelect = async (item) => {
				done();
				const job = jobs.find((j) => j.id === item.value);
				if (job) {
					await showJobActions(ctx, job);
				}
			};
			selectList.onCancel = () => done();
			selectList.onSelectionChange = (item) => {
				currentIndex = items.indexOf(item);
			};
			container.addChild(selectList);

			// Help text
			container.addChild(new Text(theme.fg("dim", " ↑↓ navigate • ←→ page • enter actions • esc close"), 0, 0));

			// Bottom border
			container.addChild(new DynamicBorder((s: string) => theme.fg("accent", s)));

			return {
				render: (w) => container.render(w),
				invalidate: () => container.invalidate(),
				handleInput: (data) => {
					if (matchesKey(data, Key.left)) {
						currentIndex = Math.max(0, currentIndex - visibleRows);
						selectList.setSelectedIndex(currentIndex);
					} else if (matchesKey(data, Key.right)) {
						currentIndex = Math.min(items.length - 1, currentIndex + visibleRows);
						selectList.setSelectedIndex(currentIndex);
					} else {
						selectList.handleInput(data);
					}
					tui.requestRender();
				},
			};
		});
	};

	const showJobActions = async (ctx: ExtensionContext, job: GobJob) => {
		const actions: string[] = [];

		if (job.status === "running") {
			actions.push("logs", "stop", "restart");
		} else {
			actions.push("logs", "start", "restart", "remove");
		}

		const action = await ctx.ui.select(`${job.id}: ${job.command}`, actions);
		if (!action) return;

		let result: { stdout: string; stderr: string; code: number | null };

		switch (action) {
			case "logs":
				result = await pi.exec("gob", ["logs", "--tail", "50", job.id], { timeout: 5000 });
				if (result.code === 0 && result.stdout.trim()) {
					ctx.ui.notify(`Logs for ${job.id}:\n${result.stdout.trim()}`, "info");
				} else {
					ctx.ui.notify(`No logs for ${job.id}`, "info");
				}
				break;
			case "stop":
				result = await pi.exec("gob", ["stop", job.id]);
				ctx.ui.notify(
					result.code === 0 ? `Stopped ${job.id}` : `Error: ${result.stderr}`,
					result.code === 0 ? "info" : "error",
				);
				break;
			case "start":
				result = await pi.exec("gob", ["start", job.id]);
				ctx.ui.notify(
					result.code === 0 ? `Started ${job.id}` : `Error: ${result.stderr}`,
					result.code === 0 ? "info" : "error",
				);
				break;
			case "restart":
				result = await pi.exec("gob", ["restart", job.id]);
				ctx.ui.notify(
					result.code === 0 ? `Restarted ${job.id}` : `Error: ${result.stderr}`,
					result.code === 0 ? "info" : "error",
				);
				break;
			case "remove":
				result = await pi.exec("gob", ["remove", job.id]);
				ctx.ui.notify(
					result.code === 0 ? `Removed ${job.id}` : `Error: ${result.stderr}`,
					result.code === 0 ? "info" : "error",
				);
				break;
		}
	};

	// Register /gob command
	pi.registerCommand("gob", {
		description: "View and manage gob background jobs",
		handler: async (_args, ctx) => showJobList(ctx),
	});
}
