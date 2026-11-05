import test from 'node:test';
import assert from 'node:assert/strict';
import {MAX_RENDER_PIXELS,effectivePixelRatio,sceneAnchoring,satelliteSafeZoom,anchoredCameraOffset} from './render-quality.mjs';
import {SOLAR_BODIES,positionsAt} from './planets.mjs';
import {focusZoomFor} from './camera-focus.mjs';
import {readFileSync} from 'node:fs';
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

test('all selectable planets remain anchored in the right-hand stage at every zoom level',()=>{
  const screen={left:0,top:0,width:1500,height:850};
  const stage={left:925,top:130,width:500,height:500};
  const frame=sceneAnchoring(screen,stage),anchor={x:frame.x,y:frame.y};
  for(const body of SOLAR_BODIES){
    const target=positionsAt(60)[body.id],maxZoom=focusZoomFor(body);
    for(const step of [0,.05,.25,.5,.75,1]){
      const zoom=1+(maxZoom-1)*step;
      const point={x:target.x*step,y:target.y*step};
      const cam=anchoredCameraOffset(anchor,point,frame.scale,zoom);
      const projectedX=zoom*(anchor.x+point.x*frame.scale-cam.x);
      const projectedY=zoom*(anchor.y+point.y*frame.scale-cam.y);
      assert.ok(Math.abs(projectedX-anchor.x)<1e-8,body.id+' horizontal shift');
      assert.ok(Math.abs(projectedY-anchor.y)<1e-8,body.id+' vertical shift');
    }
  }
});
test('responsive camera frame and parallax preserve right-hand planet focus',()=>{
  for(const [viewport,stage] of [
    [{left:0,top:0,width:1500,height:900},{left:900,top:200,width:500,height:500}],
    [{left:0,top:0,width:390,height:1040},{left:22,top:520,width:346,height:346}]
  ]){
    const f=sceneAnchoring(viewport,stage),anchor={x:f.x,y:f.y};
    const point={x:82,y:-20},parallax={x:1.5,y:-.3},zoom=12;
    const cam=anchoredCameraOffset(anchor,point,f.scale,zoom,parallax);
    assert.ok(Math.abs(zoom*(anchor.x+point.x*f.scale-cam.x)+zoom*parallax.x-anchor.x)<1e-8);
    assert.ok(Math.abs(zoom*(anchor.y+point.y*f.scale-cam.y)+zoom*parallax.y-anchor.y)<1e-8);
  }
  assert.throws(()=>anchoredCameraOffset({x:0,y:0},{x:1,y:2},1,0),RangeError);
});
test('the WebGL render loop invokes anchored camera compensation',()=>{
  const source=readFileSync(new URL('./solar-system.mjs',import.meta.url),'utf8');
  assert.match(source,/anchoredCameraOffset\(world\.position,cameraState,worldScale,cameraState\.zoom/);
  assert.doesNotMatch(source,/const offsetX=cameraState\.x\*worldScale/);
});
