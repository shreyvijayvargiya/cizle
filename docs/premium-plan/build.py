import json,re,collections
exec(open('specs.py').read())
rows=[json.loads(l) for l in open('../../site/content/gallery.jsonl') if l.strip()]
blobs=[((r['title']+' '+r['text']+' '+' '.join(r.get('tags') or [])).lower(), r['author']['handle']) for r in rows]
def slug(s): return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
out=[];weak=[]
for i,(name,cat,stack,dur,asp,concept,beats,params,kw) in enumerate(S,1):
    pat=re.compile(r'(?<![a-z0-9])('+'|'.join(re.escape(k) for k in kw)+r')(?![a-z0-9])')
    hit=[h for b,h in blobs if pat.search(b)]
    n,m=len(hit),len(set(hit))
    if n<5 or m<3: weak.append((name,n,m))
    cuts=[0,round(dur*0.3),round(dur*0.7)]
    out.append({"id":f"p{i:03d}","slug":slug(name),"name":name,"category":cat,"stack":stack.split(),"duration_sec":dur,"aspect":asp,"concept":concept,
      "beats":[{"at_sec":cuts[j],"what":b} for j,b in enumerate(beats)],"params":params,
      "evidence":{"keywords":kw,"prompts_seen":n,"creators":m},"status":"planned"})
ids=[o['slug'] for o in out]; assert len(set(ids))==len(ids)
doc={"version":1,"count":len(out),
 "purpose":"100 original premium skills. Each entry is a brief for the generator: an agent expands it into a full skill prompt and renders one 6 to 20 second demo video.",
 "originality_rules":[
  "Write from the technique, never from any one gallery prompt: no sentence, name, brand or story from a source prompt may appear.",
  "Every concept rests on at least 5 prompts by at least 3 different creators (see evidence), so it is a common pattern and not one person's work.",
  "Run an overlap check before shipping: reject any skill sharing an 8-word run with a gallery prompt or with another skill.",
  "Render the video yourself and keep only skills whose video looks good. The proof video is made and owned by you.",
  "Record origin: original on every shipped skill. Evidence counts here are for planning only and must not be shown as sources."],
 "render":{"model":"Opus 5.5 via OpenRouter","min_sec":6,"max_sec":20,"formats":["16:9","9:16","1:1"]},
 "categories":dict(collections.Counter(o['category'] for o in out)),"skills":out}
json.dump(doc,open('premium-100.json','w'),indent=1,ensure_ascii=False)
L=["# 100 premium skills to build\n","Briefs for the generator CLI. Evidence = how many gallery prompts (and creators) use the same technique, counts only.\n"]
for cat in doc['categories']:
    L.append(f"\n## {cat} ({doc['categories'][cat]})\n\n| # | Skill | Length | Aspect | Stack | Evidence |\n|---|---|---|---|---|---|")
    for o in out:
        if o['category']==cat: L.append(f"| {o['id']} | **{o['name']}**: {o['concept']} | {o['duration_sec']}s | {o['aspect']} | {', '.join(o['stack'])} | {o['evidence']['prompts_seen']} / {o['evidence']['creators']} |")
open('premium-100.md','w').write('\n'.join(L)+'\n')
print(len(out),"weak:",weak)
print("min evidence",min(o['evidence']['prompts_seen'] for o in out),min(o['evidence']['creators'] for o in out))
tot=sum(o['duration_sec'] for o in out); print("total video seconds",tot)
