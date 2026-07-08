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
- Make sure every data file the new dashboard reads EXISTS. Add any that are missing with the blank seed from **job-hunt-setup STEP 4** — especially `data-todo.js` and `data-agents.js` if this install predates them. Fill `data-agents.js` from the actual agent roster (Scout/Polish/Radar/Coach/Sync + Chief of Staff) using their scheduled times.
- Build the **Daily Menu**: take `templates/daily-menu.template.html`, fill in the five real `taskId`s (from list_scheduled_tasks) and plain schedule text, write `Agent-System/daily-menu.html`, and register/refresh the Cowork artifact with `create_artifact` (id `daily-menu`).

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
