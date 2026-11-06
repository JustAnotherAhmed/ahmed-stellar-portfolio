import test from 'node:test';
import assert from 'node:assert/strict';
import {SOUNDTRACK_NAME,SPACE_CHORDS,SPACE_MELODY,DEFAULT_SOUND_VOLUME,normalizeVolume,midiToHz,initAmbientAudio,createAmbientEngine,CELESTIAL_CUES,UI_CLICK_CUE,getSoundProfile,readSoundPreference,saveSoundPreference,AUDIO_PREFERENCE_KEY} from './ambient-audio.mjs';

const flush = () => new Promise(resolve => setTimeout(resolve, 5));
class FakeNode extends EventTarget {
  constructor() { super(); this.dataset={};this.attributes={};this.disabled=false;this.textContent='';this.value='34'; }
  setAttribute(key,value){this.attributes[key]=value;}
  getAttribute(key){return this.attributes[key];}
  querySelector(selector){return selector==='[data-ambient-label]' ? this.label : null;}
  click(){this.dispatchEvent(new Event('click'));}
}
class FakeDoc extends EventTarget {
  constructor(){super();this.hidden=false;this.button=new FakeNode();this.button.label=new FakeNode();this.slider=new FakeNode();this.status=new FakeNode();this.nodes={'ambient-toggle':this.button,'ambient-volume':this.slider,'ambient-status':this.status};this.defaultView=new EventTarget();const data=new Map();this.defaultView.localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v))};}
  getElementById(name){return this.nodes[name];}
  clickControl({planet=null,interactive=true}={}){
    const target={dataset:planet?{planetSound:planet}:{},closest:selector=>{
      if(selector.includes('#ambient-toggle'))return null;
      if(selector==='[data-planet-sound]')return planet?target:null;
      if(selector.includes('button, a'))return interactive?target:null;
      return null;
    }};
    const event=new Event('click');Object.defineProperty(event,'target',{value:target});this.dispatchEvent(event);
  }
  press(key='Enter'){const event=new Event('keydown');Object.defineProperty(event,'key',{value:key});this.dispatchEvent(event);}
}
function mockEngine() {
  const calls=[];
  return {calls, async play(){calls.push('play');},async pause(){calls.push('pause');},setVolume(v){calls.push('volume:'+v);},playEffect(cue){calls.push('effect:'+cue);},async dispose(){calls.push('dispose');}};
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

test('distinctive planet cues and safe stored preference',()=>{
  const ids=['sun','mercury','venus','earth','moon','mars','jupiter','saturn','uranus','neptune'];
  assert.deepEqual(Object.keys(CELESTIAL_CUES),ids);
  assert.equal(new Set(ids.map(id=>getSoundProfile(id).notes.join(','))).size,10);
  assert.equal(getSoundProfile('ui'),UI_CLICK_CUE);
  const data=new Map(),store={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
  assert.equal(readSoundPreference(store),true);
  saveSoundPreference(store,false);
  assert.equal(data.get(AUDIO_PREFERENCE_KEY),'off');
  assert.equal(readSoundPreference(store),false);
  assert.equal(readSoundPreference({getItem(){throw Error('blocked');}}),true);
});
test('enabled default starts music on first interaction; uses UI and planet sounds',async()=>{
  const doc=new FakeDoc(),engine=mockEngine(),stop=initAmbientAudio({doc,engineFactory:()=>engine});
  assert.equal(doc.button.getAttribute('aria-pressed'),'true');
  assert.equal(doc.button.label.textContent,'Play sound');
  await flush();
  assert.deepEqual(engine.calls.slice(0,2),['volume:34','play']);
  doc.clickControl();await flush();
  assert.equal(doc.button.dataset.playing,'true');
  assert.deepEqual(engine.calls.slice(0,3),['volume:34','play','effect:ui']);
  doc.clickControl({planet:'earth'});await flush();
  doc.clickControl({planet:'saturn'});await flush();
  assert.deepEqual(engine.calls.filter(x=>x.startsWith('effect:')),['effect:ui','effect:earth','effect:saturn']);
  doc.slider.value='22';doc.slider.dispatchEvent(new Event('input'));
  assert.ok(engine.calls.includes('volume:22'));
  stop();assert.ok(engine.calls.includes('dispose'));
});
test('background tab pauses and foreground automatically resumes when enabled',async()=>{
  const doc=new FakeDoc(),engine=mockEngine(),stop=initAmbientAudio({doc,engineFactory:()=>engine});
  doc.clickControl();await flush();
  doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));await flush();
  assert.equal(doc.button.dataset.playing,'false');
  assert.equal(doc.button.getAttribute('aria-pressed'),'true');
  assert.ok(engine.calls.includes('pause'));
  doc.hidden=false;doc.dispatchEvent(new Event('visibilitychange'));await flush();
  assert.equal(doc.button.dataset.playing,'true');
  assert.equal(engine.calls.filter(x=>x==='play').length,2);
  stop();
});
test('manual mute survives tab switches and blocks UI/planet effects',async()=>{
  const doc=new FakeDoc(),engine=mockEngine(),stop=initAmbientAudio({doc,engineFactory:()=>engine});
  doc.clickControl();await flush();
  doc.button.click();await flush();
  assert.equal(doc.button.getAttribute('aria-pressed'),'false');
  assert.equal(doc.defaultView.localStorage.getItem(AUDIO_PREFERENCE_KEY),'off');
  doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));
  doc.hidden=false;doc.dispatchEvent(new Event('visibilitychange'));await flush();
  doc.clickControl({planet:'moon'});await flush();
  assert.equal(engine.calls.filter(x=>x==='play').length,1);
  assert.ok(!engine.calls.includes('effect:moon'));
  stop();
  const next=initAmbientAudio({doc,engineFactory:()=>mockEngine()});
  assert.equal(doc.button.getAttribute('aria-pressed'),'false');
  next();
});
test('Web Audio start failure does not break the site and can retry',async()=>{
  const doc=new FakeDoc();let attempts=0;
  const stop=initAmbientAudio({doc,engineFactory:()=>({
    setVolume(){},playEffect(){},async play(){attempts++;if(attempts===1)throw Error('NotAllowedError');},async pause(){},async dispose(){}
  })});
  await flush();
  assert.equal(doc.button.dataset.playing,'false');
  assert.match(doc.status.textContent,/browser requires/i);
  doc.press('Enter');await flush();
  assert.equal(doc.button.dataset.playing,'true');
  doc.clickControl({planet:'venus'});await flush();
  stop();
});
test('browser autoplay permission can start soundtrack immediately',async()=>{
  const doc=new FakeDoc(),engine=mockEngine();
  doc.defaultView.navigator={getAutoplayPolicy:()=> 'allowed'};
  const stop=initAmbientAudio({doc,engineFactory:()=>engine});
  await flush();assert.ok(engine.calls.includes('play'));
  stop();
});

