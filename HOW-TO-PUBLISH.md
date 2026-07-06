# How to publish to GitHub & how anyone installs

> ✅ Already personalised for **MrBaZ78** — repo `MrBaZ78/job-hunt-copilot`. Nothing to edit; just publish.

## PART A — Put it on GitHub

### Option 1 — Website only (easiest, no commands)
1. Go to **github.com** and sign in (create a free account if needed).
2. Click the **+** (top-right) → **New repository**.
3. **Repository name:** e.g. `job-hunt-copilot`. Set it **Public**. Do NOT tick "Add a README" or a license (we already have them). Click **Create repository**.
4. On the new empty repo page, click the link **"uploading an existing file"**.
5. Open your `Job-Hunt-Copilot-Repo` folder, select **everything inside it** (the `.claude-plugin` folder, the `plugins` folder, `README.md`, `LICENSE`, etc. — not the outer folder itself), and **drag it into the browser** upload area.
6. At the bottom type a message like `v1.0.1` and click **Commit changes**.
7. Done — your plugin is live at `github.com/MrBaZ78/job-hunt-copilot`.

### Option 2 — Git commands (if you use a terminal)
In the `Job-Hunt-Copilot-Repo` folder:
```
git init
git add -A
git commit -m "v1.0.1 — Job-Hunt Copilot"
git branch -M main
git remote add origin https://github.com/MrBaZ78/job-hunt-copilot.git
git push -u origin main
git tag v1.0.1
git push --tags
```

---

## PART B — How anyone installs it

**They need first:** a Claude plan with **Cowork** access, the **Claude desktop app** open, **Claude in Chrome** signed into their job boards + email, and a **folder** to use as their workspace.

**Then, in Cowork / Claude chat:**
```
/plugin marketplace add MrBaZ78/job-hunt-copilot
/plugin install job-hunt-copilot@job-hunt-copilot-marketplace
```
Then they connect a folder and say: **"set up my job search"** — and answer the short intake. The setup builds their profile and creates all 5 agents automatically.

**Fallback (if plugin install isn't available in their Cowork version):** send them the `job-hunt-setup.skill` file — they click **Save skill**, then say "set up my job search". Same result.

---

## Updating later
Change something → say "package v1.1" in Cowork → then re-upload (Website: drag the changed files again; or Git: `git commit` + `git tag v1.1.0` + `git push`). Your friend runs `/plugin marketplace update` to get it. Their data stays untouched.
