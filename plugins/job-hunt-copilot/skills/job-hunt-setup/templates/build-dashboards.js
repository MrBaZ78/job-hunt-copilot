#!/usr/bin/env node
/* Rebuilds the two PINNED artifacts from the live queue files:
     • dashboard-pinned.html  — the 4-tab dashboard with all 10 queues inlined (self-contained)
     • daily-todo.html        — the interactive Daily To-Do panel (jobs + CV upgrades + asks)
   This file is the single source of truth for the Daily To-Do panel's look + logic.

   Run:  node build-dashboards.js            (reads ./Queues)
         node build-dashboards.js --src DIR  (reads DIR instead — used when the
                                              OneDrive mount truncates a freshly-written
                                              queue file and the agent staged clean copies)
   After it writes the HTML, the caller (the daily-refresh scheduled task) updates the
   live artifacts with update_artifact for ids "dashboard" and "daily-todo".            */

const fs = require("fs");
const path = require("path");

const base = __dirname;
const srcIx = process.argv.indexOf("--src");
const qdir = srcIx > -1 ? process.argv[srcIx + 1] : path.join(base, "Queues");

const FILES = ["data-applied.js","data-shortlist.js","data-searchlog.js","data-health.js",
  "data-stats.js","data-suggestions.js","data-sync.js","data-charter.js",
  "data-agents.js","data-todo.js"];

/* ---- read + truncation guard ---- */
const raw = {};
const truncated = [];
for (const f of FILES) {
  const c = fs.readFileSync(path.join(qdir, f), "utf8");
  if (!c.trimEnd().endsWith("};")) truncated.push(f);
  raw[f] = c;
}
if (truncated.length) {
  console.error("TRUNCATED queue files (OneDrive half-sync): " + truncated.join(", "));
  console.error("Stage clean copies (Read tool -> a folder) and re-run with --src that folder.");
  process.exit(1);
}

/* ---- evaluate the queues to get the data objects ---- */
const window = {};
for (const f of FILES) { new Function("window", raw[f])(window); }

/* =================== 1) DASHBOARD (inline all queues) =================== */
let dash = fs.readFileSync(path.join(base, "progress-dashboard.html"), "utf8");
if (!dash.trimEnd().endsWith("</html>")) { console.error("dashboard template truncated"); process.exit(1); }
for (const f of FILES) {
  const tag = `<script src="Queues/${f}"></script>`;
  if (!dash.includes(tag)) { console.error("missing tag " + f); process.exit(1); }
  dash = dash.replace(tag, `<script>\n/* inlined ${f} */\n${raw[f]}\n</script>`);
}
dash = dash.replace("setTimeout(function(){ location.reload(); }, 300000);",
  "/* auto-reload removed for pinned artifact; use the Reload button */");
fs.writeFileSync(path.join(base, "dashboard-pinned.html"), dash);

/* =================== 2) DAILY TO-DO panel =================== */
const SH = window.Q_SHORTLIST || {};
const SG = window.Q_SUGGESTIONS || {};
const SY = window.Q_SYNC || {};
const TD = window.Q_TODO || {};
const DATE = SH.date || SG.updated || new Date().toISOString().slice(0, 10);

const JOBS = (SH.roles || []).map(r => ({
  n: r.n, company: r.company, title: r.title, fit: r.fit,
  loc: r.location || "", ds: r.jobSummary || "", link: r.link || "#"
}));

const pend = (SG.items || []).filter(i => (i.status || "pending") === "pending");
const SUGG = pend.filter(i => i.type !== "question")
  .sort((a, b) => (a.priority === "High" ? 0 : 1) - (b.priority === "High" ? 0 : 1))
  .map(i => ({ id: i.id, pr: i.priority, t: i.title }));
const qCount = pend.filter(i => i.type === "question").length;
const sitesBehind = (SY.sites || []).filter(s => !/in sync|up to date/i.test(s.status || "")).map(s => s.name);

const ASKS = [];
if (qCount) ASKS.push({ key: "questions", ic: "❓",
  nm: qCount + " quick yes/no question" + (qCount > 1 ? "s" : "") + " from Polish",
  ds: "Answering these opens up more matching jobs. I'll read them out and you answer yes/no.",
  label: "Answer them", cmd: "let's answer the open profile questions" });
