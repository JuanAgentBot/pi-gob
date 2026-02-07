# @juanibiapina/pi-gob

A [pi](https://github.com/badlogic/pi-mono) extension for managing [gob](https://github.com/juanibiapina/gob) background jobs.

## Features

- **Powerbar segment** — Running jobs displayed in the powerbar via the `gob` segment, updated in real time via daemon connection
- **`/gob` command** — Interactive list of all jobs with actions (logs, stop, start, restart, remove)
- **Daemon protocol** — Connects directly to the gob daemon Unix socket for instant updates, with CLI fallback

## Installation

```bash
pi install npm:@juanibiapina/pi-gob
```

## Usage

### Powerbar Segment

Add `gob` to your powerbar left or right segments in powerbar settings. The segment appears when there are running gob jobs in the current working directory.

- 1 job: `⚙ npm run dev`
- Multiple jobs: `⚙ 2 jobs`

The segment updates in real time via the gob daemon event stream.

### `/gob` Command

Use `/gob` to open an interactive job list. Navigate with arrow keys, press Enter to see available actions.

| Action | Available When | Description |
|--------|---------------|-------------|
| logs | Always | View last 50 lines of output |
| stop | Running | Stop the job |
| start | Stopped | Start the job again |
| restart | Always | Stop and start the job |
| remove | Stopped | Remove the job |

## How It Works

The extension connects to the gob daemon's Unix socket (`$XDG_RUNTIME_DIR/gob/daemon.sock`) and subscribes to job events. When jobs change, it emits `powerbar:update` events with segment id `gob`. If the daemon isn't running, the extension retries every 5 seconds and falls back to the `gob` CLI for the `/gob` command.

## License

MIT
