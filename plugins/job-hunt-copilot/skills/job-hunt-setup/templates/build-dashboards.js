#!/usr/bin/env node
/* Rebuilds the PINNED dashboard from the live queue files.
   THE DASHBOARD is the one hub: its "Today" tab gets a Daily Hub injected in — a
   ▶ Run-now agent menu + the actionable To-Do (jobs / CV upgrades / asks). The old
   standalone daily-todo and daily-menu tiles (pre-v2.5.0) become "moved" pointers.

   Run:  node build-dashboards.js [--src DIR]   (--src used when a synced-folder mount truncates)

   Agents for the Run-now menu come from data-agents.js: each agent entry that has a
   `task` field (its scheduled-task id) is shown with a Run-now button. Setup writes those
   task ids in STEP 5; the updater backfills them. No task ids are hardcoded here.

   NOTE: a pinned-artifact sandbox blocks sendPrompt + scripted clipboard, so To-Do actions
   show a selectable line to copy/paste into the chat; the ONE working button bridge is
   window.cowork.runScheduledTask (used by the Run-now buttons). */

const fs = require("fs");
const path = require("path");
const base = __dirname;
const srcIx = process.argv.indexOf("--src");
const qdir = srcIx > -1 ? process.argv[srcIx + 1] : path.join(base, "Queues");

const FILES = ["data-applied.js","data-shortlist.js","data-searchlog.js","data-health.js",
  "data-stats.js","data-suggestions.js","data-sync.js","data-charter.js","data-agents.js","data-todo.js"];

const raw = {}; const truncated = [];
for (const f of FILES) { const c = fs.readFileSync(path.join(qdir, f), "utf8");
  if (!c.trimEnd().endsWith("};")) truncated.push(f); raw[f] = c; }
if (truncated.length) { console.error("TRUNCATED queue files: " + truncated.join(", ") + " — stage clean copies (Read tool -> a folder) and re-run with --src that folder."); process.exit(1); }

const window = {}; for (const f of FILES) { new Function("window", raw[f])(window); }

const SH = window.Q_SHORTLIST || {}, SG = window.Q_SUGGESTIONS || {}, SY = window.Q_SYNC || {}, TD = window.Q_TODO || {}, AG = window.Q_AGENTS || {};
const DATE = SH.date || SG.updated || new Date().toISOString().slice(0, 10);
const JOBS = (SH.roles || []).filter(r => !/applied/i.test(r.status || "")).map(r => ({
  n: r.n, company: r.company, title: r.title, fit: r.fit, loc: r.location || "", ds: r.jobSummary || "", cs: r.companySummary || "", link: r.link || "#" }));
const pend = (SG.items || []).filter(i => (i.status || "pending") === "pending");
const SUGG = pend.filter(i => i.type !== "question").sort((a,b)=>(a.priority==="High"?0:1)-(b.priority==="High"?0:1)).map(i => ({ id: i.id, pr: i.priority, t: i.title }));
const qCount = pend.filter(i => i.type === "question").length;
const sitesBehind = (SY.sites || []).filter(s => !/in sync|up to date/i.test(s.status || "")).map(s => s.name);
const ASKS = [];
if (qCount) ASKS.push({ key:"questions", ic:"❓", nm:qCount+" quick yes/no question"+(qCount>1?"s":"")+" from Polish", ds:"Answering these opens up more matching jobs. I'll read them out and you answer yes/no.", label:"Answer them", cmd:"let's answer the open profile questions" });
if (sitesBehind.length) ASKS.push({ key:"sync", ic:"🔗", nm:sitesBehind.length+" job-site profile"+(sitesBehind.length>1?"s":"")+" behind your latest CV", ds:sitesBehind.join(", ")+". Log into each first, then I'll fill and save them for you.", label:"Help me sync", cmd:"help me sync my job-site profiles" });
(TD.items || []).filter(i => /chief of staff/i.test(i.who || "")).forEach(i => ASKS.push({ key:"todo"+i.id, ic:"🛠️", nm:(i.title||"").split("—")[0].split(".")[0].slice(0,90), ds:i.title||"", label:"Do it", cmd:i.reply||"" }));

// Run-now menu: every agent in data-agents.js that carries a scheduled-task id.
const AGENTS = ((AG.agents) || []).filter(a => a && a.task).map(a => ({
  ic: a.ic || "▶", nm: (a.name || "").split(/\s*[—–-]\s*/)[0].trim(), md: a.md || a.short || a.goal || "", mt: a.mt || a.time || "", task: a.task }));

