---
name: job-hunt-update
description: >
  Upgrade an EXISTING Job-Hunt Copilot install to the latest version WITHOUT losing data.
  Use when the user says "update my job hunt", "upgrade the job copilot", "migrate my job
  search to the new version", or after they've updated the plugin and want their running
  system (dashboard, Daily Menu, agent prompts) brought up to date. Refreshes the generated
  files and re-syncs the 5 agent prompts from their saved config; never touches their CV,
  applications, suggestions history, or other data.
---

# Job-Hunt Copilot — Update / Migrate an existing install

You are UPGRADING an existing install IN PLACE. Goal: bring the running system up to the current version's behaviour, while PRESERVING every piece of the user's data and history. Be warm, concise, and write in plain English. Same guardrails as setup: never submit, send, spend, create accounts, log in, solve CAPTCHAs, or invent facts. When in doubt about overwriting something, ask first.

Why this exists: installing a newer plugin version only refreshes the setup skill + templates for FUTURE setups. It does NOT change a system that's already been set up — the scheduled agents, dashboard, data files and Daily Menu were written into the workspace at setup time. This skill applies the new version to an existing install.

## STEP 0 — Confirm it's an existing install
Check the connected workspace has an `Agent-System/` folder with data files (e.g. `Agent-System/Queues/data-applied.js`). If it does NOT, this is a fresh user → run the **job-hunt-setup** skill instead, and stop here.

## STEP 1 — Recover their saved config (do NOT re-interview)
Read `search-config.md` and `Master-Career-Profile.md` to recover: user name, contact email, target roles + seniority, locations, the boards list, exclusions/knockouts, CV languages, and the preferred morning start hour **H**. If `search-config.md` is missing (a very old install), reconstruct what you can from the other files and the scheduled tasks, and ask ONLY the few things you genuinely can't recover. Also note whether an **email connector** (Gmail/Outlook) is now connected — the new Radar prompt prefers it.

## STEP 2 — PRESERVE these — never overwrite their content
Treat as read-only (only CREATE one if it's entirely missing, with an empty seed — never clobber a file that holds data):
`Master-Career-Profile.md`, `CVs/`, `data-applied.js` (their applications), `data-suggestions.js` + `profile-improvement-suggestions.md` (their accept/reject history), `not-interested.md`, `open-items.md`, `inbox-and-messages.md`, `data-sync.js` (their live-site statuses), `data-stats.js`, `data-health.js`, `data-charter.js`. Their history and numbers must survive the update untouched.

## STEP 3 — Refresh the generated UI (safe to overwrite — it only reads data)
- Overwrite `Agent-System/progress-dashboard.html` with the latest `templates/progress-dashboard.html`. The dashboard is fully data-driven (it just reads the `data-*.js` files), so refreshing it loses no data and gives them the current 4-tab layout.
- Make sure every data file the new dashboard reads EXISTS (add missing ones with the blank seed from **job-hunt-setup STEP 4** — especially `data-todo.js` and `data-agents.js`). **Backfill `data-agents.js` for the Daily Hub:** for each of the 5 agents add `ic` (emoji), `md` (one plain "what it does for you" line), `mt` (plain schedule) and — crucially — `task` = its real scheduled-task id from `list_scheduled_tasks` (`morning-shortlist`, `profile-benchmark`, `inbox-and-messages`, `agent-health-review`, `profile-sync`). The Chief-of-Staff entry keeps `task:""`. This is what powers the Run-now buttons.
- **Build the merged Dashboard (latest):** copy `templates/build-dashboards.js` to `Agent-System/build-dashboards.js` and run it (`node build-dashboards.js`, prints `Built: …`). It rebuilds `dashboard-pinned.html` with a **Daily Hub injected into the Today tab** (▶ Run-now menu + Apply/Accept/Reject actions with a copy-line), and writes `daily-todo.html`/`daily-menu.html` as small "moved into the Dashboard" pointer pages. From **v2.6.0** the build also renders **Approve / Not-now buttons on Coach's recommendations** (Team tab) and can show a **"Last run"** time per Run-now card plus a **🔄 Refresh** card — the last-run times come from an `AGENT_RUNS_JSON` env var the refresh task sets (see below); nothing else is needed. Register/refresh the Cowork artifact `create_artifact` id **`dashboard`** (html_path → `Agent-System/dashboard-pinned.html`). Preserves all data — it only READS the queues. If the truncation warning fires, Read the named files with the Read tool, Write clean copies to a temp dir, and re-run with `--src <that dir>`.
- **Retire the old separate tiles:** if this install pinned `daily-todo` and/or `daily-menu` artifacts (from v2.1–v2.4), point EACH at its pointer page — `update_artifact` id `daily-todo` (html_path → `Agent-System/daily-todo.html`) and id `daily-menu` (html_path → `Agent-System/daily-menu.html`) — so they read "moved into the Dashboard; unpin this". (There's no delete-artifact tool; a pointer is how we de-duplicate a pin.)
- **Daily refresh task:** ensure `refresh-pinned-dashboards` exists (create it ~30–45 min after Coach if missing, `notifyOnCompletion:false`). Its job now: call `list_scheduled_tasks`, build a JSON map of each agent taskId → its `lastRunAt` (ISO-8601 UTC; use now for the refresh task itself), run `AGENT_RUNS_JSON='{...}' node build-dashboards.js` (falling back to a plain `node build-dashboards.js` if the map can't be built), then `update_artifact` id **`dashboard`** only. This is what powers the "Last run" times on the Run-now cards. If an older version's prompt also updated `daily-todo`/`daily-menu`, rewrite it to the dashboard-only version and add the `AGENT_RUNS_JSON` step.

## STEP 4 — Re-sync the 5 agent prompts (this is what delivers the new behaviour)
The agents keep the OLD instructions until you refresh them. For each existing scheduled task, match it by role and REPLACE its prompt with the current generic template from the **job-hunt-setup** skill's STEP 5, re-injecting their config from STEP 1 (keep one source of truth — copy the templates from job-hunt-setup, don't invent new wording):
- `morning-shortlist` → Scout · `profile-benchmark` → Polish · `inbox-and-messages` → Radar · `agent-health-review` → Coach · `profile-sync` → Sync.
Set notifications: **Coach `notifyOnCompletion: true`**, the other four **`false`**. Keep every guardrail verbatim. Do NOT change their schedule times unless they ask. If a task is missing (e.g. they were set up before Sync or Coach existed), offer to create it with the correct cron from **H**. This is the step that gives them the To-Do list, the plain-English writing, the Daily-Menu nudges, and the email-connector Radar.

## STEP 5 — Name the command-center chat
Ask the user to rename THIS chat to **"Chief of Staff"** (using the chat's rename / title option) so they always know it's the one place they talk to for everything. If a chat-title tool is available to you, offer to do it for them.

## STEP 6 — Report, in plain English
A few short lines: the version they're now on, what got refreshed (the dashboard, the Daily Menu, and the 5 helpers' instructions), and an explicit reassurance that nothing was lost — their CV, applications, saved suggestions, and "not interested" list are all kept. Remind them of the handy words ("menu", "what's new?") and that they can tap **▶ Run now** in the Daily Menu. Offer to run Scout now so they see the refreshed flow.

## Guardrails (never break)
Preserve all user data — never overwrite the Master Profile content, applications, or history. Never apply/submit, send/reply, spend, create accounts, enter passwords, log in, or solve CAPTCHAs. Human-gated steps stay with the user.
