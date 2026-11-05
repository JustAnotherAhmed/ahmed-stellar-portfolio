import test from 'node:test';
import assert from 'node:assert/strict';
import {BODY_BY_ID,positionsAt} from './planets.mjs';
import {CAMERA_OVERVIEW,FOCUS_DURATION_MS,easeInOutCubic,focusZoomFor,transitionCamera,sampleCamera} from './camera-focus.mjs';
test('smooth camera easing is clamped, monotonic and softer at its ends',()=>{
  assert.equal(easeInOutCubic(-10),0);assert.equal(easeInOutCubic(10),1);
  assert.equal(easeInOutCubic(.5),.5);
  assert.ok(easeInOutCubic(.15)<.15);
  assert.ok(easeInOutCubic(.85)>.85);
  for(let t=.05;t<1;t+=.05)assert.ok(easeInOutCubic(t)>=easeInOutCubic(t-.05));
});
test('camera zooms into each planet and leaves room for real Saturn rings',()=>{
  for(const body of Object.values(BODY_BY_ID)){
    const z=focusZoomFor(body);
    assert.ok(Number.isFinite(z)&&z>1,body.id);
  }
  assert.ok(focusZoomFor(BODY_BY_ID.saturn)<focusZoomFor(BODY_BY_ID.earth));
  assert.equal(focusZoomFor(null),1);
});
test('selection centers the chosen moving body, and return transitions to overview',()=>{
  const p=positionsAt(100).neptune;
  const target={x:p.x,y:p.y,zoom:focusZoomFor(BODY_BY_ID.neptune)};
  const trans=transitionCamera(CAMERA_OVERVIEW,target,1000,FOCUS_DURATION_MS);
  const start=sampleCamera(trans,1000),middle=sampleCamera(trans,1000+FOCUS_DURATION_MS/2),end=sampleCamera(trans,9999);
  assert.equal(start.zoom,1);assert.equal(middle.complete,false);
  assert.equal(end.complete,true);assert.equal(end.x,target.x);assert.equal(end.y,target.y);
  const moved=sampleCamera(trans,9999,{x:12,y:3,zoom:target.zoom});
  assert.equal(moved.x,12);
  const reverse=sampleCamera(transitionCamera(end,CAMERA_OVERVIEW,2000),9999);
  assert.deepEqual({x:reverse.x,y:reverse.y,zoom:reverse.zoom},CAMERA_OVERVIEW);
});
