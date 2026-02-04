/**
 * TypeScript types mirroring the gob daemon protocol.
 * See gob/internal/daemon/protocol.go for the canonical definitions.
 */

// Request types
export type RequestType =
	| "ping"
	| "shutdown"
	| "list"
	| "add"
	| "create"
	| "stop"
	| "start"
	| "restart"
	| "remove"
	| "stop_all"
	| "signal"
	| "get_job"
	| "runs"
	| "stats"
	| "subscribe"
	| "version"
	| "ports"
	| "remove_run";

// Event types
export type EventType =
	| "job_added"
	| "job_started"
	| "job_stopped"
	| "job_removed"
	| "job_updated"
	| "run_started"
	| "run_stopped"
	| "run_removed"
	| "ports_updated";

// Protocol messages
export interface Request {
	type: RequestType;
	payload?: Record<string, unknown>;
}

export interface Response {
	success: boolean;
	error?: string;
	data?: Record<string, unknown>;
}

// Port information
export interface PortInfo {
	port: number;
	protocol: string;
	pid: number;
	address: string;
}

// Job response from daemon
export interface JobResponse {
	id: string;
	pid: number;
	status: string;
	command: string[];
	workdir: string;
	description?: string;
	blocked?: boolean;
	created_at: string;
	started_at: string;
	stopped_at?: string;
	stdout_path: string;
	stderr_path: string;
	exit_code?: number | null;
	ports?: PortInfo[];

	// Statistics
	run_count: number;
	success_count: number;
	failure_count: number;
	success_rate: number;
	avg_duration_ms: number;
	failure_avg_duration_ms: number;
	min_duration_ms: number;
	max_duration_ms: number;
}

// Run response from daemon
export interface RunResponse {
	id: string;
	job_id: string;
	pid: number;
	status: string;
	exit_code?: number | null;
	stdout_path: string;
	stderr_path: string;
	started_at: string;
	stopped_at?: string;
	duration_ms: number;
}

// Event from subscription stream
export interface Event {
	type: EventType;
	job_id: string;
	job: JobResponse;
	run?: RunResponse;
	ports?: PortInfo[];
	job_count: number;
	running_job_count: number;
}

// Job ports response
export interface JobPorts {
	job_id: string;
	pid: number;
	ports: PortInfo[];
	status?: string;
	message?: string;
}
