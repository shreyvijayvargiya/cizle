/**
 * Turns a small config into a self-contained scene page for the capture clock (same contract as the premium skills:
 * requestAnimationFrame driven, deterministic, holds its last frame). Beats: title, type, stat, list, cards, split, cta.
 */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const THEMES = {
	teal: { bg: "#0b0d12", glow: "52,214,190", accent: "#34d6be", text: "#f4f6fb", dim: "#8a93a6", card: "rgba(255,255,255,.07)" },
	amber: { bg: "#100b08", glow: "255,170,60", accent: "#ffb23e", text: "#fff6ea", dim: "#a9967f", card: "rgba(255,255,255,.07)" },
	violet: { bg: "#0c0a14", glow: "150,110,255", accent: "#a98bff", text: "#f5f2ff", dim: "#928bb0", card: "rgba(255,255,255,.07)" },
	red: { bg: "#120808", glow: "255,80,70", accent: "#ff5a4d", text: "#fff3f1", dim: "#a98884", card: "rgba(255,255,255,.07)" },
};

export function buildScene(cfg) {
	const [W, H] = cfg.aspect === "16:9" ? [1920, 1080] : [1080, 1920];
	const th = THEMES[cfg.theme || "teal"];
	const vertical = H > W;
	const data = { D: cfg.duration, beats: cfg.beats, vertical, W, H };
	return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(cfg.title)}</title><style>
