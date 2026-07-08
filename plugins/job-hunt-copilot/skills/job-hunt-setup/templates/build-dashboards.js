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
  loc: r.location || "", ds: r.jobSummary || "", cs: r.companySummary || "", link: r.link || "#"
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
    --green:#1f9d55; --blue:#2b6cb0; --red:#c0392b; --chip:#eef1f6; --amber:#b7791f; }
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--navy);line-height:1.45;
    font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif}
  .wrap{max-width:780px;margin:0 auto;padding:22px 18px 110px}
  h1{font-size:21px;margin:0 0 3px}
  .sub{color:var(--grey);font-size:13.5px;margin:0 0 14px}
  .how{background:#eef4fb;border:1px solid #d3e2f4;border-radius:12px;padding:11px 14px;
    font-size:13px;color:var(--navy);margin:0 0 18px}
  .how b{color:var(--blue)}
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
  .acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:11px;align-items:center}
  .btn{border:none;cursor:pointer;font:inherit;font-weight:700;font-size:13px;
    border-radius:9px;padding:8px 14px;white-space:nowrap;transition:opacity .15s,background .15s}
  .btn:disabled{opacity:.55;cursor:default}
  .b-yes{background:var(--green);color:#fff}
  .b-no{background:#fff;color:var(--red);border:1.5px solid var(--red)}
  .b-go{background:var(--blue);color:#fff}
  .b-all{background:var(--navy);color:#fff}
  .badge{display:inline-block;font-weight:800;font-size:12px;border-radius:8px;padding:6px 10px}
  .badge.yes{background:#e6f5ec;color:var(--green)}
  .badge.no{background:#fdecea;color:var(--red)}
  .badge.go{background:#e8f0f9;color:var(--blue)}
  .undo{background:none;border:none;color:var(--grey);font:inherit;font-size:12px;
    text-decoration:underline;cursor:pointer;padding:4px}
  .note{font-size:12.5px;color:var(--grey);margin:4px 0 0}
  .empty{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px;font-size:13.5px}
  .toast{position:fixed;left:50%;bottom:86px;transform:translateX(-50%);background:var(--navy);
    color:#fff;font-size:13px;font-weight:600;padding:11px 16px;border-radius:10px;opacity:0;
    transition:opacity .2s;pointer-events:none;max-width:92%;text-align:center;z-index:60}
  .toast.show{opacity:.98}
  .outbox{position:fixed;left:0;right:0;bottom:0;background:#12324f;color:#fff;display:none;
    align-items:center;justify-content:space-between;gap:12px;padding:12px 18px;
    box-shadow:0 -2px 14px rgba(0,0,0,.22);z-index:50}
  .outbox.show{display:flex}
  .outbox .oc{font-weight:800;font-size:14px}
  .outbox .os{font-size:11.5px;color:#cfe0f5;margin-top:1px}
  .outbox .sendbtn{background:#ffd67a;color:#12324f;border:none;border-radius:10px;
    padding:11px 16px;font:inherit;font-weight:800;font-size:14px;cursor:pointer;white-space:nowrap}
</style>
</head>
<body>
<div class="wrap">
  <h1>Your Daily To-Do</h1>
  <p class="sub" id="sub">Pick what you want, then send it to me in one go.</p>
  <div class="how">
    <b>How this works:</b> tap your choices below (Apply / Accept / Reject). When you're done, hit
    <b>📋 Send my picks</b> at the bottom — it drops one message into the chat for you to send, and I do them all.
    Buttons can't act on their own yet, so that one send is what makes it happen. Nothing is ever submitted or logged in for you.
  </div>
  <div id="root"></div>
</div>
<div class="toast" id="toast"></div>
<div class="outbox" id="outbox">
  <div><div class="oc" id="obcount">0 picks ready</div><div class="os">Sends one message to the chat — you press enter.</div></div>
  <button class="sendbtn" id="obsend">📋 Send my picks</button>
</div>
<script>
${DATA_BLOCK}

const LS = "dailytodo:"+DATE;
function load(){ try{ return JSON.parse(localStorage.getItem(LS)||"{}"); }catch(e){ return {}; } }
function save(s){ try{ localStorage.setItem(LS, JSON.stringify(s)); }catch(e){} }
let STATE = load();
document.getElementById("sub").insertAdjacentHTML("beforeend",
  ' &nbsp;·&nbsp; ' + new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"}));

/* registries so we can turn saved picks into one instruction */
const JOBMAP={}; JOBS.forEach(j=>{ JOBMAP["job:"+j.n]=j; });
const ASKMAP={}; ASKS.forEach(a=>{ ASKMAP["ask:"+a.key]=a; });

function toast(html, ms){ const t=document.getElementById("toast"); t.innerHTML=html; t.classList.add("show");
  clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove("show"), ms||3200); }
function mk(cls,label){ const b=document.createElement("button"); b.className="btn "+cls; b.textContent=label; return b; }
function section(t){ const h=document.createElement("h2"); h.textContent=t; const root=document.getElementById("root"); root.appendChild(h); }

/* build ONE plain instruction from every saved pick */
function buildInstruction(){
  const applyJ=[],passJ=[],accS=[],rejS=[],askC=[];
  Object.keys(STATE).forEach(function(k){
    const v=STATE[k];
    if(k.indexOf("job:")===0){ (v==="yes"?applyJ:passJ).push(k.slice(4)); }
    else if(k.indexOf("sug:")===0){ (v==="yes"?accS:rejS).push(k.slice(4)); }
    else if(k.indexOf("ask:")===0 && v==="go"){ const a=ASKMAP[k]; if(a && a.cmd) askC.push(a.cmd); }
  });
  const parts=[];
  if(applyJ.length) parts.push("apply to job"+(applyJ.length>1?"s":"")+" "+applyJ.join(", "));
  if(passJ.length)  parts.push("not interested in job"+(passJ.length>1?"s":"")+" "+passJ.join(", "));
  if(accS.length)   parts.push("accept CV upgrade"+(accS.length>1?"s":"")+" "+accS.join(", "));
  if(rejS.length)   parts.push("reject CV upgrade"+(rejS.length>1?"s":"")+" "+rejS.join(", "));
  askC.forEach(function(c){ parts.push(c); });
  const count=applyJ.length+passJ.length+accS.length+rejS.length+askC.length;
  return { count: count, text: parts.length ? ("From my Daily To-Do, please: "+parts.join("; ")+".") : "" };
}
function renderOutbox(){
  const bar=document.getElementById("outbox"); const r=buildInstruction();
  if(!r.count){ bar.classList.remove("show"); return; }
  bar.classList.add("show");
  document.getElementById("obcount").textContent = r.count+" pick"+(r.count>1?"s":"")+" ready to send";
}
function trySend(text){
  const fns=[window.sendPrompt, window.cowork&&window.cowork.sendPrompt,
             window.parent&&window.parent.sendPrompt, window.top&&window.top.sendPrompt];
  for(var i=0;i<fns.length;i++){ if(typeof fns[i]==="function"){ try{ fns[i](text); return true; }catch(e){} } }
  return false;
}
function sendAll(){
  const r=buildInstruction(); if(!r.count) return;
  const sent=trySend(r.text);
  try{ if(navigator.clipboard) navigator.clipboard.writeText(r.text); }catch(e){}
  if(sent) toast("Sent "+r.count+" to chat ✓ — I'm on it.", 4000);
  else toast("📋 Copied. Now click the chat box, press <b>Ctrl/Cmd&nbsp;+&nbsp;V</b> and hit enter — I'll do all "+r.count+".", 7000);
}
document.getElementById("obsend").onclick = sendAll;

function pick(el, key, val){
  STATE[key]=val; save(STATE); paintCard(el, val); renderOutbox();
}
function paintCard(el, val){
  const acts=el._acts; el._yes.disabled=true; el._no.disabled=true;
  let tag=acts.querySelector(".badge");
  if(!tag){ tag=document.createElement("span"); acts.insertBefore(tag, acts.firstChild); }
  tag.className="badge "+(val==="yes"?"yes":"no");
  tag.textContent = el._kind==="job" ? (val==="yes"?"✓ Apply — queued":"✕ Passed — queued")
                                     : (val==="yes"?"✓ Accept — queued":"✕ Reject — queued");
  let undo=acts.querySelector(".undo");
  if(!undo){ undo=document.createElement("button"); undo.className="undo"; undo.textContent="undo";
    undo.onclick=function(){ delete STATE[el._key]; save(STATE);
      el._yes.disabled=false; el._no.disabled=false;
      if(tag) tag.remove(); undo.remove(); renderOutbox(); };
    acts.appendChild(undo); }
}

const root=document.getElementById("root");

if(JOBS.length){
  section("① New jobs to review");
  JOBS.forEach(function(j){
    const skey="job:"+j.n, chosen=STATE[skey];
    const el=document.createElement("div"); el.className="card";
    el.innerHTML='<div class="row"><div class="ic">🔎</div><div class="mid">'+
      '<div class="nm">'+j.company+' <span class="fit">'+j.fit+'% fit</span></div>'+
      '<div class="ds"><b>'+j.title+'</b> — '+j.ds+'</div>'+
      (j.cs?'<div class="ds" style="margin-top:6px"><b>About '+j.company+':</b> '+j.cs+'</div>':'')+
      '<div class="meta">'+(j.loc?j.loc+' &nbsp;·&nbsp; ':'')+'<a class="link" href="'+j.link+'" target="_blank" rel="noopener">Open the listing ↗</a></div>'+
      '</div></div>';
    const mid=el.querySelector(".mid"), acts=document.createElement("div"); acts.className="acts";
    const yes=mk("b-yes","✓ Apply"), no=mk("b-no","✕ Not interested");
    el._kind="job"; el._key=skey; el._yes=yes; el._no=no; el._acts=acts;
    yes.onclick=function(){ pick(el,skey,"yes"); };
    no.onclick =function(){ pick(el,skey,"no"); };
    acts.appendChild(yes); acts.appendChild(no); mid.appendChild(acts);
    if(chosen) paintCard(el,chosen);
    root.appendChild(el);
  });
}

if(SUGGESTIONS.length){
  section("② CV wording upgrades (Polish) — all honest keywords");
  const allCard=document.createElement("div"); allCard.className="card";
  allCard.innerHTML='<div class="row"><div class="ic">✍️</div><div class="mid">'+
    '<div class="nm">'+SUGGESTIONS.length+' upgrades ready</div>'+
    '<div class="note">Queue them all in one tap, or decide each below.</div></div></div>';
  const allActs=document.createElement("div"); allActs.className="acts";
  const allBtn=mk("b-all","✓ Accept all");
  allBtn.onclick=function(){
    document.querySelectorAll("[data-sug]").forEach(function(c){ STATE["sug:"+c.getAttribute("data-sug")]="yes"; paintCard(c,"yes"); });
    save(STATE); renderOutbox(); allBtn.disabled=true; allBtn.textContent="✓ All queued"; };
  allActs.appendChild(allBtn); allCard.querySelector(".mid").appendChild(allActs); root.appendChild(allCard);
  SUGGESTIONS.forEach(function(s){
    const skey="sug:"+s.id, chosen=STATE[skey];
    const el=document.createElement("div"); el.className="card"; el.setAttribute("data-sug",s.id);
    el.innerHTML='<div class="row"><div class="ic">·</div><div class="mid">'+
      '<div class="ds"><b>'+s.pr+'</b> — '+s.t+'</div></div></div>';
    const mid=el.querySelector(".mid"), acts=document.createElement("div"); acts.className="acts";
    const yes=mk("b-yes","✓ Accept"), no=mk("b-no","✕ Reject");
    el._kind="sug"; el._key=skey; el._yes=yes; el._no=no; el._acts=acts;
    yes.onclick=function(){ pick(el,skey,"yes"); };
    no.onclick =function(){ pick(el,skey,"no"); };
    acts.appendChild(yes); acts.appendChild(no); mid.appendChild(acts);
    if(chosen) paintCard(el,chosen);
    root.appendChild(el);
  });
}

if(ASKS.length){
  section("③ Other quick asks");
  ASKS.forEach(function(a){
    const skey="ask:"+a.key, chosen=STATE[skey];
    const el=document.createElement("div"); el.className="card";
    el.innerHTML='<div class="row"><div class="ic">'+a.ic+'</div><div class="mid">'+
      '<div class="nm">'+a.nm+'</div><div class="ds">'+a.ds+'</div></div></div>';
    const mid=el.querySelector(".mid"), acts=document.createElement("div"); acts.className="acts";
    const go=mk("b-go",a.label);
    function mark(){ go.disabled=true; if(!acts.querySelector(".badge")) acts.insertAdjacentHTML("afterbegin",'<span class="badge go">queued</span>');
      if(!acts.querySelector(".undo")){ const u=document.createElement("button"); u.className="undo"; u.textContent="undo";
        u.onclick=function(){ delete STATE[skey]; save(STATE); go.disabled=false; const b=acts.querySelector(".badge"); if(b)b.remove(); u.remove(); renderOutbox(); };
        acts.appendChild(u); } }
    go.onclick=function(){ STATE[skey]="go"; save(STATE); mark(); renderOutbox(); };
    acts.appendChild(go); mid.appendChild(acts);
    if(chosen) mark();
    root.appendChild(el);
  });
}

if(!JOBS.length && !SUGGESTIONS.length && !ASKS.length){
  root.innerHTML='<div class="empty"><b>You\\'re all caught up 🎉</b><br>New jobs and upgrades will appear here each morning.</div>';
}

renderOutbox();
</script>
</body>
</html>`;
}