if (sitesBehind.length) ASKS.push({ key: "sync", ic: "🔗",
  nm: sitesBehind.length + " job-site profile" + (sitesBehind.length > 1 ? "s" : "") + " behind your latest CV",
  ds: sitesBehind.join(", ") + ". Log into each first, then I'll fill and save them for you.",
  label: "Help me sync", cmd: "help me sync my job-site profiles" });
// carry any Chief-of-Staff one-off todo items (e.g. a pending repo/admin chore)
(TD.items || []).filter(i => /chief of staff/i.test(i.who || "")).forEach(i =>
  ASKS.push({ key: "todo" + i.id, ic: "🛠️", nm: (i.title || "").split("—")[0].split(".")[0].slice(0, 90),
    ds: i.title || "", label: "Do it", cmd: i.reply || "" }));

const DATA = `const DATE = ${JSON.stringify(DATE)};
const JOBS = ${JSON.stringify(JOBS, null, 2)};
const SUGGESTIONS = ${JSON.stringify(SUGG, null, 2)};
const ASKS = ${JSON.stringify(ASKS, null, 2)};`;

fs.writeFileSync(path.join(base, "daily-todo.html"), PANEL(DATA));
console.log(`Built: dashboard-pinned.html + daily-todo.html  (${JOBS.length} jobs, ${SUGG.length} upgrades, ${ASKS.length} asks, date ${DATE})`);

