import test from 'node:test';
import assert from 'node:assert/strict';
import {MAX_RENDER_PIXELS,effectivePixelRatio,sceneAnchoring,satelliteSafeZoom} from './render-quality.mjs';
test('pixel ratio scales with DPI and an explicit GPU budget',()=>{
  assert.equal(effectivePixelRatio(400,600,2),2);
  assert.ok(effectivePixelRatio(1920,1080,3)>1);
  const dpr=effectivePixelRatio(3840,2160,3);
  assert.ok(dpr<=2.25 && dpr*3840*dpr*2160<=MAX_RENDER_PIXELS+1);
  assert.equal(effectivePixelRatio(0,100,2),1);
});
test('scene anchors correctly across desktop and mobile screen sizes',()=>{
  const screen={left:0,top:0,width:1440,height:850},stage={left:850,top:170,width:520,height:520};
  const p=sceneAnchoring(screen,stage);
  assert.equal(p.scale,520/440);
  assert.equal(p.x,390);
  assert.equal(p.y,-5);
  assert.equal(sceneAnchoring({left:0,top:0,width:360,height:1200},{left:18,top:550,width:324,height:324}).x,0);
});
test('Earth and Moon remain inside the hero even at phone widths',()=>{
  const viewport={left:0,width:390},zoom=satelliteSafeZoom(18,viewport,195,354/440);
  assert.ok(zoom<18 && 17*(354/440)*zoom<176);
  assert.equal(satelliteSafeZoom(7,{left:0,width:1600},1100,510/440),7);
});
