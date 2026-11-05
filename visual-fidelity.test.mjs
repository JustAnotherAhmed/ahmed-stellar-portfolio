import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {cinematicPixelRatio} from './render-quality.mjs';
import {ATLAS_WIDTH,PHOTO_TEXTURE_PATHS,EARTH_DETAIL_PATHS} from './planet-textures.mjs';
const read=name=>readFileSync(new URL(name,import.meta.url),'utf8');

test('full ultra-HD render quality applies from the first frame with no software pixel budget',()=>{
  const solar=read('solar-system.mjs');
  assert.match(solar,/renderQuality=cinematicPixelRatio\(w,h,window\.devicePixelRatio\|\|1,gl\.getParameter\(gl\.MAX_RENDERBUFFER_SIZE\)\)/);
  assert.doesNotMatch(solar,/balancedPixelRatio|qualityPromoted|qualityTimer|Math\.min\(1\.25/);
  assert.equal(cinematicPixelRatio(1920,1080,2),3);
  assert.equal(cinematicPixelRatio(1440,900,3),4);
  assert.equal(cinematicPixelRatio(1440,900,3,2048),2048/1440);
});
test('successful maps and fallback maps both keep 4K target',()=>{
  const solar=read('solar-system.mjs');
  assert.equal(ATLAS_WIDTH,4096);
  assert.equal(Object.keys(PHOTO_TEXTURE_PATHS).length,10);
  assert.match(solar,/createSurfaceTexture\(THREE,id,\{width:4096\}\)/);
  assert.match(solar,/addEarthClouds\(THREE,earth,\{width:4096\}\)/);
  assert.match(solar,/loadCloudImage\(THREE,ok,fail\)/);
  assert.match(solar,/loadNightLights\(THREE,ok,fail\)/);
  assert.match(EARTH_DETAIL_PATHS.clouds,/8k_/);
});
test('visual detail and progressive loading are retained after full-resolution restoration',()=>{
  const solar=read('solar-system.mjs'),textures=read('planet-textures.mjs');
  assert.match(solar,/new THREE\.SphereGeometry\(1,192,144\)/);
  assert.match(solar,/maxConcurrent:2,delayMs:180/);
  assert.match(solar,/anchoredCameraOffset\(world\.position,cameraState,worldScale,cameraState\.zoom/);
  assert.match(solar,/addEarthNightLights/);
  assert.match(textures,/new THREE\.RingGeometry\(config\.inner,config\.outer,384\)/);
  assert.match(textures,/makeRingTexture\(THREE,id,width=4096\)/);
});
