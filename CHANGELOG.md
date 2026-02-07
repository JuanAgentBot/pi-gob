# Changelog

## 0.4.0

- Register `gob` powerbar segment via `powerbar:register-segment` event for ordered multi-select settings

## 0.3.0

### Changed

- Replaced standalone widget with a powerbar segment (`gob`) via `powerbar:update` events
- Removed `widget.ts`; added `segment.ts` for powerbar formatting
- 1 running job shows `⚙ <command>`, multiple shows `⚙ N jobs`
- Jobs with historical run data show a progress bar and percentage via the powerbar's built-in bar support
- Multiple jobs with history show average progress across all tracked jobs

## 0.2.0

- Connect to gob daemon via Unix socket for real-time job monitoring
- Show live widget below editor with running jobs and progress bars

## 0.1.0

- Initial release
- `/gob` command for viewing and managing background jobs
- CLI-based job listing and actions
