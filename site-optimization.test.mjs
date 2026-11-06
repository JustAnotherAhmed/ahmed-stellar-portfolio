import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=n=>readFileSync(new URL(n,import.meta.url),'utf8');
test('audio preference and mobile unlock are initialized before solar GPU work',()=>{
 const app=read('app.mjs'),audio=read('ambient-audio.mjs'),html=read('index.html');
 assert.ok(app.indexOf("['ambient soundtrack', initAmbientAudio]")<app.indexOf("['solar system', initSolarSystem]"));
 assert.match(audio,/loaderAudioButton/);
 assert.match(html,/id="stellar-audio-start"/);
});
test('fully detailed 4K solar scene is still staged without a hidden perpetual render loop',()=>{
 const solar=read('solar-system.mjs'),gate=read('launch-gate.mjs');
 assert.match(solar,/adaptivePixelRatio\(/);
 assert.match(solar,/maxConcurrent:profile\.mapConcurrency,delayMs:profile\.mobile\?80:180/);
 assert.match(solar,/createSurfaceTexture\(THREE,id,\{width:profile\.textureWidth\}\)/);
 assert.match(solar,/launchGate\.active/);
 assert.match(gate,/get active\(\)/);
 assert.match(gate,/onReleased\(\)/);
});
test('optimized frame updates skip hidden planets and repeated projection matrices',()=>{
 const solar=read('solar-system.mjs');
 assert.match(solar,/if\(!mesh\.visible\)continue/);
 assert.match(solar,/if\(camera\.zoom!==cameraState\.zoom\)/);
 assert.match(solar,/scheduleLayout/);
 assert.match(solar,/parallaxBounds/);
 assert.match(read('styles.css'),/content-visibility:auto/);
});
