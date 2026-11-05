/** Self-contained procedural astronomical surface art. No third-party texture host required. */
function hash(a,b,c=0) {let x=Math.sin(a*127.1+b*311.7+c*74.7)*43758.5453;return x-Math.floor(x);}
const palettes={
 sun:['#f65325','#fda83c','#ffda70','#ffe6a0'],mercury:['#444850','#737782','#a3a5a8','#d3c8b9'],
 venus:['#77543f','#bc916c','#e5be93','#f1d6ad'],earth:['#11376b','#155891','#247db8','#2c8cb8'],
 moon:['#4b4a4c','#737177','#969497','#bbb9b8'],mars:['#5e2921','#923b2e','#bc5e3c','#d79668'],
 jupiter:['#6c463b','#ac7c68','#d9b28e','#eee2c8'],saturn:['#7e6854','#b79d78','#e6d0aa','#f6e7cc'],
 uranus:['#3f96a1','#61c1c9','#9de4dd','#c9f1e6'],neptune:['#152c75','#2752a9','#4779cf','#7ba5ee']};
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
function blended(colors,t){const x=Math.max(0,Math.min(.999,t))*(colors.length-1),i=Math.floor(x),w=x-i;const a=colors[i],b=colors[Math.min(i+1,colors.length-1)];return a.map((v,j)=>Math.round(v*(1-w)+b[j]*w));}
export function createSurfaceTexture(THREE,id,{width=1024}={}) {
  if(typeof document==='undefined')return null;
  const palette=palettes[id];if(!palette)return null;
  const canvas=document.createElement('canvas');canvas.width=Math.max(512,Math.min(2048,Math.round(width)));canvas.height=canvas.width/2;
  const ctx=canvas.getContext('2d');if(!ctx)return null;
  const sw=canvas.width,sh=canvas.height,colors=palette.map(rgb);
  const data=ctx.createImageData(sw,sh),pixels=data.data;
  for(let y=0;y<sh;y++){
    const lat=(y/sh-.5)*Math.PI,latCos=Math.cos(lat),polar=Math.abs(y/sh-.5)*2;
    for(let x=0;x<sw;x++){
      const lon=x/sw*Math.PI*2, noise=hash(x>>2,y>>2,id.length),fine=hash(x,y,id.length);
      const waves=Math.sin(lat*21+Math.sin(lon*5)*1.4)+.45*Math.sin(lat*49+Math.sin(lon*9)*2.5);
      let palettePos=(.4+.2*waves+.12*(noise-.5));
      let special=null;
      if(id==='earth'){
        const continent=Math.sin(lon*3.7+Math.cos(lat*4)*1.4)+Math.cos(lon*2.1-lat*5.7)+.7*Math.sin(lon*8.3+lat*6.1);
        special=polar>.9?[217,226,223]:continent>.7?[55+Math.floor(noise*26),108+Math.floor(noise*48),62+Math.floor(noise*30)]:null;
        if(continent>.7 && polar>.68)special=[147,155,110];
        if(!special && Math.sin(lon*25+lat*19)*Math.sin(lat*37+lon*14)>.83)special=[178,206,225];
        palettePos=.2+.5*(Math.sin(lon*3+lat*5)+1)/2;
      }else if(id==='sun') {
        const knots=Math.sin(lon*34+Math.cos(lat*21))*Math.cos(lat*45+Math.sin(lon*19));
        const grain=Math.sin(lon*97+Math.sin(lat*62)*1.8)*Math.sin(lat*103+Math.cos(lon*81));
        palettePos=.57+.20*knots+.12*grain+.11*(noise-.5)+.06*(fine-.5);
      }
      else if(['jupiter','saturn','uranus','neptune','venus'].includes(id)){
        const freq=id==='jupiter'?43:id==='saturn'?60:id==='venus'?25:16;
        palettePos=.49+.19*Math.sin(lat*freq+Math.sin(lon*6+lat*11)*.65)+.14*Math.sin(lat*freq*.46+lon*1.2)+.06*(noise-.5)+.045*(fine-.5);
        if(id==='neptune'&&Math.sin(lat*13+lon*4)>.85)palettePos-=.14;
      }else if(id==='moon'||id==='mercury'||id==='mars'){
        palettePos=.45+.14*Math.sin(lon*7+lat*14)+.3*(noise-.5)+.08*(fine-.5);
        if(id==='mars' && polar>.9)special=[208,198,181];
      }
      const color=special||blended(colors,palettePos);let i=(y*sw+x)*4;
      pixels[i]=color[0];pixels[i+1]=color[1];pixels[i+2]=color[2];pixels[i+3]=255;
    }
  }
  ctx.putImageData(data,0,0);
  // Impact craters, bands and a recognizable Great Red Spot are part of the texture itself.
  if(['moon','mercury','mars'].includes(id)){
    const n=id==='mars'?130:310;
    for(let i=0;i<n;i++){
      const x=hash(i,4,id.length)*sw,y=hash(i,17,id.length)*sh;
      const radius=((id==='mars'?1:2)+hash(i,21,id.length)*(id==='mars'?7:11))*(sw/768);
      ctx.beginPath();ctx.ellipse(x,y,radius,radius*.68,0,0,Math.PI*2);
      ctx.strokeStyle='rgba(18,17,18,.19)';ctx.lineWidth=1.2;ctx.stroke();
      ctx.beginPath();ctx.arc(x-radius*.13,y-radius*.13,radius*.8,Math.PI*.1,Math.PI*1.05);ctx.strokeStyle='rgba(247,236,224,.19)';ctx.stroke();
    }
  }
  if(id==='jupiter'){
    ctx.beginPath();ctx.ellipse(sw*.69,sh*.57,49*sw/768,15*sh/384,-.13,0,Math.PI*2);ctx.fillStyle='#b56e56';ctx.fill();
    ctx.beginPath();ctx.ellipse(sw*.69,sh*.57,41*sw/768,10*sh/384,-.13,0,Math.PI*2);ctx.fillStyle='#cf8a6b';ctx.fill();
  }
  if(id==='neptune'){
    ctx.beginPath();ctx.ellipse(sw*.3,sh*.53,39,16,-.21,0,Math.PI*2);ctx.fillStyle='#26387a';ctx.globalAlpha=.54;ctx.fill();ctx.globalAlpha=1;
  }
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.wrapS=THREE.RepeatWrapping;
  texture.anisotropy=8;texture.generateMipmaps=true;
  texture.minFilter=THREE.LinearMipmapLinearFilter;
  texture.magFilter=THREE.LinearFilter;
  return texture;
}
export function createAtmosphere(THREE,color,opacity=.42) {
  const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.BackSide,
    uniforms:{glowColor:{value:new THREE.Color(color)},strength:{value:opacity}},
    vertexShader:`varying vec3 vNormal;varying vec3 vPosition;void main(){vNormal=normalize(normalMatrix*normal);vec4 view=modelViewMatrix*vec4(position,1.);vPosition=view.xyz;gl_Position=projectionMatrix*view;}`,
    fragmentShader:`uniform vec3 glowColor;uniform float strength;varying vec3 vNormal;varying vec3 vPosition;void main(){float rim=pow(1.0-abs(dot(normalize(vNormal),normalize(-vPosition))),2.4);gl_FragColor=vec4(glowColor,rim*strength);}`});
  return new THREE.Mesh(new THREE.SphereGeometry(1.055,48,32),mat);
}
export function addRings(THREE,mesh,id) {
  const specifications={
    jupiter:{inner:1.32,outer:1.48,color:0x927d67,opacity:.13,tilt:.63},
    saturn:{inner:1.18,outer:2.18,color:0xd4c2a6,opacity:.77,tilt:.48},
    uranus:{inner:1.35,outer:1.85,color:0x89d3d3,opacity:.37,tilt:1.1},
    neptune:{inner:1.36,outer:1.53,color:0x8aa2c9,opacity:.23,tilt:.9}
  };
  const config=specifications[id];if(!config)return;
  const rings=new THREE.Mesh(new THREE.RingGeometry(config.inner,config.outer,128),
    new THREE.MeshBasicMaterial({color:config.color,side:THREE.DoubleSide,transparent:true,opacity:config.opacity,depthWrite:false}));
  rings.rotation.x=config.tilt;rings.rotation.y=.18;mesh.add(rings);
  // Geometry is in unit-sphere coordinates: never multiply radii by body.size again.
}

