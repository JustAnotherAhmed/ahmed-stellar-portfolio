import test from 'node:test';
import assert from 'node:assert/strict';
import {SOUNDTRACK_NAME,SPACE_CHORDS,SPACE_MELODY,DEFAULT_SOUND_VOLUME,normalizeVolume,midiToHz,initAmbientAudio,createAmbientEngine} from './ambient-audio.mjs';

const flush = () => new Promise(resolve => setTimeout(resolve, 5));
class FakeNode extends EventTarget {
  constructor() { super(); this.dataset={};this.attributes={};this.disabled=false;this.textContent='';this.value='34'; }
  setAttribute(key,value){this.attributes[key]=value;}
  getAttribute(key){return this.attributes[key];}
  querySelector(selector){return selector==='[data-ambient-label]' ? this.label : null;}
  click(){this.dispatchEvent(new Event('click'));}
}
class FakeDoc extends EventTarget {
  constructor(){super();this.hidden=false;this.button=new FakeNode();this.button.label=new FakeNode();this.slider=new FakeNode();this.status=new FakeNode();this.nodes={'ambient-toggle':this.button,'ambient-volume':this.slider,'ambient-status':this.status};this.defaultView=new EventTarget();}
  getElementById(name){return this.nodes[name];}
}
function mockEngine() {
  const calls=[];
  return {calls, async play(){calls.push('play');},async pause(){calls.push('pause');},setVolume(v){calls.push('volume:'+v);},async dispose(){calls.push('dispose');}};
}
test('original score includes four chords and an ordered melodic sequence',()=>{
  assert.equal(SOUNDTRACK_NAME,'Orbital Drift');
  assert.equal(SPACE_CHORDS.length,4);
  assert.ok(SPACE_MELODY.length>=12);
  for(const chord of SPACE_CHORDS){assert.ok(chord.length>=4);for(const n of chord)assert.ok(n>=30&&n<=90);}
  assert.equal(midiToHz(69),440);
  assert.ok(DEFAULT_SOUND_VOLUME>0&&DEFAULT_SOUND_VOLUME<60);
});
test('volume is clamped and handles invalid input safely',()=>{
  assert.equal(normalizeVolume(34),0.34);
  assert.equal(normalizeVolume(-8),0);
  assert.equal(normalizeVolume(120),1);
  assert.equal(normalizeVolume('nonsense'),0);
});
test('audio engine reports unavailable Web Audio gracefully',()=>{
  assert.throws(()=>createAmbientEngine({AudioContextCtor:null}),/Web Audio/);
});
test('soundtrack is silent until explicit click, toggles, and obeys volume control',async()=>{
  const doc=new FakeDoc(),engine=mockEngine();
  const stop=initAmbientAudio({doc,engineFactory:()=>engine});
  assert.deepEqual(engine.calls,[]);
  assert.equal(doc.button.getAttribute('aria-pressed'),'false');
  assert.equal(doc.button.label.textContent,'Sound off');
  doc.button.click();await flush();
  assert.equal(doc.button.getAttribute('aria-pressed'),'true');
  assert.equal(doc.button.label.textContent,'Sound on');
  assert.deepEqual(engine.calls.slice(0,2),['volume:34','play']);
  doc.slider.value='22'; doc.slider.dispatchEvent(new Event('input'));
  assert.ok(engine.calls.includes('volume:22'));
  doc.button.click();await flush();
  assert.equal(doc.button.getAttribute('aria-pressed'),'false');
  assert.ok(engine.calls.includes('pause'));
  stop(); assert.ok(engine.calls.includes('dispose'));
});
test('ambient music pauses when the browser tab becomes hidden',async()=>{
  const doc=new FakeDoc(),engine=mockEngine();
  const stop=initAmbientAudio({doc,engineFactory:()=>engine});
  doc.button.click();await flush();
  doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));await flush();
  assert.equal(doc.button.getAttribute('aria-pressed'),'false');
  assert.ok(doc.status.textContent.includes('left the tab'));
  stop();
});
test('audio start failure never blocks the page and provides a retry',async()=>{
  const doc=new FakeDoc();let attempts=0;
  const stop=initAmbientAudio({doc,engineFactory:()=>({
    setVolume(){},async play(){attempts++;if(attempts===1)throw new Error('NotAllowedError');},async pause(){},async dispose(){}
  })});
  doc.button.click();await flush();
  assert.equal(doc.button.getAttribute('aria-pressed'),'false');
  assert.match(doc.status.textContent,/could not start/i);
  doc.button.click();await flush();
  assert.equal(doc.button.getAttribute('aria-pressed'),'true');
  stop();
});