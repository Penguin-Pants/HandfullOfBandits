/* global process, console, fetch, setTimeout, document, innerWidth, innerHeight, scrollX, scrollY, DOMPoint, getComputedStyle */
// Real browser checks. Build first; optional Playwright must be available in NODE_PATH.
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdtempSync,mkdirSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {nativeChecks} from './native.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const temp=mkdtempSync(join(tmpdir(),'hob-ux-'));
const shots=process.env.HOB_SCREENSHOTS ?? '../docs/ux-overhaul/screenshots';
mkdirSync(shots,{recursive:true});
const base='http://127.0.0.1:5200';
const server=spawn(process.execPath,['src/main.ts'],{env:{...process.env,HOB_DB:join(temp,'test.sqlite'),PORT:'5200'},stdio:'inherit'});
const report=[];
function check(ok,name,detail=null){report.push({name,ok,detail});if(!ok)throw new Error(`${name}: ${JSON.stringify(detail)}`);console.log(`ok ${name}`);}
let browser;
try {
 for(let i=0;i<50;i++){try{if((await fetch(base+'/api/packages')).ok)break;}catch{/* Server may still be starting. */}await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.launch({executablePath:process.env.HOB_CHROMIUM ?? '/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1920,height:1080}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('dialog',d=>d.accept());
 await page.goto(base);await page.getByRole('button',{name:'Start',exact:true}).click();await page.getByRole('button',{name:/Reveal first card/}).click();
 await page.getByRole('heading',{name:'Choose your action'}).waitFor();
 const geometry=await page.evaluate(()=>{
  const svg=document.querySelector('[aria-label="Board"]'),outside=[],collisions=[];
  for(const info of svg.querySelectorAll('[data-info]:not([data-callout])')) {
   const area=svg.querySelector(`.map-space[data-space="${info.dataset.info}"] .atlas-area`);
   for(const el of info.querySelectorAll('text,rect,circle,polygon')) {
    const b=el.getBBox(),m=area.getCTM().inverse().multiply(el.getCTM());
    for(const [x,y] of [[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]])if(!area.isPointInFill(new DOMPoint(x,y).matrixTransform(m)))outside.push(`${info.dataset.info}: ${el.textContent}`);
   }
  }
  for(const info of svg.querySelectorAll('[data-info]')) {
   const texts=[...info.querySelectorAll('text')];
   for(let i=0;i<texts.length;i++)for(let j=i+1;j<texts.length;j++) {
    const a=texts[i].getBoundingClientRect(),b=texts[j].getBoundingClientRect();
    if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1)collisions.push(`${info.dataset.info}: ${texts[i].textContent} / ${texts[j].textContent}`);
   }
  }
  for(const track of svg.querySelectorAll('[data-track-space]')) {
   const area=svg.querySelector(`.map-space[data-space="${track.dataset.trackSpace}"] .atlas-area`);
   const b=track.querySelector('rect').getBBox();
   for(const [x,y] of [[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]])if(!area.isPointInFill(new DOMPoint(x,y)))outside.push(`track ${track.dataset.trackSpace}`);
  }
  return {outside,collisions};
 });
 check(geometry.collisions.length===0,'no overlapping map text',geometry);
 check(geometry.outside.length===0,'interior contents remain in their regions',geometry);
 check(await page.locator('.atlas-overflow').count()===0,'normal setup shows every force and marker group');
 for(const [width,height,label] of [[1920,1080,'1920'],[1536,864,'1536'],[2560,1440,'2560'],[1366,768,'1366']]) {
  await page.setViewportSize({width,height});await page.reload();await page.getByRole('button',{name:'Resume',exact:true}).first().click();
  await page.getByRole('heading',{name:'Choose your action'}).waitFor();
  const metrics=await page.evaluate(()=>{
   const svg=document.querySelector('[aria-label="Board"]'),texts=[...svg.querySelectorAll('.atlas-label:not(.city-name)')],scale=svg.getScreenCTM().a;
   return {fits:document.documentElement.scrollWidth<=innerWidth&&document.documentElement.scrollHeight<=innerHeight,labelMin:Math.min(...texts.map(t=>parseFloat(getComputedStyle(t).fontSize)*scale)),mapHeight:svg.getBoundingClientRect().height,task:document.querySelector('[aria-label="Next action"]').getBoundingClientRect().bottom<=innerHeight};
  });
  check(metrics.fits&&metrics.task,'viewport '+label,metrics);check(metrics.labelMin>=18,'readable names '+label,metrics);
  const readable=await page.evaluate(()=>({text:parseFloat(getComputedStyle(document.querySelector('.play-screen')).fontSize),instructions:parseFloat(getComputedStyle(document.querySelector('.next-task p')).fontSize),controls:[...document.querySelectorAll('.map-navigation button')].every(b=>parseFloat(getComputedStyle(b).fontSize)>=16&&b.scrollWidth<=b.clientWidth+1)}));
  check(readable.text>=16&&readable.instructions>=18&&readable.controls,'readable windowed UI '+label,readable);
  await page.screenshot({path:join(shots,`after-${label}.png`)});
  const camera=await page.getByRole('img',{name:'Board'}).getAttribute('viewBox');
  await page.getByRole('button',{name:'Hide actions',exact:true}).click();
  check(await page.getByLabel('Status',{exact:true}).isVisible()&&await page.getByLabel('Forces',{exact:true}).isVisible(),'collapsed status and forces '+label);
  check(await page.getByRole('img',{name:'Board'}).getAttribute('viewBox')===camera,'camera retained '+label);
  await page.screenshot({path:join(shots,`after-${label}-collapsed.png`)});
  await page.getByRole('button',{name:'Show actions',exact:true}).click();

 }

 // Phase 3: board-first full-window layout and wheel and drag navigation at the two target sizes.
 for(const [width,height,label] of [[1920,1080,'1920'],[1366,768,'1366']]) {
  await page.setViewportSize({width,height});await page.reload();await page.getByRole('button',{name:'Resume',exact:true}).first().click();
  await page.getByRole('heading',{name:'Choose your action'}).waitFor();await page.waitForTimeout(300);
  const measure=()=>page.evaluate(()=>{
   const rect=sel=>document.querySelector(sel)?.getBoundingClientRect(),board=rect('[aria-label="Board"]'),root=document.documentElement;
   return {ratio:board.width*board.height/(innerWidth*innerHeight),noScroll:root.scrollWidth<=innerWidth&&root.scrollHeight<=innerHeight&&scrollX===0&&scrollY===0,toolbar:rect('.map-navigation').height,track:rect('.track-card')?.height??0,side:rect('aside.side')?.width??0,navWidth:rect('.map-navigation').width,uncovered:(board.width*board.height-['aside.side','.track-card','.map-caption','.forces-bar','.space-inspector'].reduce((sum,sel)=>{const r=rect(sel);return r===undefined?sum:sum+Math.max(0,Math.min(r.right,board.right)-Math.max(r.left,board.left))*Math.max(0,Math.min(r.bottom,board.bottom)-Math.max(r.top,board.top));},0))/(innerWidth*innerHeight)};
  });
  const open=await measure();
  check(open.noScroll,'no page scroll, panels open '+label,open);
  check(open.toolbar<=(width>=1900?48:96),'compact toolbar (one row at 1920, two at 1366) '+label,open);
  if(width>=1900){check(open.ratio>=.6,'board covers 60% of the window with panels open '+label,open);check(open.side<=420&&open.track<=60,'side panel and track card compact '+label,open);}
  else {check(open.side<=360,'side panel width '+label,open);check(open.uncovered>=.6,'uncovered board is 60% of the window with the overlay side panel open '+label,open);check(open.navWidth>=width-12,'side panel takes no layout column: the toolbar has the full width '+label,open);}
  await page.screenshot({path:join(shots,`board-first-${label}-panels.png`)});
  await page.getByRole('button',{name:'Map only (M)',exact:true}).click();await page.waitForTimeout(200);
  const only=await measure();
  check(only.noScroll&&only.ratio>=.85,'board covers 85% of the window in Map only '+label,only);
  await page.screenshot({path:join(shots,`board-first-${label}-maponly.png`)});
  await page.getByRole('button',{name:'Show panels (M)',exact:true}).click();await page.getByRole('button',{name:'Fit map'}).click();
  const board=page.getByRole('img',{name:'Board'}),zoom=page.getByLabel('Map zoom'),box=await board.boundingBox();
  const px=box.x+box.width/2+120,py=box.y+box.height/2+60;
  const under=()=>board.evaluate((svg,[x,y])=>{const p=new DOMPoint(x,y).matrixTransform(svg.getScreenCTM().inverse());return [p.x,p.y];},[px,py]);
  const was=await under(),zoomWas=await zoom.textContent();
  await page.mouse.move(px,py);await page.mouse.wheel(0,-100);await page.waitForTimeout(150);
  check(await zoom.textContent()!==zoomWas&&await page.evaluate(()=>scrollY)===0,'wheel over the board zooms and the page does not scroll '+label,{zoomWas,now:await zoom.textContent()});
  const now=await under();
  check(Math.hypot(now[0]-was[0],now[1]-was[1])<3,'wheel zoom keeps the point under the pointer '+label,{was,now});
  // A small centered zoom keeps the board margin in view, so a background start point exists at every window size.
  await page.getByRole('button',{name:'Fit map'}).click();await page.getByRole('button',{name:'Zoom in'}).click();await page.getByRole('button',{name:'Zoom in'}).click();await page.waitForTimeout(150);
  const before=await board.getAttribute('viewBox');
  const start=await page.evaluate(()=>{const b=document.querySelector('[aria-label="Board"]').getBoundingClientRect();for(let x=b.left+20;x<b.right-20;x+=9)for(let y=b.top+20;y<b.bottom-20;y+=9){const el=document.elementFromPoint(x,y);if(el&&el.closest('[data-space]')===null&&!el.closest('[role="meter"]'))return [x,y];}return null;});
  check(start!==null,'board background point found '+label);
  await page.mouse.move(start[0],start[1]);await page.mouse.down();await page.mouse.move(start[0]+80,start[1]+40,{steps:5});await page.mouse.up();
  check(await board.getAttribute('viewBox')!==before&&await page.locator('[aria-label$=" detail"]').count()===0,'background drag pans without selecting a space '+label);
  for(let i=0;i<12;i++){await page.mouse.wheel(0,-100);}await page.waitForTimeout(150);
  check(await zoom.textContent()==='400%','wheel zoom stops at 400% '+label);
  await page.screenshot({path:join(shots,`board-first-${label}-zoomed.png`)});
  await page.getByRole('button',{name:'Fit map'}).click();
 }
 await page.setViewportSize({width:1920,height:1080});await page.getByRole('button',{name:'Fit map'}).click();
 const europe=page.getByRole('meter',{name:'Europe track',exact:true});
 check((await europe.locator('[data-track-value]').allTextContents()).join(',')==='5,4,3,2,1,0','Europe has six descending track nodes');
 check(await europe.locator('[aria-current="true"]').getAttribute('data-track-value')===await europe.getAttribute('aria-valuenow'),'Europe marker matches the current value');
 await page.screenshot({path:join(shots,'europe-vertical-overview.png')});
 await page.getByRole('button',{name:'Zoom in'}).click();await page.getByRole('button',{name:'Zoom in'}).click();
 await europe.focus();
 const europeFits=await europe.evaluate(el=>{
  const board=el.ownerSVGElement.getBoundingClientRect();
  return [...el.querySelectorAll('circle')].every(node=>{const b=node.getBoundingClientRect();return b.left>=board.left&&b.right<=board.right&&b.top>=board.top&&b.bottom<=board.bottom;});
 });
 check(europeFits,'keyboard focus brings the entire Europe scale into view');
 check(await page.locator('[data-space="europe"]').count()===0,'Europe has no playable hit area');
 await page.screenshot({path:join(shots,'europe-vertical-focused.png')});
 await page.getByRole('button',{name:'Fit map'}).click();
 await page.getByLabel('Find space').selectOption('botan');
 // The pointer leaves the map first, so the space under it does not take the tooltip.
 const hoverText=async id=>{await page.mouse.move(0,0);await page.locator('[data-space="'+id+'"]').first().focus();return page.getByRole('tooltip').innerText();};
 check(/Underground Guerrilla/.test(await hoverText('botan')),'hover text exposes full forces');
 check(await page.locator('.space-inspector').count()===0,'selection opens no detail panel');
 // The focus from hoverText opens a tooltip. Escape closes it before the hover check.
 await page.keyboard.press('Escape');check(await page.getByRole('tooltip').count()===0,'Escape closes the focus tooltip');
 const vanBox=await page.locator('[data-space="van-bitlis"]').first().boundingBox();
 await page.mouse.move(vanBox.x+vanBox.width/2,vanBox.y+vanBox.height/2);await page.mouse.move(vanBox.x+vanBox.width/2+4,vanBox.y+vanBox.height/2+4);
 check(await page.getByRole('tooltip').count()===0,'pointer hover opens no tooltip');
 await page.mouse.click(vanBox.x+vanBox.width/2,vanBox.y+vanBox.height/2,{button:'right'});
 check((await page.getByRole('tooltip').innerText()).startsWith('Van-Bitlis'),'right-click opens the tooltip');
 await page.keyboard.press('Escape');check(await page.getByRole('tooltip').count()===0,'Escape closes the tooltip');
 await page.screenshot({path:join(shots,'selected-space.png')});
 const initial=await page.getByRole('img',{name:'Board'}).getAttribute('viewBox');
 await page.getByRole('button',{name:'Zoom in'}).click();await page.getByRole('img',{name:'Board'}).focus();await page.keyboard.press('ArrowRight');
 check(await page.getByRole('img',{name:'Board'}).getAttribute('viewBox')!==initial,'zoom and keyboard pan');
 await page.getByRole('button',{name:'Fit map'}).click();check(await page.getByRole('img',{name:'Board'}).getAttribute('viewBox')===initial,'fit restores camera');
 await page.getByRole('button',{name:'Zoom in'}).click();
 const beforeClick=await page.getByRole('img',{name:'Board'}).getAttribute('viewBox');
 const hit=await page.locator('[data-info="hakkari"] text.map-label').first().boundingBox();
 if(hit===null)throw new Error('Hakkari label');
 await page.mouse.click(hit.x+hit.width/2,hit.y+hit.height/2);
 check(await page.getByRole('button',{name:'Hakkari',exact:true}).getAttribute('aria-pressed')==='true','mouse selection at zoom');
 check(await page.getByRole('img',{name:'Board'}).getAttribute('viewBox')===beforeClick,'mouse focus preserves camera');
 await page.getByRole('button',{name:'Fit map'}).click();
 for(const mode of ['Forces','Political','Terrain','Full']) {
  await page.getByRole('button',{name:mode,exact:true}).click();
  check(await page.locator('.atlas-stack').first().isVisible()===(mode==='Forces'||mode==='Full'),'force layer '+mode);
  check(await page.locator('.atlas-political').first().isVisible()===(mode==='Political'||mode==='Full'),'political layer '+mode);
  await page.getByLabel('Find space').selectOption('diyarbakir-city');
  check((await hoverText('diyarbakir-city')).startsWith('Diyarbakir'),'inspection in '+mode);
 }
 await page.getByRole('button',{name:'Limited Op',exact:true}).click();await page.getByRole('button',{name:'March',exact:true}).click();
 await page.locator('.map-space.eligible').first().waitFor({state:'attached'});
 check(await page.locator('.map-space.eligible').count()>0&&await page.locator('.map-space.ineligible').count()>0,'server candidate highlighting');
 await page.getByRole('button',{name:'Clear (Esc)'}).click();
 // Synthetic view stress case. Engine state is neither mocked nor written.
 let stressMode='dense';
 await page.route(/\/api\/sessions\/[^/]+$/,async route=>{
  const response=await route.fetch(),json=await response.json();
  if(json.head?.view && stressMode==='dense')for(const s of json.head.view.spaces)if(s.id==='botan'){
   s.markers=Array.from({length:9},(_,i)=>({marker:`stress${i}`,side:'old',count:i+1,hidden:false}));s.pieces=s.pieces.map(p=>({...p,count:12}));s.level=-2;s.levelName='activeOpposition';s.control='pkk';
  }
  if(json.head?.view && stressMode==='empty')for(const s of json.head.view.spaces){s.pieces=[];s.markers=[];s.control=null;}
  if(json.head?.view && stressMode==='legacy')json.head.view.spaces.find(s=>s.id==='hakkari').x-=20;
  await route.fulfill({response,json});
 });
 await page.reload();await page.getByRole('button',{name:'Resume',exact:true}).first().click();await page.getByLabel('Find space').selectOption('botan');
 check(await page.locator('[data-info="botan"] .atlas-overflow').count()===1,'dense overflow is explicit');
 check((await hoverText('botan')).includes('Stress 8'),'dense inspection retains all groups');
 await page.screenshot({path:join(shots,'dense-state.png')});
 stressMode='empty';await page.reload();await page.getByRole('button',{name:'Resume',exact:true}).first().click();
 await page.getByRole('heading',{name:'Choose your action'}).waitFor();
 check(await page.locator('.atlas-stack').count()===0,'empty spaces retain labels without phantom forces');
 await page.screenshot({path:join(shots,'empty-state.png')});
 stressMode='legacy';await page.reload();await page.getByRole('button',{name:'Resume',exact:true}).first().click();
 await page.getByRole('heading',{name:'Choose your action'}).waitFor();
 check(await page.locator('.atlas-area').count()===0,'older coordinate snapshots use schematic fallback');
 await page.getByRole('button',{name:'Terrain',exact:true}).click();
 check(await page.locator('.force-layer').first().isVisible()===false,'legacy Terrain hides forces');
 check(await page.locator('.political-layer').first().isVisible()===false,'legacy Terrain hides alignment');
 await page.getByRole('button',{name:'Full',exact:true}).click();
 check(await page.locator('.force-layer').first().isVisible(),'legacy Full restores forces');
 await page.getByLabel('Find space').selectOption('europe');
 check(await page.getByRole('meter',{name:'Europe track'}).getAttribute('aria-valuemin')==='0'&&await page.getByRole('meter',{name:'Europe track'}).getAttribute('aria-valuemax')==='5','Europe scale remains readable in legacy layouts');
 await nativeChecks({chromium,base,shots,check});
 check(errors.length===0,'no browser runtime errors',errors);
}finally{writeFileSync(join(shots,'validation.json'),JSON.stringify(report,null,2));await browser?.close();const exited=server.exitCode===null&&server.signalCode===null?new Promise(r=>server.once('exit',r)):undefined;server.kill();await exited;rmSync(temp,{recursive:true,force:true});}