test('mobile touchstart unlocks a pending autoplay request without the sound button',async()=>{
  const doc=new FakeDoc(),calls=[];let finish;
  const engine={
    setVolume(value){calls.push('volume:'+value);},
    async play(){calls.push('play');await new Promise(resolve=>{finish=resolve;});},
    unlock(){calls.push('unlock');finish?.();},
    async pause(){calls.push('pause');},
    playEffect(){},
    async dispose(){}
  };
  const stop=initAmbientAudio({doc,engineFactory:()=>engine});
  await flush();
  assert.equal(doc.button.getAttribute('aria-pressed'),'true');
  assert.equal(doc.button.dataset.playing,'false');
  doc.dispatchEvent(new Event('touchstart'));await flush();
  assert.ok(calls.includes('unlock'));
  assert.equal(doc.button.dataset.playing,'true');
  stop();
});
test('touchend and pointerdown can unlock soundtrack without clicking a control',async()=>{
  const doc=new FakeDoc(),engine=mockEngine();
  const stop=initAmbientAudio({doc,engineFactory:()=>engine});
  await flush();
  assert.equal(engine.calls.filter(x=>x==='play').length,1);
  doc.dispatchEvent(new Event('pointerdown'));
  doc.dispatchEvent(new Event('touchend'));await flush();
  assert.equal(doc.button.dataset.playing,'true');
  assert.equal(engine.calls.filter(x=>x==='play').length,1);
  stop();
});
test('remembered mute blocks load-time autoplay and every mobile gesture',async()=>{
  const doc=new FakeDoc(),engine=mockEngine();
  doc.defaultView.localStorage.setItem(AUDIO_PREFERENCE_KEY,'off');
  const stop=initAmbientAudio({doc,engineFactory:()=>engine});
  await flush();
  for(const type of ['pointerdown','touchstart','touchend'])
    doc.dispatchEvent(new Event(type));
  doc.hidden=true;doc.dispatchEvent(new Event('visibilitychange'));
  doc.hidden=false;doc.dispatchEvent(new Event('visibilitychange'));
  await flush();
  assert.deepEqual(engine.calls,[]);
  assert.equal(doc.button.getAttribute('aria-pressed'),'false');
  stop();
});

