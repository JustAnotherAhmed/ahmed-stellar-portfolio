/**
 * ORBITAL DRIFT — original ambient music composed algorithmically.
 * No recordings, samples, licensed soundtrack, downloads, or external APIs.
 * Sound is enabled by preference. Browsers may require a first visitor gesture.
 */
export const SOUNDTRACK_NAME = 'Orbital Drift';
export const DEFAULT_SOUND_VOLUME = 34;
/** Distinct original musical signatures for the Sun, eight planets, and Moon. */
export const CELESTIAL_CUES = Object.freeze({
  sun:     Object.freeze({notes:[72,79,84],wave:'sine',duration:.65,peak:.11}),
  mercury: Object.freeze({notes:[84,88,91],wave:'triangle',duration:.19,peak:.12}),
  venus:   Object.freeze({notes:[72,76,81],wave:'sine',duration:.43,peak:.10}),
  earth:   Object.freeze({notes:[67,74,79],wave:'triangle',duration:.37,peak:.12}),
  moon:    Object.freeze({notes:[62,69,74],wave:'sine',duration:.53,peak:.10}),
  mars:    Object.freeze({notes:[60,63,70],wave:'sawtooth',duration:.24,peak:.055}),
  jupiter: Object.freeze({notes:[43,50,55],wave:'sine',duration:.56,peak:.13}),
  saturn:  Object.freeze({notes:[64,71,78,83],wave:'triangle',duration:.58,peak:.09}),
  uranus:  Object.freeze({notes:[73,80,85],wave:'sine',duration:.46,peak:.10}),
  neptune: Object.freeze({notes:[54,61,68],wave:'triangle',duration:.64,peak:.10}),
});
export const UI_CLICK_CUE = Object.freeze({notes:[81,88],wave:'triangle',duration:.10,peak:.07});
export const AUDIO_PREFERENCE_KEY = 'stellar-sound-enabled';
export function readSoundPreference(storage){
  try { return storage?.getItem(AUDIO_PREFERENCE_KEY) !== 'off'; } catch { return true; }
}
export function saveSoundPreference(storage,enabled){
  try { storage?.setItem(AUDIO_PREFERENCE_KEY,enabled?'on':'off'); } catch { /* Storage may be disabled. */ }
}
export function getSoundProfile(cue){return CELESTIAL_CUES[cue] || UI_CLICK_CUE;}


// Original four-chord progression with slow pads and sparse star-like bells.
// MIDI note numbers; changes are intentionally gradual and unhurried.
export const SPACE_CHORDS = Object.freeze([
  Object.freeze([50, 57, 60, 64, 69]),  // Dm9
  Object.freeze([46, 53, 57, 62, 65]),  // B-flat major ninth
  Object.freeze([41, 48, 52, 57, 64]),  // F major ninth
  Object.freeze([48, 55, 60, 62, 67]),  // C add ninth
]);
export const SPACE_MELODY = Object.freeze([69,72,76,74,72,69,67,64,65,69,72,74,76,74,72,69]);

export function midiToHz(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}
export function normalizeVolume(value) {
  const v = Number(value);
  return Number.isFinite(v) ? Math.min(1, Math.max(0, v / 100)) : 0;
}

function startVoice(ctx, destination, midi, when, length, options={}) {
  const osc = ctx.createOscillator();
  const envelope = ctx.createGain();
  const peak = options.peak ?? 0.09;
  const attack = Math.min(length * .45, options.attack ?? 1.8);
  const release = Math.min(length * .48, options.release ?? 3.7);
  osc.type = options.type ?? 'sine';
  osc.frequency.setValueAtTime(midiToHz(midi), when);
  if (options.detune) osc.detune.setValueAtTime(options.detune, when);
  envelope.gain.setValueAtTime(0.00001, when);
  envelope.gain.linearRampToValueAtTime(peak, when + attack);
  envelope.gain.setValueAtTime(peak, when + length - release);
  envelope.gain.exponentialRampToValueAtTime(0.00001, when + length);
  osc.connect(envelope);
  envelope.connect(destination);
  osc.start(when);
  osc.stop(when + length + .03);
  osc.onended = () => { try { osc.disconnect(); envelope.disconnect(); } catch {} };
}

