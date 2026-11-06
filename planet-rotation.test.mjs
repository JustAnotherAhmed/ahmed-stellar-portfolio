import test from 'node:test';
import assert from 'node:assert/strict';
import {rotatePlanet,attachPlanetRotation,MAX_PLANET_PITCH} from './planet-rotation.mjs';
import {readFileSync} from 'node:fs';
const read=n=>readFileSync(new URL(n,import.meta.url),'utf8');
class Pad extends EventTarget{
  constructor(){super();this.dataset={};this.capture=[];}
  setPointerCapture(id){this.capture.push(id);}
  releasePointerCapture(id){this.capture.push('release:'+id);}
  fire(type,props={}){const e=new Event(type,{cancelable:true});for(const [k,v] of Object.entries(props))Object.defineProperty(e,k,{value:v});this.dispatchEvent(e);return e;}
}
test('planet rotates in longitude and bounded latitude, preserving tilt and size',()=>{
  const mesh={rotation:{x:0,y:0,z:.46},scale:{x:1}};
  assert.equal(rotatePlanet(mesh,80,35),true);
  assert.ok(mesh.rotation.y>0&&mesh.rotation.x>0);
  rotatePlanet(mesh,0,99999);assert.equal(mesh.rotation.x,MAX_PLANET_PITCH);
  rotatePlanet(mesh,0,-99999);assert.equal(mesh.rotation.x,-MAX_PLANET_PITCH);
  assert.equal(mesh.rotation.z,.46);assert.equal(mesh.scale.x,1);
  assert.equal(rotatePlanet(mesh,NaN,1),false);
});
test('touch pointer capture and arrow keys rotate, and cleanup removes event handlers',()=>{
  const pad=new Pad(),deltas=[],states=[];let focused=true;
  const detach=attachPlanetRotation(pad,{canRotate:()=>focused,rotate:(x,y)=>deltas.push([x,y]),onDragChange:s=>states.push(s)});
  pad.fire('pointerdown',{pointerId:7,pointerType:'touch',clientX:50,clientY:80});
  pad.fire('pointermove',{pointerId:7,clientX:72,clientY:60});
  pad.fire('pointerup',{pointerId:7});
  pad.fire('keydown',{key:'ArrowRight'});
  assert.deepEqual(deltas,[[22,-20],[24,0]]);
  assert.deepEqual(states,[true,false]);assert.ok(pad.capture.includes(7));
  focused=false;pad.fire('keydown',{key:'ArrowLeft'});assert.equal(deltas.length,2);
  detach();pad.fire('pointerdown',{pointerId:8,pointerType:'touch',clientX:1,clientY:1});
  assert.ok(!pad.capture.includes(8));
});
test('rotation layer preserves cinematic focus and 4K texture targets',()=>{
 const s=read('solar-system.mjs'),h=read('index.html'),css=read('styles.css');
 assert.match(s,/attachPlanetRotation/);
 assert.match(s,/rotatePlanet\(mesh,dx,dy\)/);
 assert.match(s,/anchoredCameraOffset\(world\.position,cameraState,worldScale,cameraState\.zoom/);
 assert.match(s,/adaptivePixelRatio/);
 assert.match(h,/id="planet-rotation-pad"/);
 assert.match(css,/touch-action:none/);
});
