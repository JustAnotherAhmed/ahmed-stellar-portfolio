import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createLaunchGate} from './launch-gate.mjs';
const read=name=>readFileSync(new URL(name,import.meta.url),'utf8');
class Target{
  constructor(){this.hidden=true;this.inert=false;this.handlers=new Map();this.classList={names:new Set(),
    add:name=>this.classList.names.add(name),remove:name=>this.classList.names.delete(name)};}
  addEventListener(name,fn){this.handlers.set(name,fn);}
  removeEventListener(name){this.handlers.delete(name);}
  click(){this.handlers.get('click')?.();}
  querySelector(name){return this.items?.[name]||null;}
}
function mockDoc(){
 const root=new Target(),text={textContent:''},meter={value:0,max:0},skip=new Target();
 const header=new Target(),main=new Target(),body=new Target();
 root.items={'#stellar-loader-message':text,'#stellar-loader-meter':meter,'#stellar-loader-skip':skip};
 return {root,text,meter,skip,header,main,body,
   document:{body,querySelector:key=>key==='header'?header:null,
   getElementById:key=>key==='stellar-loader'?root:key==='main'?main:null}
 };
}
test('stages high-quality scene behind keyboard-accessible loading dialog',()=>{
 const t=mockDoc(),pending=[];
 const gate=createLaunchGate({doc:t.document,schedule:fn=>{pending.push(fn);return 1;},cancel:()=>{}});
 gate.open(12);
 assert.equal(t.root.hidden,false);
 assert.equal(t.header.inert,true);
 assert.equal(t.main.inert,true);
 assert.equal(t.meter.max,12);
 gate.progress(5,12);
 assert.equal(t.meter.value,5);
 assert.match(t.text.textContent,/5 of 12/);
 pending[0]();
 assert.equal(t.skip.hidden,false);
 t.skip.click();
 assert.equal(t.root.hidden,true);
 assert.equal(t.header.inert,false);
 assert.equal(t.main.inert,false);
});
test('completion or failure can release the screen, and repeated cleanup is safe',()=>{
 const t=mockDoc();
 const gate=createLaunchGate({doc:t.document,schedule:()=>1,cancel:()=>{}});
 gate.open(10);gate.progress(10,10,1);
 assert.match(t.text.textContent,/fallback artwork/);
 gate.close();gate.dispose();
 assert.equal(t.root.hidden,true);
 assert.equal(t.skip.handlers.size,0);
});
test('gate never blocks pages without the optional UI',()=>{
 const gate=createLaunchGate({doc:{getElementById:()=>null}});
 assert.doesNotThrow(()=>{gate.open(12);gate.progress(5,12);gate.close();gate.dispose();});
});
test('solar scene waits for atlas completion and pre-renders before reveal',()=>{
 const solar=read('solar-system.mjs'),queue=read('texture-queue.mjs'),html=read('index.html');
 assert.match(solar,/launchGate\.open\(SOLAR_BODIES\.length\+2\)/);
 assert.match(solar,/onComplete:\(\)=>\{/);
 assert.match(solar,/launchGate\.close\(\)/);
 assert.match(solar,/maxConcurrent:2,delayMs:180/);
 assert.match(queue,/onSettled/);
 assert.match(html,/id="stellar-loader-meter"/);
 assert.match(html,/id="stellar-loader-skip"/);
});
