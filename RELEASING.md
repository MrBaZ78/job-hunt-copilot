# Releasing a new version

When you change anything in your live flow (an agent prompt, the dashboard, a new agent, the intake, etc.) and want to share it, you re-package the plugin and push a new version to GitHub. Keep it simple:

## The easy way (let Claude do it)
In Cowork, just say: **"package a new version of the job-hunt plugin as v1.1"** (or v2.0). Claude will:
1. Re-generate the generic plugin from your current live system (agent prompts, dashboard, templates) — stripped of your personal data.
2. Bump the `version` in `plugins/job-hunt-copilot/.claude-plugin/plugin.json`.
3. Add a dated entry to `CHANGELOG.md` describing what changed.
4. Re-zip the repo for upload.

Then you push and tag it (below).

## Which number to bump
- Tiny fix or wording → **patch** (1.0.0 → 1.0.1)
- New backward-compatible feature (new panel, new question) → **minor** (1.0.0 → 1.1.0)
- New agent, changed file layout, or anything that changes how setup works → **major** (1.0.0 → 2.0.0)

## Push it to GitHub
From the repo folder on your machine:
```
git add -A
git commit -m "v1.1.0 — <short summary of the change>"
git tag v1.1.0
git push
git push --tags
```
Optionally create a **Release** on GitHub from the `v1.1.0` tag and paste that version's changelog entry.

## What your friend does to update
Nothing manual — next time they run `/plugin marketplace update` (or reinstall), they pick up your latest version. Their own profile, config, and data stay untouched; only the flow logic updates.

## Rule of thumb
One change set = one version bump = one changelog entry = one git tag. That keeps v1 → v1.1 → v2.0 clean and traceable.
