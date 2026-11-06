import test from 'node:test';
import assert from 'node:assert/strict';
import {selectDeviceProfile,adaptivePixelRatio} from './device-profile.mjs';
test('desktop retains four-thousand-pixel planet textures',()=>{
 const p=selectDeviceProfile({width:1440,coarse:false,memory:8});
 assert.equal(p.mobile,false);
 assert.equal(p.textureWidth,4096);
 assert.equal(p.focusTextureWidth,4096);
 assert.equal(p.mapConcurrency,2);
 assert.equal(p.frameRate,60);
});
test('mobile uses smaller source decode, safe framebuffer and fewer concurrent downloads',()=>{
 const p=selectDeviceProfile({width:390,coarse:true});
 assert.equal(p.mobile,true);
 assert.equal(p.textureWidth,1024);
 assert.equal(p.focusTextureWidth,2048);
 assert.equal(p.mapConcurrency,1);
 assert.equal(p.initialIds.length,4);
 const ratio=adaptivePixelRatio(390,844,3,8192,p);
 assert.ok(ratio<=1.75&&ratio>=1);
 assert.ok(390*844*ratio*ratio<=2_500_001);
});
test('older phones with very low memory favor 2D fallback, not an OOM reload loop',()=>{
 const p=selectDeviceProfile({width:375,coarse:true,memory:1,saveData:true});
 assert.equal(p.force2D,true);
 assert.ok(adaptivePixelRatio(375,812,3,8192,p)<=1.25);
});
test('desktop framebuffer avoids unreasonable GPU allocation without changing atlas source',()=>{
 const p=selectDeviceProfile({width:1920,coarse:false,memory:8});
 const r=adaptivePixelRatio(1920,1080,2,8192,p);
 assert.ok(r>1.5);
 assert.ok(1920*1080*r*r<=14_000_001);
});
