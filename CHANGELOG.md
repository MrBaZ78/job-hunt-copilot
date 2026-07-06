# Changelog — Job-Hunt Copilot

All notable changes to the flow are recorded here. Versions follow **MAJOR.MINOR.PATCH**:
- **PATCH** (1.0.**x**) — small fixes / wording tweaks, no behaviour change.
- **MINOR** (1.**x**.0) — new feature that's backward-compatible (e.g. a new dashboard panel, a new question).
- **MAJOR** (**x**.0.0) — a big or breaking change (e.g. a new agent, changed file structure, new setup flow).

The single source of truth for the current version is the `version` field in `plugins/job-hunt-copilot/.claude-plugin/plugin.json`.

---

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
