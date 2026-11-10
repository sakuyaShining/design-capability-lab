from pathlib import Path
import json,sys

ROOT=Path(__file__).resolve().parents[1]
DIR=ROOT/'standards/interface-capability'
data=json.loads((DIR/'tokens.json').read_text(encoding='utf-8'))
rules=json.loads((DIR/'rules.json').read_text(encoding='utf-8'))['rules']
required=['id','kind','status','version','problem','applies_when','avoid_when','decision','invariants','freedom','anti_pattern','evidence_path','evidence_ids','validation','limitations']
assert len({r['id'] for r in rules})==len(rules)
for r in rules:
    assert all(r.get(k) for k in required),r['id']
    assert (ROOT/r['evidence_path']).is_file(),r['id']
    assert r['evidence_refs'],r['id']
    for ref in r['evidence_refs']:
        report=(ROOT/ref['report']).read_text(encoding='utf-8-sig')
        for id_key in ['feedback_ids','review_ids']:
            assert all(i in report for i in ref.get(id_key,[])),r['id']
        if ref.get('manifest'):
            manifest=json.loads((ROOT/ref['manifest']).read_text(encoding='utf-8-sig'))
            available={s['id'] for s in manifest['sources']}
            assert set(ref['source_ids'])<=available,r['id']
css='/* Generated from tokens.json by scripts/build-spec-assets.py; edit the JSON source. */\n'
contrasts=[]
def luminance(color):
    values=[int(color[i:i+2],16)/255 for i in (1,3,5)]
    v=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in values]
    return sum(x*y for x,y in zip(v,[.2126,.7152,.0722]))
for profile,themes in data['profiles'].items():
    for theme,values in themes.items():
        css+=f'[data-profile="{profile}"][data-theme="{theme}"] {{\n'
        css+=''.join(f'  --dcl-{k}: {v};\n' for k,v in values.items())+'}\n'
        for fg,bg in [('ink','panel'),('muted','panel'),('ink','ground'),('muted','inset'),('accentInk','accent'),('actionInk','action'),('attention','attentionSoft'),('done','doneSoft')]:
            a,b=sorted([luminance(values[fg]),luminance(values[bg])])
            ratio=(b+.05)/(a+.05);assert ratio>=4.5,(profile,theme,fg,bg,ratio)
            contrasts.append({'profile':profile,'theme':theme,'pair':fg+'/'+bg,'ratio':round(ratio,2)})
if '--check' in sys.argv:
    assert (DIR/'tokens.css').read_text(encoding='utf-8')==css,'Regenerate tokens.css'
else:(DIR/'tokens.css').write_text(css,encoding='utf-8',newline='\n')
record={'date':'2026-11-11','rule_count':len(rules),'selected_token_contrasts':contrasts,'scope':'selected solid pairs only, not whole-page accessibility certification'}
out=ROOT/'runs/review-02';out.mkdir(parents=True,exist_ok=True)
(out/'spec-asset-check.json').write_text(json.dumps(record,indent=2)+'\n',encoding='utf-8')
print(f'PASS {len(rules)} rule cards, {len(contrasts)} selected color pairs, CSS consistent')
