/* global process, document, innerWidth, innerHeight, outerWidth, devicePixelRatio */
// Headed X11 checks use native keyboard input, not DPR or page-scale emulation.
import {execFileSync} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createEngine} from '../src/engine/index.ts';
import {coinHandlers} from '../src/engine/coin/handlers.ts';
import {loadPackage,readPackageDir} from '../src/package/load.ts';
import {scriptedPolicy} from '../src/cli/play.ts';

const xkey=String.raw`
import ctypes,sys
x=ctypes.CDLL('libX11.so.6');t=ctypes.CDLL('libXtst.so.6')
x.XOpenDisplay.argtypes=[ctypes.c_char_p];x.XOpenDisplay.restype=ctypes.c_void_p
x.XStringToKeysym.argtypes=[ctypes.c_char_p];x.XStringToKeysym.restype=ctypes.c_ulong
x.XKeysymToKeycode.argtypes=[ctypes.c_void_p,ctypes.c_ulong];x.XKeysymToKeycode.restype=ctypes.c_uint
x.XSetInputFocus.argtypes=[ctypes.c_void_p,ctypes.c_ulong,ctypes.c_int,ctypes.c_ulong]
x.XFlush.argtypes=[ctypes.c_void_p]
t.XTestFakeKeyEvent.argtypes=[ctypes.c_void_p,ctypes.c_uint,ctypes.c_int,ctypes.c_ulong]
d=x.XOpenDisplay(None)
if not d: raise RuntimeError('No X display')
x.XSetInputFocus(d,int(sys.argv[1],0),1,0)
codes=[x.XKeysymToKeycode(d,x.XStringToKeysym(k.encode())) for k in sys.argv[2:]]
for code in codes:t.XTestFakeKeyEvent(d,code,1,0)
for code in reversed(codes):t.XTestFakeKeyEvent(d,code,0,0)
x.XFlush(d)
`;