:root{--bg:${th.bg};--accent:${th.accent};--text:${th.text};--dim:${th.dim};--card:${th.card};--g:${th.glow}}
*{box-sizing:border-box}
html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:var(--bg)}
body{font-family:ui-sans-serif,system-ui,"Helvetica Neue",Helvetica,Arial,sans-serif;color:var(--text);position:relative}
.bg{position:absolute;inset:0;background:radial-gradient(${W * 0.8}px ${W * 0.8}px at 50% 55%,rgba(var(--g),.16),transparent 70%),radial-gradient(${W}px ${W}px at 50% 110%,rgba(var(--g),.10),transparent 70%)}
.vig{position:absolute;inset:0;background:radial-gradient(closest-side,transparent 60%,rgba(0,0,0,.55))}
.speck{position:absolute;width:6px;height:6px;border-radius:50%;background:var(--accent);opacity:0}
.brand{position:absolute;left:0;right:0;top:${vertical ? 150 : 70}px;text-align:center;letter-spacing:.5em;font-size:${vertical ? 30 : 26}px;font-weight:700;color:var(--accent);text-transform:uppercase}
.beat{position:absolute;left:${vertical ? 80 : 160}px;right:${vertical ? 80 : 160}px;top:${vertical ? 320 : 160}px;bottom:${vertical ? 240 : 140}px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;opacity:0}
.h{font-size:${vertical ? 112 : 104}px;line-height:1.04;font-weight:800;letter-spacing:-.035em}
.h .w{display:inline-block;opacity:0;margin:0 .13em}
.h em{font-style:normal;color:var(--accent)}
.sub{margin-top:36px;font-size:${vertical ? 44 : 38}px;line-height:1.3;color:var(--dim);font-weight:500;max-width:${vertical ? 860 : 1200}px}
.label{font-size:28px;letter-spacing:.3em;text-transform:uppercase;color:var(--accent);font-weight:700;margin-bottom:34px}
.term{width:100%;max-width:${vertical ? 920 : 1400}px;text-align:left;background:var(--card);border:2px solid rgba(255,255,255,.1);border-radius:36px;padding:52px 56px;font-size:${vertical ? 44 : 40}px;line-height:1.38;font-weight:500;font-family:ui-monospace,Menlo,Consolas,monospace;min-height:${vertical ? 560 : 360}px;white-space:pre-wrap}
.caret{display:inline-block;width:.5em;height:1em;background:var(--accent);vertical-align:-.12em;margin-left:2px}
.stat{font-size:${vertical ? 300 : 260}px;font-weight:800;letter-spacing:-.05em;line-height:1;color:var(--accent)}
.rows{width:100%;max-width:${vertical ? 920 : 1300}px;display:flex;flex-direction:column;gap:22px}
.row{display:flex;align-items:center;gap:26px;padding:0 40px;height:${vertical ? 132 : 112}px;border-radius:40px;background:var(--card);font-size:${vertical ? 46 : 40}px;font-weight:650;text-align:left;opacity:0;border:2px solid rgba(255,255,255,.08)}
.row b{margin-left:auto;color:var(--accent);font-size:.9em}
.dot{width:54px;height:54px;border-radius:50%;border:4px solid var(--accent);flex:none;display:flex;align-items:center;justify-content:center;color:var(--accent);font-size:32px;font-weight:800}
.cards{display:grid;grid-template-columns:${vertical ? "1fr 1fr" : "repeat(4,1fr)"};gap:24px;width:100%;max-width:${vertical ? 940 : 1600}px}
.card{height:${vertical ? 300 : 360}px;border-radius:40px;display:flex;align-items:flex-end;padding:30px;font-size:${vertical ? 40 : 38}px;font-weight:750;text-align:left;letter-spacing:-.02em;opacity:0;border:2px solid rgba(255,255,255,.12);position:relative;overflow:hidden}
.card small{display:block;font-size:.55em;font-weight:600;opacity:.75;letter-spacing:.02em;margin-top:6px}
.split{display:flex;flex-direction:${vertical ? "column" : "row"};gap:28px;width:100%;max-width:${vertical ? 940 : 1600}px}
.pane{flex:1;border-radius:40px;padding:44px;text-align:left;font-size:${vertical ? 38 : 34}px;line-height:1.35;font-weight:500;opacity:0;border:2px solid rgba(255,255,255,.1);background:var(--card)}
.pane h4{margin:0 0 20px;font-size:.7em;letter-spacing:.25em;text-transform:uppercase;font-weight:800}
.pane.bad h4{color:#ff7a6d}.pane.good{border-color:var(--accent)}.pane.good h4{color:var(--accent)}
.pane .m{font-family:ui-monospace,Menlo,monospace;font-size:.92em}
.cta{font-size:${vertical ? 96 : 92}px;font-weight:800;letter-spacing:-.03em}
.url{margin-top:44px;font-size:${vertical ? 64 : 60}px;font-weight:750;color:var(--bg);background:var(--accent);padding:26px 56px;border-radius:80px;display:inline-block}
.bar{position:absolute;left:0;bottom:0;height:8px;background:var(--accent);width:0}
</style></head><body>
<div class="bg"></div><div id="specks"></div><div class="vig"></div>
<div class="brand">cizle</div>
<div id="root"></div><div class="bar" id="bar"></div>
<script>
const CFG=${JSON.stringify(data)};
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const seg=(t,a,b)=>clamp((t-a)/(b-a));
const outCubic=x=>1-Math.pow(1-x,3),outQuint=x=>1-Math.pow(1-x,5),inOut=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const lerp=(a,b,x)=>a+(b-a)*x;
const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;");
const root=document.getElementById("root");
const mk=(b)=>{
  const el=document.createElement("div");el.className="beat";let h="";
  if(b.type==="title"){h='<div class="h">'+b.text.split(" ").map(w=>'<span class="w">'+(w.startsWith("*")?"<em>"+esc(w.slice(1))+"</em>":esc(w))+'</span>').join(" ")+'</div>'+(b.sub?'<div class="sub">'+esc(b.sub)+'</div>':"");}
  if(b.type==="type"){h=(b.label?'<div class="label">'+esc(b.label)+'</div>':"")+'<div class="term"><span class="t"></span><span class="caret"></span></div>'+(b.sub?'<div class="sub">'+esc(b.sub)+'</div>':"");}
  if(b.type==="stat"){h='<div class="stat">0</div><div class="sub">'+esc(b.sub)+'</div>';}
  if(b.type==="list"){h=(b.label?'<div class="label">'+esc(b.label)+'</div>':"")+'<div class="rows">'+b.items.map((i,n)=>'<div class="row"><span class="dot">'+(i.n||n+1)+'</span>'+esc(i.t)+(i.r?'<b>'+esc(i.r)+'</b>':"")+'</div>').join("")+'</div>';}
  if(b.type==="cards"){h=(b.label?'<div class="label">'+esc(b.label)+'</div>':"")+'<div class="cards">'+b.items.map(i=>'<div class="card" style="background:'+i.bg+';color:'+(i.fg||"#fff")+'"><div>'+esc(i.t)+(i.s?'<small>'+esc(i.s)+'</small>':"")+'</div></div>').join("")+'</div>';}
  if(b.type==="split"){h='<div class="split"><div class="pane bad"><h4>'+esc(b.left.h)+'</h4><div class="m">'+esc(b.left.t)+'</div></div><div class="pane good"><h4>'+esc(b.right.h)+'</h4><div>'+esc(b.right.t)+'</div></div></div>';}
  if(b.type==="cta"){h='<div class="cta">'+esc(b.text)+'</div><div class="url">'+esc(b.url)+'</div>'+(b.sub?'<div class="sub">'+esc(b.sub)+'</div>':"");}
  el.innerHTML=h;root.appendChild(el);return el;
};
const els=CFG.beats.map(mk);
const specks=[];for(let i=0;i<18;i++){const e=document.createElement("div");e.className="speck";document.getElementById("specks").appendChild(e);specks.push({e,x:(i*137.5)%CFG.W,y:(i*233)%CFG.H,v:14+(i%5)*8,s:4+(i%4)*3,p:i*.7});}
let t0=null;
function frame(ts){
  if(t0===null)t0=ts;
  const t=Math.min((ts-t0)/1000,CFG.D);
  CFG.beats.forEach((b,i)=>{
    const el=els[i],a=b.at,z=b.to;
    const inn=outCubic(seg(t,a,a+.35)),out=i===CFG.beats.length-1?0:outCubic(seg(t,z-.2,z));
    const o=Math.min(inn,1-out);el.style.opacity=o;
    el.style.transform="translateY("+lerp(46,0,inn)+"px) translateY("+lerp(0,-30,out)+"px) scale("+lerp(.97,1,inn)+")";
    if(o<=0)return;
    const lt=t-a;
    if(b.type==="title"){el.querySelectorAll(".w").forEach((w,n)=>{const p=outCubic(seg(lt,.1+n*.16,.1+n*.16+.35));w.style.opacity=p;w.style.transform="translateY("+lerp(36,0,p)+"px)";});}
    if(b.type==="type"){const n=Math.floor(b.text.length*clamp((lt-.3)/(b.speed||2.2)));el.querySelector(".t").textContent=b.text.slice(0,n);el.querySelector(".caret").style.opacity=(n>=b.text.length&&lt>(b.speed||2.2)+.8)?0:(Math.floor(t*2.4)%2?0:1);}
    if(b.type==="stat"){const v=b.value*outQuint(seg(lt,.1,1.6));el.querySelector(".stat").textContent=(b.prefix||"")+Math.round(v).toLocaleString("en-US")+(b.suffix||"");}
    if(b.type==="list")el.querySelectorAll(".row").forEach((r,n)=>{const p=outCubic(seg(lt,.25+n*.35,.25+n*.35+.4));r.style.opacity=p;r.style.transform="translateX("+lerp(80,0,p)+"px)";});
    if(b.type==="cards")el.querySelectorAll(".card").forEach((r,n)=>{const p=outCubic(seg(lt,.2+n*.18,.2+n*.18+.45));r.style.opacity=p;r.style.transform="translateY("+lerp(60,0,p)+"px) scale("+lerp(.9,1,p)+")";});
    if(b.type==="split"){const p=el.querySelectorAll(".pane");p.forEach((r,n)=>{const q=outCubic(seg(lt,.2+n*.9,.2+n*.9+.5));r.style.opacity=q;r.style.transform="translateY("+lerp(50,0,q)+"px)";});}
  });
  document.getElementById("bar").style.width=(t/CFG.D*100)+"%";
  specks.forEach(s=>{const y=((s.y-t*s.v)%CFG.H+CFG.H)%CFG.H;s.e.style.transform="translate("+(s.x+Math.sin(t*.6+s.p)*16)+"px,"+y+"px)";s.e.style.width=s.e.style.height=s.s+"px";s.e.style.opacity=(.1+.16*Math.sin(t*1.1+s.p)**2).toFixed(3);});
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
</script></body></html>`;
}