/** Creates a lightweight original score using the built-in Web Audio API. */
export function createAmbientEngine({ AudioContextCtor = globalThis.AudioContext || globalThis.webkitAudioContext } = {}) {
  if (!AudioContextCtor) throw new Error('Web Audio is not supported by this browser.');
  const ctx = new AudioContextCtor();
  const master = ctx.createGain();
  const lowpass = ctx.createBiquadFilter();
  const delay = ctx.createDelay(1);
  const echo = ctx.createGain();
  lowpass.type = 'lowpass'; lowpass.frequency.value = 1400;
  delay.delayTime.value = 0.47;
  echo.gain.value = .14;
  master.gain.value = 0;
  lowpass.connect(master);
  lowpass.connect(delay);
  delay.connect(echo);
  echo.connect(master);
  master.connect(ctx.destination);
  const effects = ctx.createGain();
  effects.gain.value = .2;
  effects.connect(ctx.destination);

  let volume = normalizeVolume(DEFAULT_SOUND_VOLUME);
  let timer = null;
  let isPlaying = false;
  let chordIndex = 0;
  let bellIndex = 0;
  let nextChord = 0;
  let nextBell = 0;
  let disposed = false;
  const level = () => .44 * Math.pow(volume, 1.18);

  function scheduleChord(when, index) {
    const notes = SPACE_CHORDS[index % SPACE_CHORDS.length];
    const length = 17.6;
    // A quiet sub pulse under long, softly detuned chord tones.
    startVoice(ctx, lowpass, notes[0] - 12, when, length, {type:'sine', peak:.12, attack:2.7, release:4.2});
    for (let n=1; n<notes.length; n++) {
      startVoice(ctx, lowpass, notes[n], when, length, {
        type: n%2 ? 'triangle' : 'sine', peak: .055,
        detune: (n%2 ? 1 : -1) * (2 + n), attack:2.7, release:4.2,
      });
    }
  }
  function scheduleBell(when, index) {
    const note = SPACE_MELODY[index % SPACE_MELODY.length];
    startVoice(ctx, master, note + 12, when, 3.15, {peak:.034, attack:.035, release:2.85});
    startVoice(ctx, master, note + 31, when, 2.1, {peak:.009, attack:.045, release:1.9});
  }
  function schedule() {
    if (!isPlaying || disposed) return;
    const horizon = ctx.currentTime + 2.8;
    while (nextChord < horizon) { scheduleChord(nextChord, chordIndex++); nextChord += 13.75; }
    while (nextBell < horizon) { scheduleBell(nextBell, bellIndex++); nextBell += 3.43; }
  }
  return {
    /** Re-request audio context resume synchronously inside a trusted gesture.
     * Needed when the first load-time resume is still pending on mobile Safari. */
    unlock() {
      if(disposed || ctx.state==='running')return;
      try{void ctx.resume().catch(()=>{});}
      catch(error){console.warn('Audio unlock unavailable:',error);}
    },
    async play() {
      if (disposed) throw new Error('Soundscape has already been closed.');
      await ctx.resume();
      if (!isPlaying) {
        isPlaying = true;
        if (!nextChord) { nextChord = ctx.currentTime + .06; nextBell = ctx.currentTime + 2.5; }
        schedule();
        timer = setInterval(schedule, 550);
      }
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setTargetAtTime(level(), now, .26);
    },
    async pause() {
      if (disposed || !isPlaying) return;
      isPlaying = false;
      if (timer !== null) clearInterval(timer);
      timer = null;
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setTargetAtTime(0, now, .045);
      // Small fade to avoid a click when pausing the oscillator clock.
      await new Promise(resolve => setTimeout(resolve, 240));
      if (!isPlaying && ctx.state === 'running') await ctx.suspend();
    },
    playEffect(cue='ui') {
      // Effects share this unlocked AudioContext but never block UI interactions.
      if(disposed || !isPlaying || ctx.state !== 'running') return;
      const profile=getSoundProfile(cue);
      const when=ctx.currentTime+.012;
      effects.gain.setTargetAtTime(.24*Math.sqrt(volume),ctx.currentTime,.035);
      try {
        profile.notes.forEach((note,i)=>startVoice(ctx,effects,note,when+i*.045,profile.duration,{
          type:profile.wave,peak:profile.peak,attack:.009,release:profile.duration*.65,
        }));
      } catch(error) { console.warn('Sound effect could not play:',error); }
    },
    setVolume(value) {
      volume = normalizeVolume(value);
      if (!disposed && isPlaying) {
        const now=ctx.currentTime;
        master.gain.setTargetAtTime(level(),now,.08);
      }
    },
    async dispose() {
      if (disposed) return;
      disposed = true;isPlaying=false;
      if (timer !== null) clearInterval(timer);
      try { await ctx.close(); } catch {}
    },
  };
}

