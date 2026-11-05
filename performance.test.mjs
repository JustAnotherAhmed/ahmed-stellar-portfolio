import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {frameIntervalFor,MARKER_INTERVAL_MS,dueForUpdate} from './performance.mjs';
const source=name=>readFileSync(new URL(name,import.meta.url),'utf8');
test('render cadence preserves desktop fluidity and reduces mobile GPU workload',()=>{
  assert.equal(frameIntervalFor(1440),1000/60);
  assert.equal(frameIntervalFor(900),1000/45);
  assert.equal(frameIntervalFor(390),1000/30);
  assert.equal(frameIntervalFor(1500,4),1000/30);
  assert.equal(frameIntervalFor(NaN),1000/60);
});
test('render gates handle first tick, jitter, and invalid time',()=>{
  assert.ok(dueForUpdate(110,0,1000/60));
  assert.equal(dueForUpdate(115,110,1000/60),false);
  assert.ok(dueForUpdate(127,110,1000/60));
  assert.ok(!dueForUpdate(NaN,110,1000/60));
  assert.equal(MARKER_INTERVAL_MS,1000/24);
});
test('marker updates stay efficient while ALL 4K atlases launch on startup',()=>{
  const solar=source('solar-system.mjs');
  assert.match(solar,/dueForUpdate\(nowMs,lastMarkersAt,MARKER_INTERVAL_MS\)/);
  assert.match(solar,/const factor=markerScale/);
  assert.doesNotMatch(solar,/function positionDom\(t\) \{\s*const locations=positionsAt\(t\);\s*const factor=stage\.getBoundingClientRect/);
  assert.match(solar,/for\(const body of SOLAR_BODIES\)\{\s*try\{loadPlanetPhoto/);
  assert.doesNotMatch(solar,/requestIdleCallback\(nextTexture/);
  assert.match(solar,/const texture=null/);
  assert.match(solar,/anchoredCameraOffset\(world\.position,cameraState,worldScale,cameraState\.zoom/);
});
test('question bank is not on the first-page critical path',()=>{
  const app=source('app.mjs');
  assert.match(app,/import\('\.\/quiz-ui\.mjs'\)/);
  assert.doesNotMatch(app,/^import \{ initGeneralQuiz \}/m);
  assert.match(app,/new IntersectionObserver/);
  assert.match(source('index.html'),/rel="preconnect" href="https:\/\/cdn\.jsdelivr\.net"/);
});
