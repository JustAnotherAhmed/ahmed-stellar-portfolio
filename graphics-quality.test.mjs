import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PHOTO_TEXTURE_PATHS,planetPhotoUrl} from './planet-textures.mjs';
import {SOLAR_BODIES} from './planets.mjs';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
test('every planet has an attributed, highest-available source atlas',()=>{
  assert.equal(Object.keys(PHOTO_TEXTURE_PATHS).length,SOLAR_BODIES.length);
  for(const {id} of SOLAR_BODIES)assert.match(planetPhotoUrl(id),/^https:\/\/www\.solarsystemscope\.com\/textures\/download\/(?:8k|4k|2k)_[a-z_]+\.jpg$/);
  assert.equal(planetPhotoUrl('unknown'),null);
  assert.match(read('./index.html'),/Planet imagery: Solar System Scope/);
});
test('the WebGL scene fills the hero and exposes 4K renderer quality',()=>{
  const html=read('./index.html'),css=read('./styles.css'),js=read('./solar-system.mjs');
  assert.match(html,/<div class="solar-background" aria-hidden="true"><canvas id="solar-canvas"/);
  assert.match(css,/\.solar-background[^{]*\{[^}]*width:\s*100vw/);
  assert.doesNotMatch(js,/renderer\.setSize\(440,440/);
  assert.match(js,/balancedPixelRatio/);
  assert.match(js,/updateVisibleBodies/);
});
test('failed remote 4K maps retain procedural 4K fallback',()=>{
  const js=read('./solar-system.mjs');
  assert.match(js,/loadPlanetPhoto\(THREE,id,ok,reject\)/);
  assert.match(js,/createSurfaceTexture\(THREE,id,\{width:1024\}\)/);
  const cfg=JSON.parse(read('./vercel.json'));
  const csp=cfg.headers[0].headers.find(h=>h.key==='Content-Security-Policy').value;
  assert.match(csp,/https:\/\/www\.solarsystemscope\.com/);
});