/** Transparent, subtly varied Earth cloud layer. */
export function addEarthClouds(THREE,earth){
  if(typeof document==='undefined')return null;
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;
  const ctx=canvas.getContext('2d');if(!ctx)return null;
  const image=ctx.createImageData(canvas.width,canvas.height);
  for(let y=0;y<canvas.height;y++){
    const lat=(y/canvas.height-.5)*Math.PI;
    for(let x=0;x<canvas.width;x++){
      const lon=x/canvas.width*Math.PI*2;
      const broad=Math.sin(lon*11+Math.sin(lat*5)*1.8)*Math.cos(lat*17-lon*2);
      const middle=Math.sin(lon*27-lat*19)*Math.cos(lat*35+lon*9);
      const detail=hash(x>>3,y>>3);
      const shape=.56*broad+.33*middle+.12*(detail-.5);
      const alpha=Math.min(185,Math.max(0,Math.floor((shape-.18)*250)));
      const i=(y*canvas.width+x)*4;
      image.data[i]=245;image.data[i+1]=248;image.data[i+2]=255;image.data[i+3]=alpha;
    }
  }
  ctx.putImageData(image,0,0);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const material=new THREE.MeshStandardMaterial({map:texture,transparent:true,depthWrite:false,opacity:.78,
    roughness:1,metalness:0,side:THREE.FrontSide});
  const cloudSphere=new THREE.Mesh(new THREE.SphereGeometry(1.018,80,64),material);
  cloudSphere.name='Earth cloud layer';earth.add(cloudSphere);
  return cloudSphere;
}
/** Real visual maps from Solar System Scope, CC BY 4.0. Procedural maps always work offline. */
export const PHOTO_TEXTURE_PATHS=Object.freeze({
  sun:'2k_sun.jpg',mercury:'2k_mercury.jpg',venus:'2k_venus_atmosphere.jpg',
  earth:'2k_earth_daymap.jpg',moon:'2k_moon.jpg',mars:'2k_mars.jpg',
  jupiter:'2k_jupiter.jpg',saturn:'2k_saturn.jpg',uranus:'2k_uranus.jpg',neptune:'2k_neptune.jpg',
});
export function planetPhotoUrl(id){
  const file=PHOTO_TEXTURE_PATHS[id];
  return file ? 'https://www.solarsystemscope.com/textures/download/'+file : null;
}
export function loadPlanetPhoto(THREE,id,onLoad,onError=()=>{}){
  const url=planetPhotoUrl(id);
  if(!url){onError(new Error('No photographic texture for '+id));return;}
  try{
    const loader=new THREE.TextureLoader();loader.setCrossOrigin('anonymous');
    loader.load(url,texture=>{
      texture.colorSpace=THREE.SRGBColorSpace;
      texture.anisotropy=8;
      texture.minFilter=THREE.LinearMipmapLinearFilter;
      onLoad(texture);
    },undefined,error=>onError(error));
  }catch(error){onError(error);}
}
