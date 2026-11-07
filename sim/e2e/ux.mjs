/* global process, console, fetch, setTimeout, document, innerWidth, innerHeight, DOMPoint, getComputedStyle */
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
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
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
 await page.setViewportSize({width:1920,height:1080});await page.getByRole('button',{name:'Fit map'}).click();
 await page.getByLabel('Find space').selectOption('botan');await page.getByLabel('Botan detail',{exact:true}).waitFor();
 check(await page.getByLabel('Botan detail').getByText(/Underground Guerrilla/).count()===1,'inspection exposes full forces');
 await page.screenshot({path:join(shots,'selected-space.png')});await page.getByRole('button',{name:'Close space details'}).click();
 const initial=await page.getByRole('img',{name:'Board'}).getAttribute('viewBox');
 await page.getByRole('button',{name:'Zoom in'}).click();await page.getByRole('img',{name:'Board'}).focus();await page.keyboard.press('ArrowRight');
 check(await page.getByRole('img',{name:'Board'}).getAttribute('viewBox')!==initial,'zoom and keyboard pan');
 await page.getByRole('button',{name:'Fit map'}).click();check(await page.getByRole('img',{name:'Board'}).getAttribute('viewBox')===initial,'fit restores camera');
 await page.getByRole('button',{name:'Zoom in'}).click();
 const beforeClick=await page.getByRole('img',{name:'Board'}).getAttribute('viewBox');
 const hit=await page.locator('[data-info="hakkari"] text.map-label').first().boundingBox();
 if(hit===null)throw new Error('Hakkari label');
 await page.mouse.click(hit.x+hit.width/2,hit.y+hit.height/2);
 check(await page.getByLabel('Hakkari detail',{exact:true}).isVisible(),'mouse selection at zoom');
 check(await page.getByRole('img',{name:'Board'}).getAttribute('viewBox')===beforeClick,'mouse focus preserves camera');
 await page.getByRole('button',{name:'Close space details'}).click();
 await page.getByRole('button',{name:'Fit map'}).click();
 for(const mode of ['Forces','Political','Terrain','Full']) {
  await page.getByRole('button',{name:mode,exact:true}).click();
  check(await page.locator('.atlas-stack').first().isVisible()===(mode==='Forces'||mode==='Full'),'force layer '+mode);
  check(await page.locator('.atlas-political').first().isVisible()===(mode==='Political'||mode==='Full'),'political layer '+mode);
  await page.getByLabel('Find space').selectOption('diyarbakir-city');
  check(await page.getByLabel('Diyarbakir detail',{exact:true}).isVisible(),'inspection in '+mode);await page.getByRole('button',{name:'Close space details'}).click();
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
 check((await page.getByLabel('Botan detail').textContent()).includes('Stress 8'),'dense inspection retains all groups');
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
 check((await page.getByLabel('Europe detail').textContent()).includes('0 to 5'),'external scale is fully inspectable');
 await nativeChecks({chromium,base,shots,check});
 check(errors.length===0,'no browser runtime errors',errors);
}finally{writeFileSync(join(shots,'validation.json'),JSON.stringify(report,null,2));await browser?.close();const exited=server.exitCode===null&&server.signalCode===null?new Promise(r=>server.once('exit',r)):undefined;server.kill();await exited;rmSync(temp,{recursive:true,force:true});}