export async function nativeChecks({chromium,base,shots,check}) {
 if(!process.env.DISPLAY){check(true,'headed native checks not run',{limitation:'Set DISPLAY to an X11 server; requires xwininfo, Python and libXtst. Headless key events do not prove native Escape or browser zoom.'});return;}
 const profile=mkdtempSync(join(tmpdir(),'hob-native-'));
 const context=await chromium.launchPersistentContext(profile,{executablePath:process.env.HOB_CHROMIUM??'/usr/bin/chromium',headless:false,viewport:null,args:['--no-sandbox','--window-size=1920,1080']});
 try {
  const page=context.pages()[0];page.on('dialog',d=>d.accept());
  await page.goto(base);await page.bringToFront();
  const tree=execFileSync('xwininfo',['-root','-tree']).toString();
  const window=tree.split('\n').find(line=>line.includes('Handful of Bandits'))?.trim().split(' ')[0];
  if(!window)throw new Error('X11 Chromium window not found');
  const key=(...keys)=>execFileSync('python3',['-c',xkey,window,...keys]);
  await page.getByRole('button',{name:'Start',exact:true}).click();
  await page.getByRole('button',{name:/Reveal first card/}).click();
  await page.getByRole('heading',{name:'Choose your action'}).waitFor();
  for(const factor of [1,1.25,1.5]){
   if(factor===1)key('Control_L','0');
   if(factor===1.25){key('Control_L','equal');key('Control_L','equal');}
   if(factor===1.5)key('Control_L','equal');
   await page.waitForFunction(f=>Math.abs(devicePixelRatio-f)<.01,factor);
   const geometry=await page.evaluate(()=>({innerWidth,innerHeight,outerWidth,devicePixelRatio,fits:document.documentElement.scrollWidth<=innerWidth}));
   check(geometry.fits&&Math.abs(geometry.outerWidth/geometry.innerWidth-factor)<.01,`native browser zoom ${factor*100}%`,geometry);
   await page.screenshot({path:join(shots,`native-zoom-${factor*100}.png`)});
  }
  key('Control_L','0');await page.waitForFunction(()=>Math.abs(devicePixelRatio-1)<.01);
  await page.getByRole('button',{name:'Fit map',exact:true}).click();
  await page.getByRole('button',{name:'Limited Op',exact:true}).click();
  await page.getByRole('button',{name:'March',exact:true}).click();
  const centre=async name=>{const b=await page.locator('text.map-label',{hasText:name}).first().boundingBox();return {x:b.x+b.width/2,y:b.y+b.height/2};};
  const from=await centre('Hakkari'),to=await centre('Botan');
  await page.mouse.move(from.x,from.y);await page.mouse.down();await page.mouse.move(to.x,to.y,{steps:8});await page.mouse.up();
  const move=page.getByLabel('Move Hakkari to Botan',{exact:true});await move.waitFor();await page.getByLabel('Preview',{exact:true}).waitFor();
  await page.getByLabel('Find space',{exact:true}).selectOption('botan');
  await page.getByRole('button',{name:'Political',exact:true}).click();
  const camera=await page.getByRole('img',{name:'Board'}).getAttribute('viewBox'),draft=await move.textContent();
  await page.locator('[aria-label="Cards"] > summary').click();
  const width=await page.locator('.map-panel').evaluate(el=>el.getBoundingClientRect().width);
  await page.getByRole('button',{name:'Hide actions',exact:true}).click();
  check(await page.getByLabel('Status',{exact:true}).isVisible()&&await page.getByLabel('Resources and politics',{exact:true}).isVisible()&&await page.getByLabel('Forces',{exact:true}).isVisible(),'collapsed actions preserve status, resources and forces');
  check(await page.locator('.map-panel').evaluate(el=>el.getBoundingClientRect().width)>width,'collapsed actions release map width');
  await page.getByRole('button',{name:'Fullscreen',exact:true}).click();await page.waitForFunction(()=>document.fullscreenElement===document.documentElement);
  await page.getByRole('button',{name:'Exit fullscreen',exact:true}).waitFor();
  check(await page.getByRole('button',{name:'Exit fullscreen',exact:true}).isVisible(),'native fullscreen entry and button state');
  await page.screenshot({path:join(shots,'native-fullscreen.png')});
  await page.keyboard.press('?');await page.getByLabel('Help',{exact:true}).waitFor();
  check(await page.getByRole('button',{name:'Close (?)',exact:true}).isVisible(),'Help in fullscreen');
  await page.getByRole('button',{name:'Close (?)',exact:true}).click();
  await page.keyboard.press('h');await page.getByLabel('History',{exact:true}).waitFor();
  const rule=page.getByRole('button',{name:/^Rule text for /}).first();await rule.click();await page.locator('.rule-text').first().waitFor();
  check(true,'History and rule lookup in fullscreen');await page.getByRole('button',{name:'Close (H)',exact:true}).click();
  await page.keyboard.press('n');await page.getByLabel('Note text',{exact:true}).fill('Fullscreen note draft');
  check(await page.getByLabel('Note text',{exact:true}).isVisible(),'notes in fullscreen');
  // Native Escape must exit fullscreen without clearing the unfinished operation.
  key('Escape');await page.waitForFunction(()=>document.fullscreenElement===null);
  await page.getByRole('button',{name:'Fullscreen',exact:true}).waitFor();
  check(await page.getByRole('button',{name:'Fullscreen',exact:true}).isVisible(),'native Escape updates fullscreen state');
  await page.keyboard.press('Escape'); // Close the note, after the browser has exited.
  await page.getByRole('button',{name:'Show actions',exact:true}).click();
  check(await move.textContent()===draft&&await page.getByRole('img',{name:'Board'}).getAttribute('viewBox')===camera,'draft and camera survive native fullscreen and sidebar changes');
  check(await page.getByLabel('Botan detail',{exact:true}).isVisible()&&await page.getByRole('button',{name:'Political',exact:true}).getAttribute('aria-pressed')==='true','selection and display layer survive fullscreen');
  check(await page.getByLabel('Cards',{exact:true}).evaluate(el=>el.open),'supporting disclosure stays open through layout changes');
  await page.getByRole('button',{name:'Fullscreen',exact:true}).click();await page.waitForFunction(()=>!!document.fullscreenElement);
  await page.getByRole('button',{name:'Exit fullscreen',exact:true}).waitFor();
  await page.getByRole('button',{name:'March',exact:true}).hover();
  const tooltip=page.getByRole('tooltip');await tooltip.waitFor();
  check(await tooltip.evaluate(el=>document.fullscreenElement.contains(el)),'tooltip portal in fullscreen');
  await page.mouse.move(0,0);
  await page.getByRole('button',{name:'Exit fullscreen',exact:true}).click();await page.waitForFunction(()=>document.fullscreenElement===null);
  check(true,'native button exit');
  // Reach a real Propaganda decision through legal engine commands, never synthetic state.
  const packages=await (await page.request.get(base+'/api/packages')).json();
  const pkg=packages.find(p=>p.packageId==='kurdish-coin'),loaded=loadPackage(readPackageDir(pkg.dir));if(!loaded.ok)throw new Error('Package did not load');
  const created=await (await page.request.post(base+'/api/sessions',{data:{dir:pkg.dir,scenarioId:'scenario-a',seed:7,name:'Native Propaganda decision'}})).json();
  const engine=createEngine(coinHandlers);let head=created.head,steps=0;
  while(!(head.view.status.phase==='propaganda'&&head.view.status.propagandaPhases[head.view.status.propagandaStep]==='legitimacy'&&head.view.status.emergencyMoves.length>0)){
   if(steps++>2000)throw new Error('No Propaganda choice reached');
   const command=scriptedPolicy(engine,loaded.ruleset,head.state);
   const response=await page.request.post(`${base}/api/sessions/${created.sessionId}/commands`,{data:{command,headActionId:head.actionId,headStateHash:head.stateHash}});if(!response.ok())throw new Error(await response.text());head=(await response.json()).head;
  }
  await page.goto(base);await page.getByRole('row').filter({has:page.locator(`[href="/api/sessions/${created.sessionId}/export"]`)}).getByRole('button',{name:'Resume',exact:true}).click();
  const choice=page.getByLabel('Emergency Rule step',{exact:true});await choice.waitFor();
  check(await choice.getByRole('button').count()>0&&await choice.evaluate(el=>el.closest('details')===null),'required Propaganda choice is directly available');
  await page.getByRole('button',{name:'Fullscreen',exact:true}).click();await page.waitForFunction(()=>!!document.fullscreenElement);
  await choice.scrollIntoViewIfNeeded();await page.screenshot({path:join(shots,'native-fullscreen-decision.png')});
  const chosen=head.view.status.emergencyMoves[0];
  const response=page.waitForResponse(r=>r.url().includes('/commands')&&r.request().method()==='POST');
  await choice.getByRole('button').first().click();check((await response).ok(),'real Propaganda decision submits in fullscreen');
  const next=await (await page.request.get(`${base}/api/sessions/${created.sessionId}`)).json();
  check(next.head.view.status.tracks.find(t=>t.id==='emergencyRule')?.value===chosen,'Propaganda choice updates the real Emergency Rule track');
 }finally{await context.close();rmSync(profile,{recursive:true,force:true});}
}
