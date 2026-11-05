/**
 * ORBITAL DRIFT — original, opt-in ambient music composed algorithmically.
 * No recordings, samples, licensed soundtrack, downloads, or external APIs.
 * Audio is silent until a visitor explicitly presses Play.
 */
export const SOUNDTRACK_NAME = 'Orbital Drift';
export const DEFAULT_SOUND_VOLUME = 34;

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

/** DOM adapter separated from synthesis so controls can be tested without audio devices. */
export function initAmbientAudio({doc=globalThis.document,engineFactory=createAmbientEngine}={}) {
  const button = doc?.getElementById('ambient-toggle');
  const slider = doc?.getElementById('ambient-volume');
  const status = doc?.getElementById('ambient-status');
  if (!button || !slider || !status) return () => {};
  let engine = null;
  let playing = false;
  let busy = false;
  let disposed = false;
  const paint = (message) => {
    button.dataset.playing = String(playing);
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? 'Pause ambient space soundtrack' : 'Play ambient space soundtrack');
    const label = button.querySelector('[data-ambient-label]');
    if (label) label.textContent = playing ? 'Sound on' : 'Sound off';
    if (message) status.textContent = message;
  };
  const onVolume = () => { engine?.setVolume(slider.value); };
  const pause = async (reason) => {
    if (!playing || busy || disposed) return;
    busy = true; button.disabled = true;
    try { await engine.pause(); playing = false; paint(reason); }
    catch (error) { console.warn('Could not pause soundscape:',error); playing=false;paint('Soundscape paused.'); }
    finally { busy=false; button.disabled=false; }
  };
  const onToggle = async () => {
    if (disposed || busy) return;
    if (playing) { await pause('Ambient soundtrack paused.'); return; }
    busy = true; button.disabled = true;
    try {
      if (!engine) engine=engineFactory();
      engine.setVolume(slider.value);
      await engine.play();
      playing = true;
      paint('Playing Orbital Drift. Use the volume control or press again to pause.');
    } catch(error) {
      console.warn('Space soundtrack unavailable:', error);
      playing=false;
      paint('Sound could not start. Check browser audio permissions, or try again.');
    } finally {busy=false;button.disabled=false;}
  };
  const onVisibility = () => { if (doc.hidden) void pause('Ambient soundtrack paused when you left the tab.'); };
  const onPageHide = () => { disposed=true;void engine?.dispose?.(); };
  button.addEventListener('click',onToggle);
  slider.addEventListener('input',onVolume);
  doc.addEventListener('visibilitychange',onVisibility);
  doc.defaultView?.addEventListener?.('pagehide',onPageHide);
  paint('Soundtrack off by default. Press Play to listen.');
  return () => {
    if(disposed)return;
    disposed=true;
    button.removeEventListener('click',onToggle);
    slider.removeEventListener('input',onVolume);
    doc.removeEventListener('visibilitychange',onVisibility);
    doc.defaultView?.removeEventListener?.('pagehide',onPageHide);
    void engine?.dispose?.();
  };
}