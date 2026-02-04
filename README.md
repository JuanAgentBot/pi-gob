# @juanibiapina/pi-gob

A [pi](https://github.com/badlogic/pi-mono) extension for managing [gob](https://github.com/juanibiapina/gob) background jobs.

## Features

- **`/gob` command** — Show a list of all gob jobs with their status
- **Status indicators** — Running (●) and stopped (○) with exit codes
- **Job actions** — View logs, stop, start, restart, or remove jobs
- **Descriptions** — Shows job descriptions when available

## Installation

```bash
pi install npm:@juanibiapina/pi-gob
```

## Usage

Use `/gob` in pi to open the job list. Navigate with arrow keys, press Enter to see available actions for a job.

### Actions

| Action | Available When | Description |
|--------|---------------|-------------|
| logs | Always | View last 50 lines of output |
| stop | Running | Stop the job |
| start | Stopped | Start the job again |
| restart | Always | Stop and start the job |
| remove | Stopped | Remove the job |

## License

MIT