const HUBDATA = "const HUB_DATE="+JSON.stringify(DATE)+";const HUB_JOBS="+JSON.stringify(JOBS)+";const HUB_SUGG="+JSON.stringify(SUGG)+";const HUB_ASKS="+JSON.stringify(ASKS)+";const HUB_AGENTS="+JSON.stringify(AGENTS)+";";

let dash = fs.readFileSync(path.join(base, "progress-dashboard.html"), "utf8");
if (!dash.trimEnd().endsWith("</html>")) { console.error("dashboard template truncated"); process.exit(1); }
for (const f of FILES) { const tag = `<script src="Queues/${f}"></script>`;
  if (!dash.includes(tag)) { console.error("missing tag " + f); process.exit(1); }
  dash = dash.replace(tag, `<script>\n/* inlined ${f} */\n${raw[f]}\n</script>`); }
dash = dash.replace("setTimeout(function(){ location.reload(); }, 300000);", "/* auto-reload removed */");
dash = dash.replace("</head>", HUB_STYLE() + "\n</head>");
dash = dash.replace('<div id="headline"></div>',
  '<div id="headline"></div>\n<h2>&#9654; Daily Hub — run a helper, or act on what is waiting</h2>\n<div id="hub"></div>');
dash = dash.replace("</body>", HUB_DOM() + HUB_SCRIPT() + "\n</body>");
fs.writeFileSync(path.join(base, "dashboard-pinned.html"), dash);

// Retire the pre-v2.5.0 standalone tiles into pointers (harmless if never registered).
fs.writeFileSync(path.join(base, "daily-todo.html"), STUB("Your Daily To-Do actions now live in the <b>Dashboard &#8594; Today tab</b> (top: Daily Hub) — jobs, CV upgrades and asks, all with the helpers."));
fs.writeFileSync(path.join(base, "daily-menu.html"), STUB("The <b>▶ Run now</b> helper buttons now live at the top of the <b>Dashboard &#8594; Today tab</b>, next to the jobs, CV upgrades and asks."));
console.log(`Built: dashboard-pinned.html (hub in Today) + daily-todo.html/daily-menu.html (pointers)  (${JOBS.length} jobs, ${SUGG.length} upgrades, ${ASKS.length} asks, ${AGENTS.length} agents, ${DATE})`);

