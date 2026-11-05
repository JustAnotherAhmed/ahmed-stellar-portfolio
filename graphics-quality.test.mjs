import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PHOTO_TEXTURE_PATHS,planetPhotoUrl} from './planet-textures.mjs';
import {SOLAR_BODIES} from './planets.mjs';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');
test('all celestial bodies have licensed 2K image sources and clear attribution',()=>{
  assert.equal(Object.keys(PHOTO_TEXTURE_PATHS).length,SOLAR_BODIES.length);
  for(const {id} of SOLAR_BODIES)assert.match(planetPhotoUrl(id),/^https:\/\/www\.solarsystemscope\.com\/textures\/download\/2k_[a-z_]+\.jpg$/);
  assert.equal(planetPhotoUrl('unknown'),null);
  assert.match(read('./index.html'),/Planet imagery: Solar System Scope/);
});
test('the WebGL canvas fills the hero instead of a fixed square',()=>{
  const html=read('./index.html'),css=read('./styles.css'),js=read('./solar-system.mjs');
  assert.match(html,/<div class="solar-background" aria-hidden="true"><canvas id="solar-canvas"/);
  assert.match(css,/\.solar-background[^{]*\{[^}]*width:\s*100vw/);
  assert.doesNotMatch(js,/renderer\.setSize\(440,440/);
  assert.match(js,/effectivePixelRatio/);
  assert.match(js,/syncLayout/);
  assert.match(js,/updateVisibleBodies/);
});
test('photo texture failure preserves the procedural close-up',()=>{
  const js=read('./solar-system.mjs');
  assert.match(js,/loadPlanetPhoto\(threeModule,id,replaceMap,fallback\)/);
  assert.match(js,/createSurfaceTexture\(threeModule,id,\{width:2048\}\)/);
  const config=JSON.parse(read('./vercel.json'));
  const csp=config.headers[0].headers.find(h=>h.key==='Content-Security-Policy').value;
  assert.match(csp,/https:\/\/www\.solarsystemscope\.com/);
});
