import { SOLAR_BODIES, ORBITAL_BODIES, BODY_BY_ID, INITIAL_BODY, positionsAt } from './planets.mjs';

/**
 * Hybrid scene: Three.js spheres and point stars + real DOM/SVG 2D orbital paths.
 * DOM controls and scientific descriptions work even if WebGL/CDN fails.
 */
export function initSolarSystem(root=document.getElementById('solar-system')) {
  if (!root) return () => {};
  const $=selector=>root.querySelector(selector);
  const svg=$('#solar-orbits'), markers=$('#solar-markers'), picker=document.getElementById('planet-picker');
  const canvas=$('#solar-canvas'), display=$('#planet-display');
  const facts=$('#planet-fact'), kind=$('#planet-kind'), title=$('#planet-name');
  const status=$('#solar-status');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const sceneMotion={enabled:!reduced.matches,visible:!document.hidden,intersecting:true};
  const NS='http://www.w3.org/2000/svg';
  let raf=0,renderer=null,scene=null,camera=null,meshes=new Map(),stars=null,active=INITIAL_BODY;
  let elapsed=60,last=0,webglReady=false,cameraTarget={x:0,y:0},cameraNow={x:0,y:0};
  const markerMap=new Map(),pickerMap=new Map(),worldScale=1;
  for(const body of ORBITAL_BODIES){
    const track=document.createElementNS(NS,'ellipse');
    track.setAttribute('cx','50%');track.setAttribute('cy','50%');
    track.setAttribute('rx',String(body.radius));track.setAttribute('ry',String(body.radius*.76));
    track.setAttribute('class','solar-track');track.dataset.orbit=body.id;
    svg.append(track);
  }
  const moonTrack=document.createElementNS(NS,'circle');moonTrack.setAttribute('class','solar-track solar-track--moon');moonTrack.setAttribute('r','13');svg.append(moonTrack);
  for(const body of SOLAR_BODIES){
    const button=document.createElement('button');button.type='button';button.className='solar-hit';
    button.dataset.body=body.id;button.title=`Explore ${body.name}`;button.setAttribute('aria-label',`Explore ${body.name}`);
    button.style.setProperty('--body-color',body.color);
    button.innerHTML=`<span class="solar-hit__dot" aria-hidden="true"></span>`;
    button.addEventListener('click',()=>select(body.id));markers.append(button);markerMap.set(body.id,button);
    const pick=document.createElement('button');pick.type='button';pick.className='planet-chip';pick.dataset.body=body.id;
    pick.innerHTML=`<span class="planet-chip__orb" aria-hidden="true"></span><span>${body.name}</span>`;
    pick.style.setProperty('--body-color',body.color);
    pick.addEventListener('click',()=>select(body.id));picker.append(pick);pickerMap.set(body.id,pick);
  }
  function select(id) {
    const body=BODY_BY_ID[id];if(!body)return;
    active=id;
    document.body.dataset.planet=id;
    document.body.style.setProperty('--planet-accent',body.accent);
    document.body.style.setProperty('--planet-bg',body.background);
    document.body.style.setProperty('--planet-glow',body.glow);
    title.textContent=body.name; kind.textContent=body.kind;
    display.textContent=body.description;facts.textContent=body.fact;
    for (const [key,element] of markerMap)element.setAttribute('aria-pressed',String(key===id));
    for (const [key,element] of pickerMap)element.setAttribute('aria-pressed',String(key===id));
    status.textContent=`${body.name} selected. Website colors now match ${body.name}.`;
    // The SVG remains a usable 2D explorer when WebGL is unavailable.
  }
  picker.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    const items=[...pickerMap.values()],i=items.indexOf(document.activeElement);
    if(i<0)return;event.preventDefault();
    const next=event.key==='Home'?0:event.key==='End'?items.length-1:(i+(event.key==='ArrowRight'?1:-1)+items.length)%items.length;
    items[next].focus();items[next].click();
  });
  function positionDom(t) {
    const positions=positionsAt(t);
    for(const [id,button] of markerMap){
      const p=positions[id];
      button.style.left=`calc(50% + ${p.x*worldScale}px)`;
      button.style.top=`calc(50% - ${p.y*worldScale}px)`;
      button.style.zIndex=String(8+Math.round(p.z));
    }
    const earth=positions.earth;
    moonTrack.setAttribute('cx',String(earth.x+220)); // SVG has viewBox -220 -220 440 440
    moonTrack.setAttribute('cy',String(220-earth.y));
  }
  // An SVG viewBox includes all orbital radii; scalable in CSS regardless of screen width.
  svg.setAttribute('viewBox','0 0 440 440');
  for(const track of svg.querySelectorAll('ellipse')){
    track.setAttribute('cx','220');track.setAttribute('cy','220');
  }
  // DOM marker coordinates are in fixed px because the scene itself is a 440px design canvas,
  // scaled as a unit with CSS on narrower viewports.
  function tick(now){
    raf=0;
    if(!sceneMotion.visible||!sceneMotion.intersecting||!sceneMotion.enabled)return;
    const dt=last?Math.min(.05,(now-last)/1000):0;
    last=now;elapsed+=dt;
    positionDom(elapsed);
    if(webglReady){
      const positions=positionsAt(elapsed);
      for(const [id,mesh] of meshes){ const p=positions[id];mesh.position.set(p.x,p.y,p.z);mesh.rotation.y+=dt*.12; }
      cameraNow.x+=(cameraTarget.x-cameraNow.x)*Math.min(1,dt*1.8);
      cameraNow.y+=(cameraTarget.y-cameraNow.y)*Math.min(1,dt*1.8);
      camera.position.x=cameraNow.x;camera.position.y=cameraNow.y;camera.lookAt(0,0,0);
      if(stars)stars.rotation.z+=dt*.001;
      renderer.render(scene,camera);
    }
    raf=requestAnimationFrame(tick);
  }
  function stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;}
  function start(){if(!sceneMotion.visible||!sceneMotion.intersecting||!sceneMotion.enabled)return;if(!raf)raf=requestAnimationFrame(tick);}
  function renderOnce(){positionDom(elapsed);if(webglReady&&renderer){for(const [id,mesh] of meshes){const p=positionsAt(elapsed)[id];mesh.position.set(p.x,p.y,p.z);}renderer.render(scene,camera);}}
  const visibilityHandler=()=>{sceneMotion.visible=!document.hidden;if(sceneMotion.visible)start();else stop();};
  const motionHandler=()=>{sceneMotion.enabled=!reduced.matches;if(sceneMotion.enabled)start();else {stop();renderOnce();}};
  document.addEventListener('visibilitychange',visibilityHandler);
  reduced.addEventListener?.('change',motionHandler);
  const observer=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(entries=>{
    sceneMotion.intersecting=entries[0]?.isIntersecting??false;
    if(sceneMotion.intersecting)start();else stop();
  },{rootMargin:'100px'});
  observer?.observe(root);
  root.addEventListener('pointermove',event=>{
    if(!sceneMotion.enabled)return;
    const box=root.getBoundingClientRect();
    cameraTarget.x=((event.clientX-box.left)/box.width-.5)*5;
    cameraTarget.y=(.5-(event.clientY-box.top)/box.height)*5;
  },{passive:true});
  root.addEventListener('pointerleave',()=>{cameraTarget.x=0;cameraTarget.y=0;});
  select(INITIAL_BODY);
  positionDom(elapsed);
  async function initializeThree() {
    // Failure here does not affect the DOM orrery, themes or any resume content.
    try {
      if (!window.WebGL2RenderingContext) throw Error('WebGL2 unavailable');
      const gl=canvas.getContext('webgl2',{alpha:true,antialias:false,powerPreference:'low-power'});
      if(!gl)throw Error('WebGL context unavailable');
      const THREE=await import('https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js');
      // Avoid creating GPU context if the canvas is detached during loading.
      if(!canvas.isConnected)return;
      const scene3=new THREE.Scene();scene=scene3;
      camera=new THREE.OrthographicCamera(-220,220,220,-220,1,1200);camera.position.set(0,0,520);camera.lookAt(0,0,0);
      renderer=new THREE.WebGLRenderer({canvas,context:gl,alpha:true,antialias:false,powerPreference:'low-power'});
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.setSize(440,440,false);
      scene.add(new THREE.AmbientLight(0xb0c5eb,1.75));
      const point=new THREE.PointLight(0xffd9ac,80,450,1);point.position.set(0,0,35);scene.add(point);
      const geometry=new THREE.SphereGeometry(1,20,14);
      for(const body of SOLAR_BODIES){
        const material=new THREE.MeshStandardMaterial({color:body.color,roughness:body.id==='sun'?.5:.85,metalness:0,emissive:body.id==='sun'?body.color:'#000000',emissiveIntensity:body.id==='sun'?1.5:0});
        const mesh=new THREE.Mesh(geometry,material);mesh.scale.setScalar(body.size*.75);scene.add(mesh);meshes.set(body.id,mesh);
        if(body.id==='saturn'){
          const ring=new THREE.Mesh(new THREE.RingGeometry(body.size*.9,body.size*1.35,64),new THREE.MeshBasicMaterial({color:0xc8b796,transparent:true,opacity:.6,side:THREE.DoubleSide,depthWrite:false}));
          ring.rotation.x=.45;mesh.add(ring);
        }
      }
      const starGeometry=new THREE.BufferGeometry(),coords=[];
      for(let i=0;i<170;i++){const a=i*2.39996322972865;const r=Math.sqrt((i+1)/170)*320;coords.push(Math.cos(a)*r,Math.sin(a)*r,(i*17)%190-120);}
      starGeometry.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));
      stars=new THREE.Points(starGeometry,new THREE.PointsMaterial({color:0xb3c8ff,size:1.05,sizeAttenuation:false,transparent:true,opacity:.75}));scene.add(stars);
      webglReady=true;root.classList.add('has-three');
      renderOnce();start();
      canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();webglReady=false;stop();root.classList.remove('has-three');status.textContent='3D view paused. Planet explorer remains available.';},{once:true});
    }catch(error){console.warn('3D solar scene unavailable, using accessible 2D orbit fallback',error);root.classList.add('solar-fallback');status.textContent='2D planetary explorer ready.';}
  }
  // Allow content to paint first; loading an optional 3D scene cannot block the page.
  if(!reduced.matches)initializeThree();
  else {root.classList.add('solar-fallback');renderOnce();}
  start();
  return ()=>{stop();observer?.disconnect();document.removeEventListener('visibilitychange',visibilityHandler);reduced.removeEventListener?.('change',motionHandler);renderer?.dispose();};
}