function HUB_STYLE(){ return `<style>
  #hub .menu-card{background:#fff;border:1px solid #e6e8ee;border-radius:14px;padding:11px 14px;margin-bottom:9px;display:flex;gap:12px;align-items:center}
  #hub .menu-card .mm{flex:1;min-width:0}
  #hub .menu-card .mn{font-weight:800;font-size:14px} #hub .menu-card .md{font-size:12.5px;color:#333} #hub .menu-card .mt{font-size:11.5px;color:#5b6472;margin-top:2px}
  #hub .runbtn{flex:none;border:none;cursor:pointer;font:inherit;font-weight:700;font-size:13px;background:#2b6cb0;color:#fff;border-radius:9px;padding:9px 13px;white-space:nowrap}
  #hub .runbtn:disabled{opacity:.6;cursor:default} #hub .runbtn.done{background:#1f9d55}
  #hub .hcard{background:#fff;border:1px solid #e6e8ee;border-radius:14px;padding:14px 16px;margin-bottom:11px}
  #hub .hnm{font-weight:800;font-size:15px} #hub .hds{font-size:13.5px;margin-top:3px;color:#333}
  #hub .hmeta{font-size:12px;color:#5b6472;margin-top:6px}
  #hub .fitc{display:inline-block;font-weight:800;font-size:12px;background:#eef1f6;color:#1f2a44;border-radius:20px;padding:2px 9px;margin-left:6px}
  #hub .hacts{display:flex;gap:8px;flex-wrap:wrap;margin-top:11px;align-items:center}
  #hub .hbtn{border:none;cursor:pointer;font:inherit;font-weight:700;font-size:13px;border-radius:9px;padding:8px 14px;white-space:nowrap}
  #hub .hbtn:disabled{opacity:.55;cursor:default}
  #hub .yes{background:#1f9d55;color:#fff} #hub .no{background:#fff;color:#c0392b;border:1.5px solid #c0392b} #hub .go{background:#2b6cb0;color:#fff} #hub .all{background:#1f2a44;color:#fff}
  #hub .hbadge{display:inline-block;font-weight:800;font-size:12px;border-radius:8px;padding:6px 10px}
  #hub .hbadge.y{background:#e6f5ec;color:#1f9d55} #hub .hbadge.n{background:#fdecea;color:#c0392b} #hub .hbadge.g{background:#e8f0f9;color:#2b6cb0}
  #hub .hundo{background:none;border:none;color:#5b6472;font:inherit;font-size:12px;text-decoration:underline;cursor:pointer;padding:4px}
  #hub .hsec{font-size:12.5px;text-transform:uppercase;letter-spacing:.04em;color:#5b6472;font-weight:800;margin:16px 0 8px}
  #hubtoast{position:fixed;left:50%;bottom:86px;transform:translateX(-50%);background:#1f2a44;color:#fff;font-size:13px;font-weight:600;padding:11px 16px;border-radius:10px;opacity:0;transition:opacity .2s;pointer-events:none;max-width:92%;text-align:center;z-index:80}
  #hubtoast.show{opacity:.98}
  #huboutbox{position:fixed;left:0;right:0;bottom:0;background:#12324f;color:#fff;display:none;flex-direction:column;gap:8px;padding:12px 18px 14px;box-shadow:0 -2px 14px rgba(0,0,0,.22);z-index:70}
  #huboutbox.show{display:flex}
  #huboutbox .ot{display:flex;align-items:center;justify-content:space-between;gap:12px}
  #huboutbox .oc{font-weight:800;font-size:14px} #huboutbox .os{font-size:11.5px;color:#cfe0f5}
  #huboutbox input{width:100%;background:#0d2740;color:#fff;border:1px solid #2c4a66;border-radius:9px;padding:10px 12px;font:inherit;font-size:13px;font-weight:600}
  #huboutbox .sb{background:#ffd67a;color:#12324f;border:none;border-radius:10px;padding:10px 15px;font:inherit;font-weight:800;font-size:14px;cursor:pointer;white-space:nowrap}
  #huboutbox .ort{display:flex;gap:8px;align-items:center}
  #huboutbox .hubx{background:none;border:none;color:#cfe0f5;font-size:22px;line-height:1;cursor:pointer;padding:2px 8px;border-radius:8px}
  #huboutbox .hubx:hover{color:#fff;background:#0d2740}
</style>`; }

function HUB_DOM(){ return `<div id="hubtoast"></div>
<div id="huboutbox"><div class="ot"><div class="oc" id="hubcount">0 picks ready</div><div class="ort"><button class="sb" id="hubsend">\u{1F4CB} Copy line</button><button class="hubx" id="hubclose" title="Hide this bar">\u{00D7}</button></div></div>
<input id="hubtext" readonly onclick="this.select()" /><div class="os">Tap the line, press Ctrl/Cmd+C, paste into the chat and hit enter — or read it to me.</div></div>`; }

