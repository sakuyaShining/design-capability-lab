from pathlib import Path
import argparse
import json

ROOT=Path(__file__).resolve().parents[1]
DIR=ROOT/'standards/interface-capability'
parser = argparse.ArgumentParser()
parser.add_argument('--check', action='store_true')
parser.add_argument('--report', type=Path)
args = parser.parse_args()
data=json.loads((DIR/'tokens.json').read_text(encoding='utf-8'))
rules=json.loads((DIR/'rules.json').read_text(encoding='utf-8'))['rules']
required=['id','kind','status','version','problem','applies_when','avoid_when','decision','invariants','freedom','anti_pattern','evidence_summary','validation','limitations']
assert len({r['id'] for r in rules})==len(rules)
for r in rules:
    assert all(r.get(k) for k in required),r['id']
    assert all(source['url'].startswith('https://') and source['title'] for source in r['public_sources']), r['id']
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
if args.check:
    assert (DIR/'tokens.css').read_text(encoding='utf-8')==css,'Regenerate tokens.css'
else:(DIR/'tokens.css').write_text(css,encoding='utf-8',newline='\n')
record={'date':'2026-11-11','rule_count':len(rules),'selected_token_contrasts':contrasts,'scope':'selected solid pairs only, not whole-page accessibility certification'}
if args.report:
    report = (ROOT / args.report).resolve()
    assert report.is_relative_to(ROOT), 'Report must be inside the project'
    report.parent.mkdir(parents=True, exist_ok=True)
    report.write_text(json.dumps(record, indent=2)+'\n', encoding='utf-8')
print(f'PASS {len(rules)} rule cards, {len(contrasts)} selected color pairs, CSS consistent')
