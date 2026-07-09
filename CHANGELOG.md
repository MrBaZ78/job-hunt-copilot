# Changelog — Job-Hunt Copilot

All notable changes to the flow are recorded here. Versions follow **MAJOR.MINOR.PATCH**:
- **PATCH** (1.0.**x**) — small fixes / wording tweaks, no behaviour change.
- **MINOR** (1.**x**.0) — new feature that's backward-compatible (e.g. a new dashboard panel, a new question).
- **MAJOR** (**x**.0.0) — a big or breaking change (e.g. a new agent, changed file structure, new setup flow).

The single source of truth for the current version is the `version` field in `plugins/job-hunt-copilot/.claude-plugin/plugin.json`.

---

## [2.5.1] — 2026-07-09
### Added
- **Dismissable picks bar.** The sticky "N picks ready — copy the line" bar at the bottom of the Daily Hub now has a **×** button to hide it. It reappears automatically the moment you tap any Apply / Accept / Reject again, so queued picks are never lost — hiding only tucks the bar out of the way.
### Notes
- PATCH — pinned-Hub UI only; no data touched. Update: refresh the marketplace, `/reload-plugins`, then run **"update my job hunt"**. Reopen the Dashboard tile afterward (the desktop app caches the rendered view).

## [2.5.0] — 2026-07-08
Merged everything into ONE pinned tile: the Dashboard.
### Changed
- **One place, not three.** The Daily Menu and the Daily To-Do panel are folded into the **Dashboard's Today tab** as a **Daily Hub**: a ▶ Run-now menu (one button per agent, via `window.cowork.runScheduledTask`) on top, then the actionable jobs (Apply/Not-interested), CV upgrades (Accept/Reject + Accept all) and asks. A fresh install now pins a single tile — the Dashboard — instead of three.
- **Run-now reads `data-agents.js`.** Each agent entry carries `ic`/`md`/`mt`/`task` (its scheduled-task id, written in setup STEP 5); the build reads those for the menu — no hardcoded task ids. Setup STEP 5b (was 5b+5c) builds the dashboard-with-hub and schedules the daily refresh; `daily-menu.template.html` is no longer used.
- **Honest action bridge.** A pinned artifact can't message the chat or auto-copy, so the Hub's taps collect into one plain instruction line the user copies and pastes to the coordinator (e.g. "apply to 2; accept CV upgrades 7, 8"). Applied shortlist roles are hidden so they aren't re-offered.
### Updater
- `job-hunt-update` migrates existing installs: backfills task ids into `data-agents.js`, rebuilds the merged dashboard, and turns any old `daily-todo`/`daily-menu` pinned tiles into "moved into the Dashboard" pointers (there is no delete-artifact tool).
### Notes
- MINOR (backward-compatible; no data touched). Update: refresh the marketplace, `/reload-plugins`, then run **"update my job hunt"**. Reopen the Dashboard tile afterward — the desktop app caches the rendered view.

## [2.4.1] — 2026-07-08
### Fixed
- **Company summary now shows** under each role in the Daily To-Do's "New jobs to review" (it had been showing only the job summary).
- **Panel buttons lead to real action.** A tap queues your choice (with undo); a sticky bar shows one instruction line to copy and paste into the chat, which the assistant then carries out. Previously a tap only marked the choice and couldn't reach the chat, so nothing happened — a pinned artifact can't message the chat or run scripted clipboard, so it surfaces a selectable line instead.
### Notes
- PATCH — pinned-panel behaviour only; no data touched.

