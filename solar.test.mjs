import test from 'node:test';
import assert from 'node:assert/strict';
import {SOLAR_BODIES,ORBITAL_BODIES,BODY_BY_ID,positionsAt,THEME_TOKENS,contrastRatio,hexRgb} from './planets.mjs';

test('Sun, eight planets, and the Moon are selectable and described',()=>{
  assert.equal(SOLAR_BODIES.length,10);
  assert.equal(ORBITAL_BODIES.length,8);
  assert.deepEqual(new Set(SOLAR_BODIES.map(b=>b.id)),new Set(['sun','mercury','venus','earth','moon','mars','jupiter','saturn','uranus','neptune']));
  for(const b of SOLAR_BODIES){assert.ok(b.description.length>45);assert.ok(b.fact.length>30);assert.ok(b.name);}
});
test('all theme text, accents and buttons meet WCAG AA 4.5:1',()=>{
  for(const [id,theme] of Object.entries(THEME_TOKENS)) {
    assert.ok(contrastRatio(theme.text,theme.background)>=4.5,`${id} text`);
    assert.ok(contrastRatio(theme.muted,theme.background)>=4.5,`${id} muted`);
    assert.ok(contrastRatio(theme.accent,theme.background)>=4.5,`${id} accent`);
    assert.ok(contrastRatio(theme.ink,theme.accent)>=4.5,`${id} button foreground`);
    assert.deepEqual(hexRgb(theme.accent).length,3);
  }
});
test('orbital speeds scaled correctly and Moon follows Earth',()=>{
  const a=positionsAt(0),b=positionsAt(24);
  assert.equal(a.sun.x,0);assert.equal(a.sun.y,0);
  assert.notDeepEqual(a.earth,b.earth);
  assert.ok(Math.hypot(a.moon.x-a.earth.x,(a.moon.y-a.earth.y)/.76)<=13.001);
  assert.ok(BODY_BY_ID.mercury.period<BODY_BY_ID.venus.period);
  assert.ok(BODY_BY_ID.earth.period<BODY_BY_ID.neptune.period);
  for(const position of Object.values(b))for(const coordinate of Object.values(position))assert.ok(Number.isFinite(coordinate));
});
