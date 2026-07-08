# Job-Hunt Copilot (Cowork plugin)

A self-driving job-search assistant for **Claude Cowork**. Run one setup skill and it interviews you, builds your Master Career Profile from your CV, picks the right job boards for your country, and schedules a **5-agent team** feeding a **live dashboard**:

- **Scout** — finds open, well-fit roles each morning; builds tailored CVs and pre-fills applications on your picks.
- **Polish** — benchmarks your profile vs live job ads and proposes honest improvements (you accept/reject).
- **Radar** — read-only inbox + LinkedIn watch for replies / interviews / offers; moves your funnel.
- **Coach** — grades each agent daily, tracks the funnel toward a North Star (interviews), verifies the handoffs.
- **Sync** — keeps your live job-site profiles matched to your Master Profile; helps set up new boards.

Everything the team needs from you lands in **one To-Do list** at the top of the dashboard, with **one plain daily summary** from Coach — so you act from a single place instead of chasing five agents. The dashboard has **4 tabs**: **Today** (the To-Do list — the only tab you must check), **Progress**, **My Profile**, **The Team**. There's also a **Daily Menu**: a little panel with one card per helper and a **▶ Run now** button, so you can start any of them early with a tap. Written in plain, everyday English throughout.

Fully generic — **any profession, any country.** You always stay in control: it **never submits an application, sends a message, spends money, creates an account, or logs in for you.** Every CV line must be true and defensible.

---

## Requirements to run
1. **Claude plan with Cowork access** (Cowork is a research preview — this is the main gate).
2. **Claude desktop app**, kept open — scheduled agents only run while the app is running.
3. **Claude in Chrome** extension, connected and **signed into your job boards + email** (Scout/Radar/Sync drive a logged-in browser).
4. A **folder on your computer** connected as the workspace (everything is written there).
5. Optional: set the Scout agent to a stronger model (e.g. a top-tier model) for sharper fit-scoring.

## What you'll be asked (once, during setup)
Your CV (upload), name + contact email, target role(s) & seniority, location(s) + remote?, industries to prefer/avoid, hard knockouts (visa/salary/onsite), which boards you use, CV language(s), and your preferred morning start hour. Takes a few minutes.

## Install
1. Add this plugin to Cowork (Settings → Capabilities / Plugins → install the plugin, or install from a marketplace if your friend shared one).
2. Connect a folder as your workspace.
3. In chat, say: **"set up my job search"** (or run the `job-hunt-setup` skill).
4. Answer the intake. The setup then builds your profile, writes the dashboard, and **creates the 5 scheduled agents automatically.**
5. Click **Run now** on each new scheduled task once, so it can pre-approve browser access.
6. Open `Agent-System/progress-dashboard.html` to watch progress.

## Daily use
Once a day Coach sends **one short summary**, and everything you need to do sits in the **To-Do list** on the dashboard's **Today** tab. Open the **Daily Menu** any time to start a helper early — tap **▶ Run now** on its card (or just type e.g. "run Scout"). You act by simply replying in chat:
- **"show shortlist"** to see today's roles, then the **numbers you want** (or **"not interested in N"**).
- **"accept all"** / **"accept #"** / **"reject #"** for Polish's profile suggestions.
- **"go"** to let Sync fill and save a job-site profile once you're logged in.
- **"what's new?"** any time — it reads your To-Do list and tells you the current items right then.

You upload the CV and press **Submit / Save** — the agents never do that for you.

## Privacy & safety
Everything lives in your own workspace folder. Keep passwords out of it. The agents are read-only on your inbox, never create accounts or log in, and never apply, send, or spend without you.
