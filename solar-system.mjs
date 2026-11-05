import {SOLAR_BODIES,ORBITAL_BODIES,BODY_BY_ID,INITIAL_BODY,positionsAt} from './planets.mjs';
import {CAMERA_OVERVIEW,FOCUS_DURATION_MS,focusZoomFor,sampleCamera,transitionCamera} from './camera-focus.mjs';
import {createSurfaceTexture,createAtmosphere,addRings,addEarthClouds,loadPlanetPhoto} from './planet-textures.mjs';
import {effectivePixelRatio,sceneAnchoring,satelliteSafeZoom,anchoredCameraOffset} from './render-quality.mjs';
import {frameIntervalFor,MARKER_INTERVAL_MS,dueForUpdate} from './performance.mjs';

/**
 * Hybrid orrery. Transparent Three.js stage and accessible SVG/DOM markers share a 440-unit
 * coordinate system. Selected bodies enter an eased camera closeup; the fact card never moves.
 * If WebGL, a texture canvas, or the CDN fails, the CSS-rendered planet is still selectable.
 */
export function initSolarSystem(root=document.getElementById('solar-system')) {
  if(!root)return ()=>{};
  const $=s=>root.querySelector(s),canvas=document.getElementById('solar-canvas'),svg=$('#solar-orbits'),stage=$('.solar-stage');
  const markers=$('#solar-markers'),picker=document.getElementById('planet-picker');
  const status=$('#solar-status'),facts=$('#planet-fact'),kind=$('#planet-kind');
  const title=$('#planet-name'),display=$('#planet-display'),returnButton=$('#solar-return');
  const fallback=$('#solar-closeup'),fallbackName=$('#solar-closeup-name');
  if(!canvas||!svg||!stage||!markers||!picker||!returnButton)return ()=>{};
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  const motion={enabled:!reduced.matches,visible:!document.hidden,intersecting:true};
  const NS='http://www.w3.org/2000/svg';
  let raf=0,last=0,elapsed=60,scene=null,camera=null,renderer=null,stars=null,webglReady=false;
  const hero=canvas.closest('.hero');
  let world=null,worldScale=1,textureUpgrade=null,resizeObserver=null;
  let threeModule=null,transition=null,focusedId=null,active=INITIAL_BODY;
  let cameraState={...CAMERA_OVERVIEW},cameraParallax={x:0,y:0},desiredParallax={x:0,y:0};
  const meshes=new Map(),markerMap=new Map(),pickerMap=new Map();
  let disposed=false,renderQuality=1,markerScale=1,lastMarkersAt=0,textureIdleHandle=null,frameInterval=1000/60;
  const positions=()=>positionsAt(elapsed);
  markerScale=Math.max(.01,stage.getBoundingClientRect().width/440);
  function closeupZoom(body){
    const preferred=focusZoomFor(body);
    if(body?.id!=='earth')return preferred;
    const backdrop=canvas.getBoundingClientRect(),rect=stage.getBoundingClientRect();
    const x=rect.left+rect.width/2;
    return satelliteSafeZoom(preferred,backdrop,x,Math.max(.01,rect.width/440),17);
  }

  svg.setAttribute('viewBox','0 0 440 440');
  for(const body of ORBITAL_BODIES){
    const track=document.createElementNS(NS,'ellipse');track.setAttribute('cx','220');track.setAttribute('cy','220');
    track.setAttribute('rx',body.radius);track.setAttribute('ry',body.radius*.76);
    track.classList.add('solar-track');track.dataset.orbit=body.id;svg.append(track);
  }
  const moonTrack=document.createElementNS(NS,'circle');
  moonTrack.setAttribute('class','solar-track solar-track--moon');moonTrack.setAttribute('r','13');svg.append(moonTrack);
  for(const body of SOLAR_BODIES){
    const button=document.createElement('button');button.type='button';button.className='solar-hit';
    button.dataset.body=body.id;button.dataset.planetSound=body.id;button.setAttribute('aria-label',`Focus on ${body.name}`);
    button.style.setProperty('--body-color',body.color);
    button.innerHTML=body.id==='sun'?'<span class="solar-hit__dot solar-hit__sun" aria-hidden="true">✦</span>':'<span class="solar-hit__dot" aria-hidden="true"></span>';
    button.addEventListener('click',()=>select(body.id,true));markers.append(button);markerMap.set(body.id,button);
    const pick=document.createElement('button');pick.type='button';pick.className='planet-chip';pick.dataset.body=body.id;pick.dataset.planetSound=body.id;
    pick.style.setProperty('--body-color',body.color);
    const symbol=document.createElement('span');symbol.className='planet-chip__orb';symbol.setAttribute('aria-hidden','true');
    const name=document.createElement('span');name.textContent=body.name;pick.append(symbol,name);
    pick.addEventListener('click',()=>{
      select(body.id,true);
      root.scrollIntoView({block:'center',behavior:reduced.matches?'auto':'smooth'});
    });picker.append(pick);pickerMap.set(body.id,pick);
  }

  function startCameraTransition(nextId) {
    focusedId=nextId;
    root.classList.toggle('is-focused',Boolean(nextId));
    returnButton.hidden=!nextId;
    markers.setAttribute('aria-hidden',String(Boolean(nextId)));
    for(const control of markerMap.values())control.tabIndex=nextId?-1:0;
    const body=nextId?BODY_BY_ID[nextId]:null;
    if(body){
      fallback.dataset.body=body.id;fallback.style.setProperty('--focus-color',body.color);
      fallbackName.textContent=body.name;
    }
    const p=nextId?positions()[nextId]:{x:0,y:0};
    const to=nextId?{x:p.x,y:p.y,zoom:closeupZoom(body)}:CAMERA_OVERVIEW;
    transition=transitionCamera(cameraState,to,performance.now(),reduced.matches?1:FOCUS_DURATION_MS);
    updateVisibleBodies();
    if(nextId)queueTextureUpgrade(nextId);
    if(reduced.matches){cameraState={...to};transition=null;renderOnce();}
    else start();
  }
  function select(id,focus=false) {
    const body=BODY_BY_ID[id];if(!body)return;
    active=id;document.body.dataset.planet=id;
    document.body.style.setProperty('--planet-accent',body.accent);
    document.body.style.setProperty('--planet-bg',body.background);
    document.body.style.setProperty('--planet-glow',body.glow);
    title.textContent=body.name;kind.textContent=body.kind;
    display.textContent=body.description;facts.textContent=body.fact;
    for(const [key,node] of markerMap)node.setAttribute('aria-pressed',String(key===id));
    for(const [key,node] of pickerMap)node.setAttribute('aria-pressed',String(key===id));
    status.textContent=`${body.name} selected. ${focus?'Camera focusing on this world.':'Choose a planet to explore.'}`;
    if(focus)startCameraTransition(id);
  }
  returnButton.addEventListener('click',()=>{
    startCameraTransition(null);
    status.textContent='Returned to the full solar system view.';
    markerMap.get(active)?.focus();
  });
  picker.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    const items=[...pickerMap.values()],i=items.indexOf(document.activeElement);
    if(i<0)return;event.preventDefault();
    const next=event.key==='Home'?0:event.key==='End'?items.length-1:(i+(event.key==='ArrowRight'?1:-1)+items.length)%items.length;
    items[next].focus();items[next].click();
  });

  function positionDom(t) {
    const locations=positionsAt(t);
    const factor=markerScale;
    for(const [id,button] of markerMap){
      const p=locations[id];button.style.left=`calc(50% + ${p.x*factor}px)`;button.style.top=`calc(50% - ${p.y*factor}px)`;
      button.style.zIndex=String(8+Math.round(p.z));
    }
    moonTrack.setAttribute('cx',String(locations.earth.x+220));
    moonTrack.setAttribute('cy',String(220-locations.earth.y));
  }
  function updateVisibleBodies(){
    for(const [id,mesh] of meshes){
      mesh.visible=!focusedId || id===focusedId || (focusedId==='earth' && id==='moon');
    }
  }
  function queueTextureUpgrade(id){
    if(!webglReady || !renderer || !threeModule || window.innerWidth<760)return;
    const target=meshes.get(id);
    if(!target || target.userData.highRes||target.userData.loadingPhoto)return;
    if(textureUpgrade!==null){
      if(window.cancelIdleCallback)window.cancelIdleCallback(textureUpgrade);
      else clearTimeout(textureUpgrade);
    }
    const work=()=>{
      textureUpgrade=null;
      if(disposed || !webglReady || !renderer || !target || target.userData.highRes)return;
      target.userData.loadingPhoto=true;
      const replaceMap=highRes=>{
        if(!highRes)return;
        if(disposed||!target.parent){highRes.dispose();return;}
        const previous=target.material.map;
        target.material.map=highRes;target.material.needsUpdate=true;
        target.userData.highRes=true;target.userData.loadingPhoto=false;
        previous?.dispose?.();renderOnce();
      };
      const fallback=()=>{
        if(disposed||!target.parent)return;
        try{ replaceMap(createSurfaceTexture(threeModule,id,{width:2048})); }
        catch(err){console.warn('Retaining standard-resolution planet texture:',err);target.userData.loadingPhoto=false;}
      };
      loadPlanetPhoto(threeModule,id,replaceMap,fallback);
    };
    textureUpgrade=window.requestIdleCallback?window.requestIdleCallback(work,{timeout:1400}):window.setTimeout(work,140);
  }
  function updateMeshes(dt){
    const locations=positions();
    for(const [id,mesh] of meshes){
      const p=locations[id];mesh.position.set(p.x,p.y,p.z);
      if(dt)mesh.rotation.y+=dt*(id==='sun'?.035:.065);
    }
    return locations;
  }
  function updateCamera(nowMs,dt,locations) {
    if(!camera)return;
    const movingTarget=focusedId?locations[focusedId]:{x:0,y:0};
    if(transition){
      const target={x:movingTarget.x,y:movingTarget.y,zoom:focusedId?closeupZoom(BODY_BY_ID[focusedId]):1};
      const result=sampleCamera(transition,nowMs,target);
      cameraState={x:result.x,y:result.y,zoom:result.zoom};
      if(result.complete)transition=null;
    }else if(focusedId){
      // Track each orbiting planet smoothly after the cinematic move ends.
      cameraState.x=movingTarget.x;cameraState.y=movingTarget.y;
    }
    const k=Math.min(1,dt*1.7);
    cameraParallax.x+=(desiredParallax.x-cameraParallax.x)*k;
    cameraParallax.y+=(desiredParallax.y-cameraParallax.y)*k;
    const px=focusedId?cameraParallax.x*.10:cameraParallax.x;
    const py=focusedId?cameraParallax.y*.10:cameraParallax.y;
    // The orbital world is anchored to the right-hand stage within the full
    // hero canvas. Camera zoom must compensate for that stage translation.
    // Otherwise zoom magnifies the world offset and moves planets offscreen.
    const offset=anchoredCameraOffset(world.position,cameraState,worldScale,cameraState.zoom,{x:px,y:py});
    camera.position.set(offset.x,offset.y,700);
    camera.lookAt(offset.x,offset.y,0);
    camera.zoom=cameraState.zoom;camera.updateProjectionMatrix();
  }
  function paint(nowMs,dt){
    // Accessible planet markers need fewer DOM updates than WebGL render passes.
    // Avoid forcing a layout read and 20+ style writes every frame.
    if(dueForUpdate(nowMs,lastMarkersAt,MARKER_INTERVAL_MS) || dt===0){
      positionDom(elapsed);
      lastMarkersAt=nowMs;
    }
    if(!webglReady||!renderer)return;
    const locations=updateMeshes(dt);
    updateCamera(nowMs,dt,locations);
    if(stars&&dt)stars.rotation.z+=dt*.0007;
    renderer.render(scene,camera);
  }
  function tick(now){
    raf=0;
    if(!motion.visible||!motion.intersecting||!motion.enabled)return;
    if(!dueForUpdate(now,last,frameInterval)){
      raf=requestAnimationFrame(tick);return;
    }
    const dt=last?Math.min(.05,(now-last)/1000):0;
    last=now;elapsed+=dt;
    paint(now,dt);
    raf=requestAnimationFrame(tick);
  }
  function stop(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;}
  function start(){if(disposed||!motion.visible||!motion.intersecting||!motion.enabled)return;if(!raf)raf=requestAnimationFrame(tick);}
  function renderOnce(){paint(performance.now(),0);}
  const onVisibility=()=>{motion.visible=!document.hidden;if(motion.visible)start();else stop();};
  const onMotion=()=>{motion.enabled=!reduced.matches;if(motion.enabled)start();else{stop();renderOnce();}};
  document.addEventListener('visibilitychange',onVisibility);
  reduced.addEventListener?.('change',onMotion);
  const observer=typeof IntersectionObserver==='undefined'?null:new IntersectionObserver(entries=>{
    motion.intersecting=entries[0]?.isIntersecting??false;
    if(motion.intersecting)start();else stop();
  },{rootMargin:'100px'});
  observer?.observe(root);
  root.addEventListener('pointermove',event=>{
    if(!motion.enabled)return;
    const bounds=root.getBoundingClientRect();
    if(!bounds.width||!bounds.height)return;
    desiredParallax={x:((event.clientX-bounds.left)/bounds.width-.5)*3,
      y:(.5-(event.clientY-bounds.top)/bounds.height)*3};
  },{passive:true});
  root.addEventListener('pointerleave',()=>{desiredParallax={x:0,y:0};});

  select(INITIAL_BODY,false);
  positionDom(elapsed);
  async function initializeThree(){
    try{
      if(!window.WebGL2RenderingContext)throw Error('WebGL2 is not available');
      const gl=canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'high-performance'});
      if(!gl)throw Error('WebGL context initialization failed');
      const THREE=await import('https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js');
      if(disposed||!canvas.isConnected)return;
      threeModule=THREE;
      scene=new THREE.Scene();
      camera=new THREE.OrthographicCamera(-220,220,220,-220,1,1800);
      renderer=new THREE.WebGLRenderer({canvas,context:gl,alpha:true,antialias:true,powerPreference:'high-performance'});
      renderer.outputColorSpace=THREE.SRGBColorSpace;
      renderer.toneMapping=THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure=1.35;
      world=new THREE.Group();scene.add(world);
      world.add(new THREE.AmbientLight(0xb4cae8,.57));
      const sunlight=new THREE.PointLight(0xffdfb1,62,0,0);
      sunlight.position.set(0,0,48);world.add(sunlight);
      // Reuse one detailed sphere geometry; upload color placeholders first.
      const geometry=new THREE.SphereGeometry(1,96,72);
      for(const body of SOLAR_BODIES){
        const texture=null; // First paint is immediate; idle tasks supply detailed textures.
        const material=body.id==='sun'
          ?new THREE.MeshBasicMaterial({map:texture||null,color:texture?'#ffffff':body.color})
          :new THREE.MeshStandardMaterial({map:texture||null,color:texture?'#ffffff':body.color,
             roughness:body.id==='earth'?.82:1,metalness:0});
        const mesh=new THREE.Mesh(geometry,material);
        mesh.scale.setScalar(body.size*.75);
        mesh.rotation.z=body.id==='uranus' ? Math.PI*.46 : body.id==='saturn' ? .12 : 0;
        world.add(mesh);meshes.set(body.id,mesh);
        if(['earth','venus','uranus','neptune','sun'].includes(body.id)){
          mesh.add(createAtmosphere(THREE,body.glow,body.id==='sun'?.45:.5));
        }
        // Earth clouds also render later as an idle texture task.
        addRings(THREE,mesh,body.id);
      }
      const coords=[],starGeometry=new THREE.BufferGeometry();
      for(let i=0;i<480;i++){
        const a=(i*.6180339887)%1,b=(i*.7548776662)%1;
        coords.push((a-.5)*3100,(b-.5)*1800,-190-((i*47)%320));
      }
      starGeometry.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));
      stars=new THREE.Points(starGeometry,new THREE.PointsMaterial({
         color:0xbbceef,size:1.1,sizeAttenuation:false,transparent:true,opacity:.58}));
      scene.add(stars);
      function syncLayout(){
        if(disposed||!renderer||!camera||!world)return;
        const canvasRect=canvas.getBoundingClientRect(),stageRect=stage.getBoundingClientRect();
        if(canvasRect.width<1 || canvasRect.height<1 || stageRect.width<1)return;
        const frame=sceneAnchoring(canvasRect,stageRect);
        worldScale=frame.scale;
        markerScale=frame.scale;
        frameInterval=frameIntervalFor(window.innerWidth,window.navigator?.deviceMemory ?? 8);
        world.scale.setScalar(worldScale);
        world.position.set(frame.x,frame.y,0);
        const w=Math.max(1,Math.round(canvasRect.width)),h=Math.max(1,Math.round(canvasRect.height));
        camera.left=-w/2;camera.right=w/2;camera.top=h/2;camera.bottom=-h/2;
        camera.updateProjectionMatrix();
        renderQuality=effectivePixelRatio(w,h,window.devicePixelRatio||1);
        renderer.setPixelRatio(renderQuality);
        renderer.setSize(w,h,false);
        positionDom(elapsed);
        renderOnce();
      }
      syncLayout();
      resizeObserver=typeof ResizeObserver==='undefined'?null:new ResizeObserver(syncLayout);
      resizeObserver?.observe(hero);resizeObserver?.observe(stage);
      window.addEventListener('resize',syncLayout,{passive:true});
      renderer.domElement.dataset.quality='responsive-high-dpi';
      renderer.domElement.dataset.resolution=String(Math.round(canvas.width))+'×'+String(Math.round(canvas.height));
      renderer.domElement.dataset.renderScale=renderQuality.toFixed(2);
      root._cleanupSolarLayout=()=>window.removeEventListener('resize',syncLayout);
      updateVisibleBodies();
      webglReady=true;
      // CPU-heavy procedural maps are generated after the first WebGL paint,
      // one at a time between frames, instead of blocking initial interactivity.
      const pending=[INITIAL_BODY,...SOLAR_BODIES.map(body=>body.id).filter(id=>id!==INITIAL_BODY),'earth-clouds'];
      const nextTexture=()=>{
        textureIdleHandle=null;
        if(disposed || !webglReady)return;
        const id=pending.shift();if(!id)return;
        const target=meshes.get(id==='earth-clouds'?'earth':id);
        if(id==='earth-clouds' && target && !target.userData.cloudsReady){
          try{addEarthClouds(THREE,target);target.userData.cloudsReady=true;}
          catch(error){console.warn('Keeping Earth without cloud overlay:',error);}
        }else if(target && !target.userData.highRes){
          try{
            const map=createSurfaceTexture(THREE,id,{width:id===INITIAL_BODY?1024:512});
            if(map && !target.userData.highRes){
              const old=target.material.map;
              target.material.map=map;target.material.needsUpdate=true;
              old?.dispose?.();
            }else map?.dispose?.();
          }catch(error){console.warn('Keeping simplified planet material:',id,error);}
          renderOnce();
        }
        if(pending.length)scheduleTexture();
      };
      function scheduleTexture(){
        textureIdleHandle=window.requestIdleCallback
          ?window.requestIdleCallback(nextTexture,{timeout:1600})
          :window.setTimeout(nextTexture,80);
      }
      root.classList.add('has-three');root.classList.remove('solar-fallback');
      hero?.classList.add('has-three-background');
      if(focusedId)startCameraTransition(focusedId);
      renderOnce();start();scheduleTexture();
      canvas.addEventListener('webglcontextlost',event=>{
        event.preventDefault();webglReady=false;stop();root.classList.remove('has-three');
        root.classList.add('solar-fallback');hero?.classList.remove('has-three-background');
        status.textContent='Graphics temporarily unavailable. Interactive 2D planet explorer remains available.';
      });
    }catch(error){
      console.warn('Using 2D planet fallback:',error);
      root.classList.add('solar-fallback');hero?.classList.remove('has-three-background');
      status.textContent='Accessible 2D planet explorer ready.';
    }
  }
  if(!reduced.matches)initializeThree();else {root.classList.add('solar-fallback');renderOnce();}
  start();
  return ()=>{
    disposed=true;stop();observer?.disconnect();resizeObserver?.disconnect();root._cleanupSolarLayout?.();
    hero?.classList.remove('has-three-background');
    if(textureUpgrade!==null){if(window.cancelIdleCallback)window.cancelIdleCallback(textureUpgrade);else clearTimeout(textureUpgrade);}
    if(textureIdleHandle!==null){if(window.cancelIdleCallback)window.cancelIdleCallback(textureIdleHandle);else clearTimeout(textureIdleHandle);}
    document.removeEventListener('visibilitychange',onVisibility);
    reduced.removeEventListener?.('change',onMotion);
    if(threeModule){
      for(const mesh of meshes.values()){
        mesh.material.map?.dispose?.();mesh.material.dispose();
        for(const child of mesh.children){child.material?.map?.dispose?.();child.material?.dispose?.();child.geometry?.dispose?.();}
      }
      stars?.geometry.dispose();stars?.material.dispose();
      // Sphere geometry is shared, dispose it only once.
      meshes.values().next().value?.geometry.dispose();
    }
    renderer?.dispose();
  };
}