function HUB_SCRIPT(){ return `<script>
(function(){
${HUBDATA}
var LS="hub:"+HUB_DATE;
function load(){try{return JSON.parse(localStorage.getItem(LS)||"{}");}catch(e){return {};}}
function save(s){try{localStorage.setItem(LS,JSON.stringify(s));}catch(e){}}
var ST=load();var HIDDEN=false;
var ASKMAP={}; HUB_ASKS.forEach(function(a){ASKMAP["ask:"+a.key]=a;});
function toast(h,ms){var t=document.getElementById("hubtoast");t.innerHTML=h;t.classList.add("show");clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove("show");},ms||3200);}
function mk(c,l){var b=document.createElement("button");b.className="hbtn "+c;b.textContent=l;return b;}
function bld(){var applyJ=[],passJ=[],accS=[],rejS=[],askC=[];Object.keys(ST).forEach(function(k){var v=ST[k];if(k.indexOf("job:")===0){(v==="yes"?applyJ:passJ).push(k.slice(4));}else if(k.indexOf("sug:")===0){(v==="yes"?accS:rejS).push(k.slice(4));}else if(k.indexOf("ask:")===0&&v==="go"){var a=ASKMAP[k];if(a&&a.cmd)askC.push(a.cmd);}});var p=[];if(applyJ.length)p.push("apply to job"+(applyJ.length>1?"s":"")+" "+applyJ.join(", "));if(passJ.length)p.push("not interested in job"+(passJ.length>1?"s":"")+" "+passJ.join(", "));if(accS.length)p.push("accept CV upgrade"+(accS.length>1?"s":"")+" "+accS.join(", "));if(rejS.length)p.push("reject CV upgrade"+(rejS.length>1?"s":"")+" "+rejS.join(", "));askC.forEach(function(c){p.push(c);});var n=applyJ.length+passJ.length+accS.length+rejS.length+askC.length;return {count:n,text:p.length?("From my Daily To-Do, please: "+p.join("; ")+"."):""};}
function outbox(){var bar=document.getElementById("huboutbox");var r=bld();if(!r.count||HIDDEN){bar.classList.remove("show");return;}bar.classList.add("show");document.getElementById("hubcount").textContent=r.count+" pick"+(r.count>1?"s":"")+" ready — copy the line:";document.getElementById("hubtext").value=r.text;}
function copyPicks(){var r=bld();if(!r.count)return;var box=document.getElementById("hubtext");box.value=r.text;box.focus();box.select();try{box.setSelectionRange(0,r.text.length);}catch(e){}var ok=false;try{ok=document.execCommand("copy");}catch(e){}try{if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(r.text).then(function(){},function(){});}catch(e){}toast(ok?"Copied &#10003; — paste (Ctrl/Cmd+V) into the chat and hit enter.":"Selected below — press <b>Ctrl/Cmd+C</b>, then paste into the chat. Or read it to me.",6000);}
document.getElementById("hubsend").onclick=copyPicks;
var _hc=document.getElementById("hubclose");if(_hc)_hc.onclick=function(){HIDDEN=true;document.getElementById("huboutbox").classList.remove("show");toast("Hidden. Tap any Apply / Accept / Reject again and it comes back.",3200);};
function paint(el,v){el._y.disabled=true;el._n.disabled=true;var t=el._a.querySelector(".hbadge");if(!t){t=document.createElement("span");el._a.insertBefore(t,el._a.firstChild);}t.className="hbadge "+(v==="yes"?"y":"n");t.textContent=el._k==="job"?(v==="yes"?"✓ Apply — queued":"✕ Passed — queued"):(v==="yes"?"✓ Accept — queued":"✕ Reject — queued");if(!el._a.querySelector(".hundo")){var u=document.createElement("button");u.className="hundo";u.textContent="undo";u.onclick=function(){delete ST[el._key];save(ST);el._y.disabled=false;el._n.disabled=false;if(t)t.remove();u.remove();outbox();};el._a.appendChild(u);}}
function choose(el,k,v){HIDDEN=false;ST[k]=v;save(ST);paint(el,v);outbox();}
function runAgent(task,nm,btn){btn.disabled=true;var old=btn.textContent;btn.textContent="Starting…";try{if(window.cowork&&typeof window.cowork.runScheduledTask==="function"){window.cowork.runScheduledTask(task);btn.textContent="✓ Started";btn.classList.add("done");toast(nm+" is running — I'll message you when it's done.",4000);}else{throw 0;}}catch(e){btn.textContent=old;btn.disabled=false;toast('Couldn\\'t start it here — type "run '+nm+'" in chat.',5000);}}
function sec(t){var h=document.createElement("div");h.className="hsec";h.textContent=t;root.appendChild(h);}
var root=document.getElementById("hub");if(!root)return;
if(HUB_AGENTS.length){sec("▶ Start a helper early");HUB_AGENTS.forEach(function(a){var el=document.createElement("div");el.className="menu-card";el.innerHTML='<div style="font-size:20px;flex:none;width:26px;text-align:center">'+a.ic+'</div><div class="mm"><div class="mn">'+a.nm+'</div><div class="md">'+a.md+'</div><div class="mt">'+(a.mt?"Runs on its own · "+a.mt:"")+'</div></div>';var b=document.createElement("button");b.className="runbtn";b.textContent="▶ Run now";b.onclick=function(){runAgent(a.task,a.nm,b);};el.appendChild(b);root.appendChild(el);});}
if(HUB_JOBS.length){sec("① New jobs to review");HUB_JOBS.forEach(function(j){var kk="job:"+j.n;var el=document.createElement("div");el.className="hcard";el.innerHTML='<div class="hnm">'+j.company+' <span class="fitc">'+j.fit+'% fit</span></div><div class="hds"><b>'+j.title+'</b> — '+j.ds+'</div>'+(j.cs?'<div class="hds" style="margin-top:6px"><b>About '+j.company+':</b> '+j.cs+'</div>':'')+'<div class="hmeta">'+(j.loc?j.loc+' &nbsp;·&nbsp; ':'')+'<a href="'+j.link+'" target="_blank" rel="noopener" style="color:#2b6cb0;font-weight:700;text-decoration:none">Open the listing ↗</a></div>';var a=document.createElement("div");a.className="hacts";var y=mk("yes","✓ Apply"),n=mk("no","✕ Not interested");el._k="job";el._key=kk;el._y=y;el._n=n;el._a=a;y.onclick=function(){choose(el,kk,"yes");};n.onclick=function(){choose(el,kk,"no");};a.appendChild(y);a.appendChild(n);el.appendChild(a);if(ST[kk])paint(el,ST[kk]);root.appendChild(el);});}
if(HUB_SUGG.length){sec("② CV wording upgrades (Polish)");var ac=document.createElement("div");ac.className="hcard";ac.innerHTML='<div class="hnm">'+HUB_SUGG.length+' upgrades ready</div><div class="hmeta">Queue all in one tap, or decide each below.</div>';var aa=document.createElement("div");aa.className="hacts";var ab=mk("all","✓ Accept all");ab.onclick=function(){document.querySelectorAll("[data-hsug]").forEach(function(c){ST["sug:"+c.getAttribute("data-hsug")]="yes";paint(c,"yes");});HIDDEN=false;save(ST);outbox();ab.disabled=true;ab.textContent="✓ All queued";};aa.appendChild(ab);ac.appendChild(aa);root.appendChild(ac);HUB_SUGG.forEach(function(s){var kk="sug:"+s.id;var el=document.createElement("div");el.className="hcard";el.setAttribute("data-hsug",s.id);el.innerHTML='<div class="hds"><b>'+s.pr+'</b> — '+s.t+'</div>';var a=document.createElement("div");a.className="hacts";var y=mk("yes","✓ Accept"),n=mk("no","✕ Reject");el._k="sug";el._key=kk;el._y=y;el._n=n;el._a=a;y.onclick=function(){choose(el,kk,"yes");};n.onclick=function(){choose(el,kk,"no");};a.appendChild(y);a.appendChild(n);el.appendChild(a);if(ST[kk])paint(el,ST[kk]);root.appendChild(el);});}
if(HUB_ASKS.length){sec("③ Other quick asks");HUB_ASKS.forEach(function(a){var kk="ask:"+a.key;var el=document.createElement("div");el.className="hcard";el.innerHTML='<div class="hnm">'+a.ic+' '+a.nm+'</div><div class="hds">'+a.ds+'</div>';var ac=document.createElement("div");ac.className="hacts";var g=mk("go",a.label);function mark(){g.disabled=true;if(!ac.querySelector(".hbadge"))ac.insertAdjacentHTML("afterbegin",'<span class="hbadge g">queued</span>');if(!ac.querySelector(".hundo")){var u=document.createElement("button");u.className="hundo";u.textContent="undo";u.onclick=function(){delete ST[kk];save(ST);g.disabled=false;var b=ac.querySelector(".hbadge");if(b)b.remove();u.remove();outbox();};ac.appendChild(u);}}g.onclick=function(){HIDDEN=false;ST[kk]="go";save(ST);mark();outbox();};ac.appendChild(g);el.appendChild(ac);if(ST[kk])mark();root.appendChild(el);});}
outbox();
})();
</script>`; }

function STUB(msg){ return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Moved into your Dashboard</title>
<style>:root{color-scheme:light}body{margin:0;background:#f5f6f8;color:#1f2a44;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5}.wrap{max-width:560px;margin:0 auto;padding:40px 22px}.card{background:#fff;border:1px solid #e6e8ee;border-radius:16px;padding:26px 24px;text-align:center}h1{font-size:20px;margin:0 0 10px}p{font-size:14px;color:#3f4b5b}.big{background:linear-gradient(135deg,#12324f,#1f6f5c);color:#fff;border-radius:14px;padding:16px 18px;margin-top:16px;font-size:14px}.big b{color:#ffd67a}.tip{font-size:12.5px;color:#5b6472;margin-top:16px}</style></head>
<body><div class="wrap"><div class="card"><h1>\u{1F9ED} Moved into your Dashboard</h1><p>${msg}</p><div class="big">Open <b>Dashboard</b> from the sidebar — it is all on the <b>Today</b> tab now.</div><p class="tip">You can unpin this tile — nothing lives here anymore.</p></div></div></body></html>`; }
