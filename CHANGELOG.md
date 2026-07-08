# Changelog — Job-Hunt Copilot

All notable changes to the flow are recorded here. Versions follow **MAJOR.MINOR.PATCH**:
- **PATCH** (1.0.**x**) — small fixes / wording tweaks, no behaviour change.
- **MINOR** (1.**x**.0) — new feature that's backward-compatible (e.g. a new dashboard panel, a new question).
- **MAJOR** (**x**.0.0) — a big or breaking change (e.g. a new agent, changed file structure, new setup flow).

The single source of truth for the current version is the `version` field in `plugins/job-hunt-copilot/.claude-plugin/plugin.json`.

---

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
