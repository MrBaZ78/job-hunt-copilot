# Job-Hunt Copilot (Cowork plugin)

A self-driving job-search assistant for **Claude Cowork**. Run one setup skill and it interviews you, builds your Master Career Profile from your CV, picks the right job boards for your country, and schedules a **5-agent team** feeding a **live dashboard**:

- **Scout** — finds open, well-fit roles each morning; builds tailored CVs and pre-fills applications on your picks.
- **Polish** — benchmarks your profile vs live job ads and proposes honest improvements (you accept/reject).
- **Radar** — read-only inbox + LinkedIn watch for replies / interviews / offers; moves your funnel.
- **Coach** — grades each agent daily, tracks the funnel toward a North Star (interviews), verifies the handoffs.
- **Sync** — keeps your live job-site profiles matched to your Master Profile; helps set up new boards.

Everything the team needs from you lands in **one To-Do list** at the top of the dashboard, with **one plain daily summary** from Coach — so you act from a single place instead of chasing five agents. The dashboard has **4 tabs**: **Today** (the To-Do list — the only tab you must check), **Progress**, **My Profile**, **The Team**. Three panels pin in your sidebar: a **Daily To-Do** where you tap **✓ Apply / ✕ Not interested** on today's jobs and **✓ Accept / ✕ Reject** on CV upgrades (a tap just sends me the words you'd type — it never submits or logs in); a **Daily Menu** with one card per helper and a **▶ Run now** button to start any of them early; and the **dashboard** itself. A small daily refresh keeps all three current. Written in plain, everyday English throughout.

Fully generic — **any profession, any country.** You always stay in control: it **never submits an application, sends a message, spends money, creates an account, or logs in for you.** Every CV line must be true and defensible.

---

## Requirements to run
1. **Claude plan with Cowork access** (Cowork is a research preview — this is the main gate).
2. **Claude desktop app**, kept open — scheduled agents only run while the app is running.
3. **Your email connected** (recommended) — connect Gmail or Outlook as a connector (Settings → Connectors) so Radar can read your inbox directly. This is more reliable than the browser. If you can't, Radar falls back to reading your webmail through Claude in Chrome.
4. **Claude in Chrome** extension, connected and **signed into your job boards + LinkedIn** (Scout/Radar/Sync drive a logged-in browser for these).
5. A **folder on your computer** connected as the workspace (everything is written there).
6. Optional: set the Scout agent to a stronger model (e.g. a top-tier model) for sharper fit-scoring.

## What you'll be asked (once, during setup)
Your CV (upload), name + contact email, target role(s) & seniority, location(s) + remote?, industries to prefer/avoid, hard knockouts (visa/salary/onsite), which boards you use, CV language(s), and your preferred morning start hour. Takes a few minutes.

## Install
1. Add this plugin to Cowork (Settings → Capabilities / Plugins → install the plugin, or install from a marketplace if your friend shared one).
2. Connect a folder as your workspace.
3. In chat, say: **"set up my job search"** (or run the `job-hunt-setup` skill).
4. Answer the intake. The setup then builds your profile, writes the dashboard, and **creates the 5 scheduled agents automatically.**
5. Click **Run now** on each new scheduled task once, so it can pre-approve browser access.
6. Open `Agent-System/progress-dashboard.html` to watch progress.

## Updating to a new version
Installing a newer plugin version only refreshes the setup skill + templates — it does **not** change a system you've already set up (your agents, dashboard and Daily Menu were written into your workspace at setup time). To upgrade an existing install in two steps:
1. **Refresh the plugin:** in Claude Code run `/plugin marketplace update job-hunt-copilot-marketplace` then `/reload-plugins`; in Cowork, update it from the Plugins UI. (Third-party marketplaces don't auto-update by default.)
2. **Migrate your running system:** say **"update my job hunt"**. The `job-hunt-update` skill refreshes your dashboard, rebuilds the Daily Menu, adds anything missing, and re-syncs your 5 helpers to the new behaviour — **without touching your CV, applications, saved suggestions, or history.**

Brand-new users skip this and just run setup.

## Daily use
Once a day Coach sends **one short summary**, and everything you need to do sits in the **To-Do list** on the dashboard's **Today** tab. Open the **Daily Menu** any time to start a helper early — tap **▶ Run now** on its card (or just type e.g. "run Scout"). You act by simply replying in chat:
- **"show shortlist"** to see today's roles, then the **numbers you want** (or **"not interested in N"**).
- **"accept all"** / **"accept #"** / **"reject #"** for Polish's profile suggestions.
- **"go"** to let Sync fill and save a job-site profile once you're logged in.
- **"what's new?"** any time — it reads your To-Do list and tells you the current items right then.

You upload the CV and press **Submit / Save** — the agents never do that for you.

## Words you can type (just say them to Claude in chat)
You don't need to remember commands — plain language works. But these shortcuts are handy:

| Type this | What it does |
|---|---|
| **menu** | Opens your **Daily Menu** — every helper with a ▶ Run now button. |
| **what's new?** | Reads your To-Do list and tells you what's waiting for you right now. |
| **show shortlist** | Shows today's job matches from Scout. |
| **run Scout** (or run Polish / Radar / Coach / Sync) | Starts that helper right away instead of waiting for its scheduled time. |
| **accept all** / **accept 3** / **reject 3** | Applies (or drops) Polish's CV wording suggestions. |
| **go** | Tells Sync to fill and save your job-site profiles (after you're logged in). |
| **not interested in 2** | Removes role #2 from today's shortlist so it won't come back. |
| **re-run** | Re-runs today's search if a job site failed earlier. |

Where to type them: just in the chat with Claude — the same place you set everything up. You can also tap the buttons in the panels instead of typing: **✓ Apply / ✕ Not interested** and **✓ Accept / ✕ Reject** in the **Daily To-Do**, and **▶ Run now** in the **Daily Menu**.

## Privacy & safety
Everything lives in your own workspace folder. Keep passwords out of it. The agents are read-only on your inbox, never create accounts or log in, and never apply, send, or spend without you.
