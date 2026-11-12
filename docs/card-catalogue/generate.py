#!/usr/bin/env python3
"""Regenerate the review PDF and offline HTML from catalogue.json."""
import json,html,os,math
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor,white
from reportlab.lib.utils import simpleSplit
D=os.path.dirname(os.path.abspath(__file__))
cards=json.load(open(D+'/catalogue.json',encoding='utf8'))['cards']
pdfmetrics.registerFont(TTFont('DejaVu','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuItalic','/usr/share/fonts/truetype/dejavu/DejaVuSans-Oblique.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuBold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
W,H=95*mm,140*mm; PAGEW,PAGEH=A4; x0=(PAGEW-2*W)/2; y0=(PAGEH-2*H)/2
c=canvas.Canvas(D+'/cards-a4.pdf',pagesize=A4,pageCompression=1); c.setTitle('Card catalogue: design review')
minfont=99; overflow=[]
def lines(text,font,size,width):
 return sum([simpleSplit(p or ' ',font,size,width) for p in text.split('\n')],[])
for i,card in enumerate(cards):
 if i and i%4==0:c.showPage()
 slot=i%4; x=x0+(slot%2)*W;y=PAGEH-y0-H-(slot//2)*H
 c.setStrokeColor(HexColor('#989898'));c.setLineWidth(.35);c.rect(x,y,W,H)
 # crop guides beyond the card edges
 c.setStrokeColor(HexColor('#777777'))
 for xx in [x,x+W]:
  for yy,sg in [(y,-1),(y+H,1)]:
   c.line(xx,yy+sg*1*mm,xx,yy+sg*2.5*mm)
 c.setFillColor(HexColor('#1b292c'));c.rect(x+1*mm,y+H-17*mm,W-2*mm,16*mm,fill=1,stroke=0)
 c.setFillColor(white);c.setFont('DejaVuBold',8);c.drawString(x+4*mm,y+H-6*mm,card['id']+'  /  '+card['campaign']+'  /  '+card['type'].upper())
 title=lines(card['title'],'DejaVuBold',10,W-8*mm)
 for n,line in enumerate(title[:2]):c.drawString(x+4*mm,y+H-(11+n*4)*mm,line)
 if len(title)>2:overflow.append((card['id'],'title'))
 top=y+H-20*mm
 c.setFillColor(HexColor('#e5e7e3'));c.rect(x+4*mm,top-13*mm,W-8*mm,13*mm,fill=1,stroke=0)
 c.setFillColor(HexColor('#55615e'));c.setFont('DejaVuBold',8);c.drawCentredString(x+W/2,top-7.5*mm,'IMAGE PLACEHOLDER')
 blocks=[]; p=card['printed']
 if p['flavor']:blocks.append(('FLAVOR',p['flavor']))
 if p['always']:blocks.append(('ALWAYS · SOURCE NOTE',p['always']))
 if p['unshaded']:blocks.append(('PROPAGANDA' if card['type']=='propaganda' else ('PIVOTAL' if card['type']=='pivotal' else 'UNSHADED'),p['unshaded']))
 if p['shaded']:blocks.append(('SHADED',p['shaded']))
 if card['id']=='DK-016':blocks.append(('TEXT MISSING','No printed instruction in package. See reference report.'))
 avail=H-39*mm; width=W-10*mm
 for size in [9,8.5,8,7.5,7,6.5,6]:
  h=sum((len(lines(t,'DejaVuItalic' if label=='FLAVOR' else 'DejaVu',size,width))*(size*1.2)+size*1.7+3) for label,t in blocks)
  if h<=avail:break
 minfont=min(minfont,size)
 if h>avail:overflow.append((card['id'],'body'))
 yy=top-17*mm
 for label,t in blocks:
  c.setFillColor(HexColor('#8d4935') if label=='SHADED' else HexColor('#23605c') if 'ALWAYS' in label else HexColor('#444f4a'))
  c.setFont('DejaVuBold',size);c.drawString(x+5*mm,yy,label);yy-=size*1.35
  font='DejaVuItalic' if label=='FLAVOR' else 'DejaVu'
  c.setFillColor(HexColor('#18201e'));c.setFont(font,size)
  for line in lines(t,font,size,width):c.drawString(x+5*mm,yy,line);yy-=size*1.2
  yy-=3
c.save()
# Digital reference uses identical text from the catalogue and adds the structured data.
esc=lambda s:html.escape(str(s))
parts=['<!doctype html><html lang="en"><meta charset="utf-8"><title>Card catalogue</title><style>body{font:16px system-ui;background:#e7ebe7;color:#172421;max-width:1100px;margin:auto;padding:2rem}input{font:inherit;padding:.6rem;width:90%}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(310px,1fr));gap:1rem}article{background:white;border:1px solid #adbab3;padding:1rem;border-radius:.4rem}h2{font-size:1.1rem}small{color:#42625b}.img{background:#e4e8e3;text-align:center;color:#53635e;margin:0;overflow:hidden}.img img{width:100%;height:190px;object-fit:contain;display:block}.img figcaption{font-size:.75rem;line-height:1.35;padding:.45rem;background:#f2f4f1}.placeholder{padding:2.5rem}h3{font-size:.8rem;letter-spacing:.06em;color:#376057;margin-bottom:.3rem}.shade{color:#984733}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:.75rem}p{line-height:1.45}</style><h1>Card catalogue</h1><p>99 cards · package wording · image captions distinguish contextual illustrations from event photographs. Search by title, ID or text.</p><input id="q" placeholder="Search cards" oninput="for(const a of document.querySelectorAll(\'article\'))a.hidden=!a.textContent.toLowerCase().includes(this.value.toLowerCase())"><p></p><main class="grid">']
for a in cards:
 parts.append('<article><small>'+esc(a['id']+' / '+a['campaign']+' / '+a['type'])+'</small><h2>'+esc(a['title'])+'</h2>')
 img=a['image']
 if img.get('path'):
  parts.append('<figure class="img"><img src="'+esc(img['path'])+'" alt="'+esc(img['caption'])+'"><figcaption>'+esc(img['caption'])+' <a href="'+esc(img['source_page'])+'">Source</a> · '+esc(img['creator'])+' · <a href="'+esc(img['license_url'])+'">'+esc(img['license'])+'</a></figcaption></figure>')
 else:parts.append('<div class="img placeholder">IMAGE PLACEHOLDER</div>')
 for key,label in [('flavor','Flavor'),('always','Always · Source note'),('unshaded','Propaganda' if a['type']=='propaganda' else 'Pivotal' if a['type']=='pivotal' else 'Unshaded'),('shaded','Shaded')]:
  if a['printed'][key]:parts.append('<h3 class="'+('shade' if key=='shaded' else '')+'">'+label.upper()+'</h3><p'+(' style="font-style:italic"' if key=='flavor' else '')+'>'+esc(a['printed'][key])+'</p>')
 if a['unresolved_questions']:parts.append('<h3>UNRESOLVED</h3><p>'+esc(' '.join(a['unresolved_questions']))+'</p>')
 parts.append('<details><summary>Implementation and sources</summary><pre>'+esc(json.dumps({'implementation':a['implementation'],'sources':a['source_references']},ensure_ascii=False,indent=2))+'</pre></details></article>')
parts.append('</main></html>');open(D+'/index.html','w',encoding='utf8').write(''.join(parts))
print('Generated',len(cards),'cards; minimum body font:',minfont,'pt; overflow:',overflow)
if overflow:raise SystemExit(1)
