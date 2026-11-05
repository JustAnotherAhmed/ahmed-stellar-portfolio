import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SOLAR_BODIES} from './planets.mjs';
import {ATLAS_WIDTH,EARTH_DETAIL_PATHS,PHOTO_TEXTURE_PATHS,atlasUrl,planetPhotoUrl,prepare4kTexture,loadPlanetPhoto,loadCloudImage} from './planet-textures.mjs';
import {cinematicPixelRatio} from './render-quality.mjs';
const read=name=>readFileSync(new URL(name,import.meta.url),'utf8');

test('all ten planets request highest known texture maps',()=>{
  assert.equal(ATLAS_WIDTH,4096);
  assert.equal(Object.keys(PHOTO_TEXTURE_PATHS).length,SOLAR_BODIES.length);
  for(const {id} of SOLAR_BODIES)assert.ok(planetPhotoUrl(id)?.endsWith(PHOTO_TEXTURE_PATHS[id]));
  for(const id of ['sun','mercury','earth','moon','mars','jupiter','saturn'])assert.match(planetPhotoUrl(id),/8k_/);
  assert.match(planetPhotoUrl('venus'),/4k_venus_atmosphere/);
  for(const id of ['uranus','neptune'])assert.match(planetPhotoUrl(id),/2k_/);
  assert.match(atlasUrl(EARTH_DETAIL_PATHS.clouds),/8k_earth_clouds\.jpg$/);
  assert.match(atlasUrl(EARTH_DETAIL_PATHS.night),/8k_earth_nightmap\.jpg$/);
});
test('4K map conversion uses canvas, mipmaps and anisotropic filtering',()=>{
  const previous=globalThis.document,draws=[];
  globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>({
    drawImage(...args){draws.push(args);},imageSmoothingEnabled:false,imageSmoothingQuality:''
  })})};
  class CanvasTexture {constructor(canvas){this.image=canvas;}}
  const THREE={CanvasTexture,SRGBColorSpace:'srgb',LinearMipmapLinearFilter:'trilinear',LinearFilter:'linear'};
  try{
    const t=prepare4kTexture(THREE,{width:8192,height:4096});
    assert.equal(t.image.width,4096);assert.equal(t.image.height,2048);
    assert.equal(t.anisotropy,16);assert.equal(t.colorSpace,'srgb');
    assert.equal(t.minFilter,'trilinear');assert.equal(t.magFilter,'linear');
    assert.equal(draws[0][3],4096);assert.equal(draws[0][4],2048);
  }finally{globalThis.document=previous;}
});
test('failed image requests surface errors without misrepresenting loaded maps',()=>{
  let requested=0,failed=0;
  class ImageLoader{setCrossOrigin(s){assert.equal(s,'anonymous');}load(url,success,progress,error){requested++;assert.match(url,/solarsystemscope/);error(Error('network error'));}}
  const THREE={ImageLoader};
  loadPlanetPhoto(THREE,'jupiter',()=>assert.fail('unexpected image'),()=>failed++);
  loadCloudImage(THREE,()=>assert.fail('unexpected cloud'),()=>failed++);
  assert.equal(requested,2);assert.equal(failed,2);
});
test('ultra-HD rings and Earth night lights retain full camera focus',()=>{
  const textures=read('planet-textures.mjs'),solar=read('solar-system.mjs');
  assert.match(textures,/new THREE\.RingGeometry\(config\.inner,config\.outer,384\)/);
  assert.match(textures,/uv\.setXY\(i,\(r-config\.inner\)/);
  assert.match(textures,/addEarthNightLights/);
  assert.match(textures,/sunWorldPosition/);
  assert.match(solar,/new THREE\.SphereGeometry\(1,192,144\)/);
  assert.match(solar,/for\(const body of SOLAR_BODIES\)\{\s*try\{loadPlanetPhoto/);
  assert.match(solar,/loadNightLights/);
  assert.match(solar,/anchoredCameraOffset\(world\.position,cameraState,worldScale,cameraState\.zoom/);
  assert.doesNotMatch(solar,/queueTextureUpgrade\(/);
});
test('GPU resolution prioritizes quality while honoring renderbuffer bounds',()=>{
  assert.equal(cinematicPixelRatio(1440,900,1),2.5);
  assert.equal(cinematicPixelRatio(1440,900,3),4);
  assert.equal(cinematicPixelRatio(800,700,3,2048),2048/800);
  assert.equal(cinematicPixelRatio(0,900,2),1);
});