/* ---- panel template (styles + render logic fixed; DATA injected) ---- */
function PANEL(DATA_BLOCK) {
return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Your Daily To-Do — take action</title>
<style>
  :root{ color-scheme: light;
    --navy:#1f2a44; --grey:#5b6472; --line:#e6e8ee; --bg:#f5f6f8; --card:#ffffff;
    --green:#1f9d55; --blue:#2b6cb0; --red:#c0392b; --chip:#eef1f6; }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--navy);line-height:1.45;
    font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
  .wrap{max-width:780px;margin:0 auto;padding:22px 18px 44px}
  h1{font-size:21px;margin:0 0 3px}
  .sub{color:var(--grey);font-size:13.5px;margin:0 0 20px}
  h2{font-size:14px;text-transform:uppercase;letter-spacing:.04em;color:var(--grey);
    margin:22px 0 9px;font-weight:800}
  .card{background:var(--card);border:1px solid var(--line);border-radius:14px;
    padding:14px 16px;margin-bottom:11px}
  .row{display:flex;gap:13px;align-items:flex-start}
  .ic{font-size:22px;line-height:1;flex:none;width:28px;text-align:center;margin-top:1px}
  .mid{flex:1;min-width:0}
  .nm{font-weight:800;font-size:15px}
  .ds{font-size:13.5px;margin-top:3px;color:#333}
  .meta{font-size:12px;color:var(--grey);margin-top:6px}
  .fit{display:inline-block;font-weight:800;font-size:12px;background:var(--chip);
    color:var(--navy);border-radius:20px;padding:2px 9px;margin-left:6px}
  .link{color:var(--blue);text-decoration:none;font-size:12.5px;font-weight:700}
  .link:hover{text-decoration:underline}
  .acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:11px}
  .btn{border:none;cursor:pointer;font:inherit;font-weight:700;font-size:13px;
    border-radius:9px;padding:8px 14px;white-space:nowrap;transition:opacity .15s,background .15s}
  .btn:disabled{opacity:.55;cursor:default}
  .b-yes{background:var(--green);color:#fff}
  .b-no{background:#fff;color:var(--red);border:1.5px solid var(--red)}
  .b-go{background:var(--blue);color:#fff}
  .b-all{background:var(--navy);color:#fff}
  .badge{display:inline-block;font-weight:800;font-size:12px;border-radius:8px;
    padding:6px 12px;margin-top:11px}
  .badge.yes{background:#e6f5ec;color:var(--green)}
  .badge.no{background:#fdecea;color:var(--red)}
  .badge.go{background:#e8f0f9;color:var(--blue)}
  .note{font-size:12.5px;color:var(--grey);margin:4px 0 0}
  .chief{background:linear-gradient(135deg,#12324f,#1f6f5c);color:#fff;border-radius:14px;
    padding:14px 16px;margin-top:20px;font-size:13.5px}
  .chief b{color:#ffd67a}
  .hint{font-size:12.5px;color:var(--grey);margin-top:14px;text-align:center}
  .toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);background:var(--navy);
    color:#fff;font-size:13px;font-weight:600;padding:10px 16px;border-radius:10px;opacity:0;
    transition:opacity .2s;pointer-events:none;max-width:90%;text-align:center}
  .toast.show{opacity:.97}
  .empty{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px;font-size:13.5px}
</style>
</head>
<body>
<div class="wrap">
  <h1>Your Daily To-Do</h1>
  <p class="sub" id="sub">Tap a button and I'll do the rest in chat — nothing is sent to any job site, I just update your files.</p>
  <div id="root"></div>
  <div class="chief">
    🧭 <b>Chief of Staff</b> (that's me) — every tap here just sends me the same words you'd type.
    Prefer typing? You still can: "apply to 1", "not interested in 2", "accept all", "reject 36".
  </div>
  <p class="hint">Your choices are remembered here even if you close it. This never applies to a job or logs in for you.</p>
</div>
<div class="toast" id="toast"></div>
<script>
${DATA_BLOCK}

const LS = "dailytodo:"+DATE;
function load(){ try{ return JSON.parse(localStorage.getItem(LS)||"{}"); }catch(e){ return {}; } }
function save(s){ try{ localStorage.setItem(LS, JSON.stringify(s)); }catch(e){} }
let STATE = load();
document.getElementById("sub").insertAdjacentHTML("beforeend",
  ' &nbsp;·&nbsp; ' + new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"}));

function sendToChat(cmd){
  const fns=[window.sendPrompt, window.cowork&&window.cowork.sendPrompt,
             window.parent&&window.parent.sendPrompt, window.top&&window.top.sendPrompt];
  for(const fn of fns){ if(typeof fn==="function"){ try{ fn(cmd); return "sent"; }catch(e){} } }
  try{ navigator.clipboard&&navigator.clipboard.writeText(cmd); }catch(e){}
  return "copied";
}
function toast(m){ const t=document.getElementById("toast"); t.textContent=m; t.classList.add("show");
  clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove("show"),2600); }
function act(cmd,msg){ const how=sendToChat(cmd);
  toast(how==="sent" ? msg+" — done, check chat." : msg+' — copied. Paste to me in chat: "'+cmd+'"'); }

const root=document.getElementById("root");
function section(t){ const h=document.createElement("h2"); h.textContent=t; root.appendChild(h); }
function mk(cls,label){ const b=document.createElement("button"); b.className="btn "+cls; b.textContent=label; return b; }
function paint(val,yes,no,acts){ yes.disabled=true; no.disabled=true;
  let b=acts.querySelector(".badge"); if(!b){ b=document.createElement("span"); acts.appendChild(b); }
  if(val==="yes"){ b.className="badge yes"; b.textContent="✓ You chose to accept / apply"; }
  else{ b.className="badge no"; b.textContent="✕ Passed"; } }
function choose(key,val,yes,no,acts,cmd,msg){ STATE[key]=val; save(STATE); act(cmd,msg); paint(val,yes,no,acts); }

if(JOBS.length){
  section("① New jobs to review");
  JOBS.forEach(j=>{
    const skey="job:"+j.n, chosen=STATE[skey];
    const el=document.createElement("div"); el.className="card";
    el.innerHTML='<div class="row"><div class="ic">🔎</div><div class="mid">'+
      '<div class="nm">'+j.company+' <span class="fit">'+j.fit+'% fit</span></div>'+
      '<div class="ds"><b>'+j.title+'</b> — '+j.ds+'</div>'+
      '<div class="meta">'+(j.loc?j.loc+' &nbsp;·&nbsp; ':'')+'<a class="link" href="'+j.link+'" target="_blank" rel="noopener">Open the listing ↗</a></div>'+
      '</div></div>';
    const mid=el.querySelector(".mid"), acts=document.createElement("div"); acts.className="acts";
    const yes=mk("b-yes","✓ Apply"), no=mk("b-no","✕ Not interested");
    yes.onclick=()=>choose(skey,"yes",yes,no,acts,"apply to "+j.n,"Marked to apply to "+j.company);
    no.onclick =()=>choose(skey,"no", yes,no,acts,"not interested in "+j.n,"Passed on "+j.company);
    acts.appendChild(yes); acts.appendChild(no); mid.appendChild(acts);
    if(chosen) paint(chosen,yes,no,acts); root.appendChild(el);
  });
}
if(SUGGESTIONS.length){
  section("② CV wording upgrades (Polish) — all honest keywords");
  const allCard=document.createElement("div"); allCard.className="card";
  allCard.innerHTML='<div class="row"><div class="ic">✍️</div><div class="mid">'+
    '<div class="nm">'+SUGGESTIONS.length+' upgrades ready</div>'+
    '<div class="note">Accept the lot in one tap, or decide each below.</div></div></div>';
  const allActs=document.createElement("div"); allActs.className="acts";
  const allBtn=mk("b-all","✓ Accept all");
  allBtn.onclick=()=>{ act("accept all","Accepting all wording upgrades");
    SUGGESTIONS.forEach(s=>{ STATE["sug:"+s.id]="yes"; }); save(STATE);
    document.querySelectorAll("[data-sug]").forEach(c=>paint("yes",c._yes,c._no,c._acts));
    allBtn.disabled=true; allBtn.textContent="✓ All accepted"; };
  allActs.appendChild(allBtn); allCard.querySelector(".mid").appendChild(allActs); root.appendChild(allCard);
  SUGGESTIONS.forEach(s=>{
    const skey="sug:"+s.id, chosen=STATE[skey];
    const el=document.createElement("div"); el.className="card"; el.setAttribute("data-sug",s.id);
    el.innerHTML='<div class="row"><div class="ic">·</div><div class="mid">'+
      '<div class="ds"><b>'+s.pr+'</b> — '+s.t+'</div></div></div>';
    const mid=el.querySelector(".mid"), acts=document.createElement("div"); acts.className="acts";
    const yes=mk("b-yes","✓ Accept"), no=mk("b-no","✕ Reject");
    yes.onclick=()=>choose(skey,"yes",yes,no,acts,"accept "+s.id,"Accepted");
    no.onclick =()=>choose(skey,"no", yes,no,acts,"reject "+s.id,"Rejected");
    acts.appendChild(yes); acts.appendChild(no); mid.appendChild(acts);
    el._yes=yes; el._no=no; el._acts=acts;
    if(chosen) paint(chosen,yes,no,acts); root.appendChild(el);
  });
}
if(ASKS.length){
  section("③ Other quick asks");
  ASKS.forEach(a=>{
    const skey="ask:"+a.key, chosen=STATE[skey];
    const el=document.createElement("div"); el.className="card";
    el.innerHTML='<div class="row"><div class="ic">'+a.ic+'</div><div class="mid">'+
      '<div class="nm">'+a.nm+'</div><div class="ds">'+a.ds+'</div></div></div>';
    const mid=el.querySelector(".mid"), acts=document.createElement("div"); acts.className="acts";
    const go=mk("b-go",a.label);
    go.onclick=()=>{ STATE[skey]="go"; save(STATE); act(a.cmd,a.label);
      go.disabled=true; acts.querySelector(".badge")||acts.insertAdjacentHTML("beforeend",'<span class="badge go">Sent ✓</span>'); };
    acts.appendChild(go); mid.appendChild(acts);
    if(chosen){ go.disabled=true; acts.insertAdjacentHTML("beforeend",'<span class="badge go">Sent ✓</span>'); }
    root.appendChild(el);
  });
}
if(!JOBS.length && !SUGGESTIONS.length && !ASKS.length){
  root.innerHTML='<div class="empty"><b>You\\'re all caught up 🎉</b><br>New jobs and upgrades will appear here each morning.</div>';
}
</script>
</body>
</html>`;
}