## [2.4.0] — 2026-07-08
Adds a tap-to-act companion to the Daily Menu, and pins the dashboard.
### Added
- **Daily To-Do panel** (`daily-todo` artifact, built by the new `templates/build-dashboards.js` in setup STEP 5c) — the action companion to the Daily Menu. Today's shortlisted jobs show **✓ Apply / ✕ Not interested**; pending CV wording upgrades show **✓ Accept / ✕ Reject** plus **Accept all**; other open asks (unanswered questions, job-sites behind, admin to-dos) are one-tap cards. A tap just sends the same words the user would type (`apply to 2`, `reject 7`, `accept all`) via `sendPrompt` (falling back to copy-to-clipboard); choices persist per-day in `localStorage`. It never submits or logs in.
- **Pinned dashboard** — the dashboard is now also registered as a self-contained Cowork artifact (`dashboard`, all ten `data-*.js` queues inlined by the same build script), so Daily To-Do, Daily Menu and the dashboard all sit together in the sidebar.
- **Daily refresh task** (`refresh-pinned-dashboards`) — a small background maintenance task that rebuilds both pinned artifacts from the live queues each day after the agents run, so the snapshots stay current. Silent, `notifyOnCompletion:false`; not an "agent" (not on the Daily Menu). Includes a synced-folder truncation-recovery path (re-run the build with `--src <clean dir>`).
- **Updater support** — `job-hunt-update` now brings existing installs up to v2.4.0: copies the build script, registers the two new artifacts, and creates the refresh task if missing. Preserves all data.
### Notes
- Backward-compatible — MINOR release. To update: refresh the marketplace, `/reload-plugins` (or the Cowork Plugins UI), then run **"update my job hunt"**.

## [2.3.0] — 2026-07-08
Makes upgrades painless for people who already set up on an older version.
### Added
- **`job-hunt-update` skill (in-place migrator)** — say **"update my job hunt"** and it upgrades an existing install without losing data: refreshes the dashboard and rebuilds the Daily Menu, adds any missing data files (e.g. `data-todo.js`), and re-syncs the 5 agent prompts from the saved config (so they get the To-Do list, plain-English writing, Daily-Menu nudges, and email-connector Radar). It preserves the Master Profile, applications, saved suggestions, and "not interested" list. Solves the gap where updating the plugin alone only affected *future* setups, not a running system.
- **Names the command-center chat** — both setup (STEP 6) and the updater now ask the user to rename their main chat **"Chief of Staff"**, so they always know the one place they talk to.
### Notes
- Backward-compatible — MINOR release. To update: refresh the marketplace (`/plugin marketplace update job-hunt-copilot-marketplace` in Claude Code, or the Plugins UI in Cowork), then run **"update my job hunt"**.

## [2.2.0] — 2026-07-08
Three requested tweaks for real installs.
### Added
- **Multi-select intake** — setup now uses `multiSelect: true` for questions where more than one answer is true (seniority levels, target roles, locations/cities, industries to prefer/avoid, job boards, CV languages), so users can pick several instead of one.
- **Prefer a connected email over the browser** — if a Gmail/Outlook connector is connected, Radar reads the inbox directly through it (read-only) instead of driving Claude in Chrome, which is more reliable. Chrome remains the fallback and is still used for LinkedIn. Setup recommends connecting email and STEP 0 checks for it.
- **"Words you can type" section in the README** — a table of the handy shortcuts (`menu`, `what's new?`, `show shortlist`, `run Scout`, `accept all` / `accept #` / `reject #`, `go`, `not interested in N`, `re-run`) and where to type them.
### Notes
- Backward-compatible (no behaviour removed) — MINOR release.

## [2.1.0] — 2026-07-08
Fixes the "I finished setup — now what?" confusion new users hit.
### Added
- **Daily Menu** — a live control-panel artifact (`Agent-System/daily-menu.html`, registered via `create_artifact`) with one card per agent (plain "what it does for you" line) and a **▶ Run now** button that starts that agent early via `window.cowork.runScheduledTask(<taskId>)`. Buttons degrade gracefully to "type 'run Scout'" if they can't trigger. New template: `templates/daily-menu.template.html`; new setup step **STEP 5b** builds it from the real task IDs.
### Changed
- **Much clearer end of setup (STEP 6)** — the coordinator now opens the Daily Menu for the user and walks the daily rhythm in a few plain lines with real example replies, instead of a wall of text.
- **Coach's daily message points to the menu** — opens by inviting the user to run any helper early from the Daily Menu, and closes with the "what's new?" / Run-now reminder.
- Backward-compatible with 2.0.0 (adds a menu + wording; no existing behaviour removed), so this is a MINOR release.

