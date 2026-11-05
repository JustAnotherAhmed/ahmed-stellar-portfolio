import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createTextureQueue,ATLAS_CONCURRENCY} from './texture-queue.mjs';
import {balancedPixelRatio,cinematicPixelRatio} from './render-quality.mjs';
import {prepare4kTextureAsync,ATLAS_WIDTH} from './planet-textures.mjs';
const read=name=>readFileSync(new URL(name,import.meta.url),'utf8');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
test('only two 4K images download at a time and selected planet goes next',async()=>{
  assert.equal(ATLAS_CONCURRENCY,2);
  const begun=[],callbacks=new Map();
  const queue=createTextureQueue(['earth','sun','mars','saturn'],{delayMs:1,load:id=>{
    begun.push(id);return new Promise(resolve=>callbacks.set(id,resolve));
  }});
  queue.start();await sleep(12);
  assert.deepEqual(begun,['earth','sun']);
  queue.prioritize('saturn');
  callbacks.get('earth')();await sleep(12);
  assert.deepEqual(begun,['earth','sun','saturn']);
  callbacks.get('sun')();callbacks.get('saturn')();await sleep(12);
  assert.equal(begun.at(-1),'mars');
  queue.stop();
});
test('aborted queue never begins deferred work',async()=>{
  let started=0;
  const queue=createTextureQueue(['mars','moon'],{delayMs:15,load:()=>{started++;}});
  queue.start();queue.stop();await sleep(30);
  assert.equal(started,0);
});
test('image bitmap decoding retains true 4096px output and anisotropic filtering',async()=>{
  const old=globalThis.createImageBitmap,bitmap={width:4096,height:2048,close(){}};
  globalThis.createImageBitmap=async(image,options)=>{assert.equal(options.resizeWidth,4096);return bitmap;};
  class Texture{constructor(image){this.image=image;this.userData={};this.needsUpdate=false;}}
  const THREE={Texture,SRGBColorSpace:'srgb',LinearMipmapLinearFilter:'mip',LinearFilter:'linear'};
  try{
    const map=await prepare4kTextureAsync(THREE,{width:8192,height:4096});
    assert.equal(ATLAS_WIDTH,4096);assert.equal(map.image,bitmap);
    assert.equal(map.anisotropy,16);assert.equal(map.needsUpdate,true);
  }finally{globalThis.createImageBitmap=old;}
});
test('4K textures remain while supersampling respects a framebuffer budget',()=>{
  assert.equal(cinematicPixelRatio(1920,1080,2),3);
  assert.ok(balancedPixelRatio(1920,1080,2)<=3);
  assert.ok(balancedPixelRatio(1920,1080,2)>=2);
  assert.equal(balancedPixelRatio(0,900),1);
  const solar=read('solar-system.mjs');
  assert.match(solar,/new THREE\.SphereGeometry\(1,192,144\)/);
  assert.match(solar,/textureQueue\?\.prioritize\(nextId\)/);
  assert.match(solar,/anchoredCameraOffset\(world\.position,cameraState,worldScale,cameraState\.zoom/);
  assert.match(solar,/addEarthNightLights/);
  assert.match(solar,/loadPlanetPhoto/);
  assert.match(read('planet-textures.mjs'),/prepare4kTextureAsync/);
});