/** 
 * DOM adapter: preference is ON for first-time visitors, but the browser may
 * require a click or keypress before Web Audio can actually play.
 * All sounds respect the same manual mute preference and tab visibility.
 */
export function initAmbientAudio({doc=globalThis.document,engineFactory=createAmbientEngine,storage}={}) {
  const button=doc?.getElementById('ambient-toggle');
  const slider=doc?.getElementById('ambient-volume');
  const status=doc?.getElementById('ambient-status');
  if(!button || !slider || !status) return ()=>{};
  const view=doc.defaultView;
  let store=storage;
  if(store===undefined){try{store=view?.localStorage;}catch{store=null;}}
  let enabled=readSoundPreference(store);
  let engine=null,playing=false,starting=null,everStarted=false,disposed=false;

  function paint(message){
    const audible=enabled && playing && !doc.hidden;
    button.dataset.playing=String(audible);
    button.dataset.enabled=String(enabled);
    button.setAttribute('aria-pressed',String(enabled));
    button.setAttribute('aria-label',enabled?'Turn website sounds off':'Turn website sounds on');
    const label=button.querySelector('[data-ambient-label]');
    if(label)label.textContent=enabled?'Sound on':'Sound off';
    if(message)status.textContent=message;
  }
  async function pause(reason='Sound paused.'){
    playing=false;
    paint(reason);
    if(!engine || disposed)return;
    try{await engine.pause();}
    catch(error){console.warn('Could not pause site audio:',error);}
  }
  function start(cue=null){
    if(disposed || !enabled || doc.hidden)return Promise.resolve(false);
    if(playing){
      if(cue)try{engine?.playEffect?.(cue);}catch(error){console.warn('Click sound failed:',error);}
      return Promise.resolve(true);
    }
    if(starting){
      if(cue)void starting.then(ok=>{if(ok && enabled && !doc.hidden)engine?.playEffect?.(cue);});
      return starting;
    }
    // Called directly from a click/keypress to satisfy user-activation policies.
    const task=(async()=>{
      try{
        if(!engine)engine=engineFactory();
        engine.setVolume(slider.value);
        await engine.play();
        if(disposed || !enabled || doc.hidden){await engine.pause();return false;}
        playing=true;everStarted=true;
        paint('Orbital Drift playing. Website clicks and planets have sound effects.');
        if(cue)engine.playEffect?.(cue);
        return true;
      }catch(error){
        console.warn('Site audio unavailable or autoplay blocked:',error);
        playing=false;
        paint('Sound is enabled but your browser requires a click or audio permission to start.');
        return false;
      }finally{starting=null;}
    })();
    starting=task;
    return task;
  }
  /** First swipe/touch anywhere unlocks sound, even if autoplay resume is pending. */
  function unlockFromGesture(event){
    if(disposed || !enabled || doc.hidden || playing)return;
    if(event?.target?.closest?.('#ambient-toggle, #ambient-volume'))return;
    if(starting){
      try{engine?.unlock?.();}catch(error){console.warn('Audio unlock failed:',error);}
    }else void start();
  }
  function onToggle(){
    if(disposed)return;
    enabled=!enabled;
    saveSoundPreference(store,enabled);
    if(!enabled){void pause('Website sounds muted. They will stay muted until you turn them on.');}
    else{paint('Sound enabled. Starting Orbital Drift.');void start('ui');}
  }
  function onVolume(){try{engine?.setVolume(slider.value);}catch(error){console.warn('Volume unavailable:',error);}}
  function onGlobalClick(event){
    if(disposed || !enabled || doc.hidden)return;
    const target=event.target;
    if(typeof target?.closest !== 'function')return;
    if(target.closest('#ambient-toggle, #ambient-volume'))return;
    unlockFromGesture(event);
    const planet=target.closest('[data-planet-sound]')?.dataset.planetSound;
    const interactive=target.closest('button, a, summary, select, input, [role="button"], [role="option"]');
    // The first click anywhere also unlocks sound, even on non-control elements.
    if(!planet && !interactive && playing)return;
    void start(planet || (interactive?'ui':null));
  }
  function onKeydown(event){
    if(!enabled || playing || disposed || doc.hidden || event.repeat)return;
    if(['Shift','Control','Alt','Meta','Escape','Tab'].includes(event.key))return;
    unlockFromGesture(event);
  }
  function onVisibility(){
    if(doc.hidden){void pause('Website sounds paused while the tab is hidden.');}
    else if(enabled && everStarted){void start();}
    else if(enabled)paint('Sound on — click anywhere to start listening.');
  }
  function onPageHide(){void pause('Sound paused while the page is away.');}
  function onPageShow(){if(enabled && everStarted && !doc.hidden)void start();}
  button.addEventListener('click',onToggle);
  slider.addEventListener('input',onVolume);
  // Pointerdown covers modern mobile and desktop; touchstart/touchend also
  // catch swipe gestures and Safari versions with differing activation timing.
  doc.addEventListener('pointerdown',unlockFromGesture,true);
  doc.addEventListener('touchstart',unlockFromGesture,{capture:true,passive:true});
  doc.addEventListener('touchend',unlockFromGesture,{capture:true,passive:true});
  doc.addEventListener('click',onGlobalClick,true);
  doc.addEventListener('keydown',onKeydown,true);
  doc.addEventListener('visibilitychange',onVisibility);
  view?.addEventListener?.('pagehide',onPageHide);
  view?.addEventListener?.('pageshow',onPageShow);
  paint(enabled ? 'Sound on — plays immediately when allowed, otherwise at the first touch, scroll, click or keypress.' : 'Website sounds muted by your preference.');
  // Attempt autoplay regardless of getAutoplayPolicy support. Browsers may
  // suspend the AudioContext; the next genuine gesture releases it.
  if(enabled && !doc.hidden)void start();
  return ()=>{
    if(disposed)return;
    disposed=true;
    button.removeEventListener('click',onToggle);
    slider.removeEventListener('input',onVolume);
    doc.removeEventListener('pointerdown',unlockFromGesture,true);
    doc.removeEventListener('touchstart',unlockFromGesture,true);
    doc.removeEventListener('touchend',unlockFromGesture,true);
    doc.removeEventListener('click',onGlobalClick,true);
    doc.removeEventListener('keydown',onKeydown,true);
    doc.removeEventListener('visibilitychange',onVisibility);
    view?.removeEventListener?.('pagehide',onPageHide);
    view?.removeEventListener?.('pageshow',onPageShow);
    void engine?.dispose?.();
  };
}