test('first press on a pending sound button starts playback without muting preference',async()=>{
  const doc=new FakeDoc(),calls=[];let resolvePlay;
  const engine={
    setVolume(v){calls.push('volume:'+v);},
    async play(){calls.push('play');await new Promise(resolve=>{resolvePlay=resolve;});},
    unlock(){calls.push('unlock');resolvePlay?.();},
    async pause(){calls.push('pause');},playEffect(){},async dispose(){}
  };
  const stop=initAmbientAudio({doc,engineFactory:()=>engine});
  await flush();
  assert.equal(doc.button.getAttribute('aria-label'),'Start website soundtrack');
  doc.button.click();await flush();
  assert.ok(calls.includes('unlock'));
  assert.equal(doc.button.getAttribute('aria-pressed'),'true');
  assert.equal(doc.button.dataset.playing,'true');
  doc.button.click();await flush();
  assert.equal(doc.defaultView.localStorage.getItem(AUDIO_PREFERENCE_KEY),'off');
  stop();
});
test('mobile soundtrack can unlock from the cinematic loading screen',async()=>{
  const doc=new FakeDoc(),calls=[];let resolvePlay;
  doc.loaderAudio=new FakeNode();
  doc.nodes['stellar-audio-start']=doc.loaderAudio;
  const engine={
    setVolume(v){calls.push('volume:'+v);},
    async play(){calls.push('play');await new Promise(resolve=>{resolvePlay=resolve;});},
    unlock(){calls.push('unlock');resolvePlay?.();},
    async pause(){},playEffect(){},async dispose(){}
  };
  const stop=initAmbientAudio({doc,engineFactory:()=>engine});
  await flush();
  assert.equal(doc.loaderAudio.hidden,false);
  doc.loaderAudio.click();await flush();
  assert.ok(calls.includes('unlock'));
  assert.equal(doc.loaderAudio.hidden,true);
  assert.equal(doc.button.dataset.playing,'true');
  stop();
});

test('mobile does not create a stuck audio context before a genuine gesture',async()=>{
  const doc=new FakeDoc(),engine=mockEngine();
  doc.defaultView.matchMedia=()=>({matches:true});
  let factories=0;
  const stop=initAmbientAudio({doc,engineFactory:()=>{factories++;return engine;}});
  await flush();
  assert.equal(factories,0);
  assert.equal(doc.button.getAttribute('aria-pressed'),'true');
  assert.equal(doc.button.label.textContent,'Play sound');
  doc.dispatchEvent(new Event('pointerdown'));await flush();
  assert.equal(factories,1);
  assert.equal(doc.button.dataset.playing,'true');
  assert.equal(engine.calls.filter(x=>x==='play').length,1);
  stop();
});
test('mobile sound toggle creates engine inside first click and respects explicit mute',async()=>{
  const doc=new FakeDoc(),calls=[];
  doc.defaultView.matchMedia=()=>({matches:true});
  const stop=initAmbientAudio({doc,engineFactory:()=>({
    setVolume(){},unlock(){calls.push('unlock');},
    async play(){calls.push('play');},
    async pause(){calls.push('pause');},playEffect(){},async dispose(){}
  })});
  await flush();assert.equal(calls.length,0);
  doc.button.click();await flush();
  assert.deepEqual(calls.slice(0,2),['unlock','play']);
  assert.equal(doc.button.dataset.playing,'true');
  doc.button.click();await flush();
  assert.equal(doc.defaultView.localStorage.getItem(AUDIO_PREFERENCE_KEY),'off');
  stop();
});
test('mobile loading-screen CTA can recover a previous off preference',async()=>{
  const doc=new FakeDoc(),engine=mockEngine();
  doc.defaultView.matchMedia=()=>({matches:true});
  doc.loaderAudio=new FakeNode();doc.nodes['stellar-audio-start']=doc.loaderAudio;
  doc.defaultView.localStorage.setItem(AUDIO_PREFERENCE_KEY,'off');
  const stop=initAmbientAudio({doc,engineFactory:()=>engine});
  assert.equal(doc.button.getAttribute('aria-pressed'),'false');
  assert.equal(doc.loaderAudio.hidden,false);
  assert.match(doc.loaderAudio.textContent,/Enable soundtrack/);
  doc.loaderAudio.click();await flush();
  assert.equal(doc.defaultView.localStorage.getItem(AUDIO_PREFERENCE_KEY),'on');
  assert.equal(doc.button.dataset.playing,'true');
  stop();
});
