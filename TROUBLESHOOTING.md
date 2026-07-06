# Troubleshooting & Reset

**A board came back empty / "not logged in".** Sign into that site in the connected Chrome, then reply **"re-run"** — Scout will finish the search the same day.

**Indeed shows a Cloudflare / "verify you are human" check.** Open `indeed.com` (your local domain) once manually in the same Chrome profile, pass the check, then reply **"re-run indeed"**. The agents never solve CAPTCHAs for you.

**A scheduled agent didn't run.** Scheduled tasks only run while the **desktop app is open**. If it was closed at the scheduled time, the task runs on next launch — just open the app.

**It keeps pausing for browser permission.** Click **Run now** once on each scheduled task (in the Scheduled panel) to pre-approve the browser/tools it needs.

**Runs feel slow or costly.** Switch the Scout task to a lighter model in the Scheduled panel. (Use a stronger model only if you want sharper fit-scoring.)

**Start over / reset.** Empty the `Agent-System/Queues/data-*.js` files (or delete the workspace folder) and re-run the `job-hunt-setup` skill; disable or delete the 5 tasks in the Scheduled panel first so nothing runs against stale data.

**Update to a newer version.** Run `/plugin marketplace update` (or reinstall). Your profile, config, and data stay untouched — only the flow logic updates.
