# Job-Hunt Copilot — Cowork plugin (marketplace repo)

A self-driving job-search assistant for **Claude Cowork / Claude Code**. It interviews you once, builds your Master Career Profile from your CV, picks the right job boards for your country, and schedules a **5-agent team** (Scout finds roles + tailors CVs, Polish benchmarks your profile, Radar watches your inbox, Coach grades the team, Sync keeps your job-site profiles in step) feeding a **live tabbed dashboard**.

Everything the team needs from you lands in **one To-Do list** with **one plain daily summary** — so you act from a single place and never chase five separate agents. Written in plain, everyday English throughout.

Fully generic — any profession, any country. It **never submits an application, sends a message, spends money, creates an account, or logs in for you.**

## Install (for your friend)
1. Requirements: a Claude plan with **Cowork access**, the **desktop app** open, **Claude in Chrome** signed into their job boards + email, and a **workspace folder**.
2. Add this repo as a plugin marketplace, then install the plugin. In Claude Code / Cowork:
   ```
   /plugin marketplace add MrBaZ78/job-hunt-copilot
   /plugin install job-hunt-copilot@job-hunt-copilot-marketplace
   ```
   (Exact commands can vary by Cowork version. If plugin install isn't available, the `job-hunt-setup.skill` file installs the same setup via the "Save skill" button.)
3. In chat, say **"set up my job search"** and answer the short intake. The setup builds everything and **creates the 5 scheduled agents automatically.**

## What's in here
- `.claude-plugin/marketplace.json` — marketplace manifest (lists the plugin).
- `plugins/job-hunt-copilot/` — the plugin: manifest, the `job-hunt-setup` skill, and templates (dashboard + Master Profile).

See `plugins/job-hunt-copilot/README.md` for the full details, requirements, and daily use.