## [2.0.0] — 2026-07-07
Big usability overhaul. Two problems from real use: the writing was too complex, and five agents each pinging separately felt scattered — the user couldn't tell what to do or when, and worried they'd missed something.
### Added
- **One shared To-Do list** (`data-todo.js`) — every agent that needs the user drops a plain item here (`{who, priority, added, title, reply}`), pinned at the top of the dashboard. The user acts from ONE place by replying, instead of chasing five agent chats.
- **Tabbed dashboard** — rebuilt into 4 tabs that read like a story: **📌 Today** (headline + To-Do only), **📈 Progress** (North Star, funnel, numbers, applications), **📝 My Profile** (CV suggestions + job-site sync), **🤝 The Team** (all agents in one place with scores + notes). Expand/collapse sections replace the old wall of cards.
- **"what's new?"** — the user can ask any time and the coordinator reads the To-Do list and answers right then.
### Changed
- **One daily ping, from Coach only** — Scout/Polish/Radar/Sync now run silently (`notifyOnCompletion: false`) and write to the To-Do list; Coach (`notifyOnCompletion: true`) tidies the list, carries forward anything not done (keeping the original date so "waiting N days" stays true), and sends the single plain daily summary. Radar keeps one exception: an immediate heads-up for a new interview invite or offer.
- **Plain English everywhere** — every agent prompt and the dashboard now use short sentences, everyday words, and spell out shorthand.
- **De-duplicated dashboard** — agents previously appeared in ~4 sections and numbers in ~3; each now lives in exactly one place.
### Why MAJOR
New file in the workspace structure (`data-todo.js`), a new dashboard layout, and changed agent notification behaviour — an existing install needs the new file and template, so this is a breaking change per the versioning rules below.

## [1.1.1] — 2026-07-07
### Fixed
- **Closed the Scout↔Sync loop the other way** — once Sync sets up a new board, Scout now reads `data-sync.js` and adds that board to its daily search rotation. Previously a newly-added board (e.g. beBee) got a profile but was never searched.

## [1.1.0] — 2026-07-06
### Fixed
- **CV intake** — setup now asks the user to attach the CV directly via **+ / paperclip** and verifies it's readable before continuing (fixes the empty-CV-field-on-submit bug where a form uploader dropped the file).
- **Board selection is strictly country-based** — no longer defaults to GCC boards (Bayt / GulfTalent / Naukrigulf) for users outside the GCC/MENA/India; unlisted countries fall back to LinkedIn + Indeed + national board + company ATS.
- **Run guard / first run** — Scout skips only on a REAL completed sweep for today (not a seed/initialization state), and a manual trigger always runs — so the first scheduled run works and the shortlist can be run manually any time.
### Changed
- **Dashboard is fully data-driven** — the agent roster (Team card + Agents section) now comes from `data-agents.js` written by setup, instead of being hardcoded in the HTML.

## [1.0.1] — 2026-07-06
### Added
- `LICENSE` — personal / non-commercial use (free for personal job search; commercial rights reserved to the author).
- `DISCLAIMER.md` — not affiliated with Anthropic; each user needs their own subscription; users responsible for third-party (job-board) terms; honesty; no warranty/guarantee.
- `TROUBLESHOOTING.md` — common fixes (login-gated boards, Cloudflare, tasks not firing, permissions, model cost) + reset/update steps.
- License + disclaimer + troubleshooting also bundled inside the plugin folder so they travel with an install.

## [1.0.0] — 2026-07-06
Initial release.
- 5-agent team: **Scout** (find roles + tailor CVs), **Polish** (profile benchmark → review queue), **Radar** (read-only inbox/LinkedIn watch + funnel), **Coach** (daily scoring + loop verification + dashboard refresh), **Sync** (job-site profile presence).
- `job-hunt-setup` skill: intake interview, CV → Master Career Profile, country → board selection, workspace + dashboard creation, and **auto-creates all 5 scheduled agents**.
- Live dashboard: Goal/Team/Direction/Guardrails cards, North Star metric, agent scores vs target, funnel, statistics, boards-searched coverage, profile-suggestions review queue, agent health, today's shortlist, closed-loop map, profile-sync status, live applications table.
- Guardrails: never submits, sends, spends, creates accounts, or logs in for the user; honesty rule on every CV line; human-gated steps stay with the user.

<!-- Add new versions ABOVE this line, newest first. Template:
## [1.1.0] — YYYY-MM-DD
### Added / Changed / Fixed
- ...
-->
