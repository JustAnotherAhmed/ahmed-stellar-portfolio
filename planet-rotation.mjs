/** Accessible drag-and-keyboard rotation for a selected WebGL planet. */
export const ROTATION_SENSITIVITY=0.008;
export const MAX_PLANET_PITCH=1.25;
export function rotatePlanet(mesh,dx,dy,{sensitivity=ROTATION_SENSITIVITY}={}){
  if(!mesh?.rotation||![dx,dy,sensitivity].every(Number.isFinite))return false;
  mesh.rotation.y+=dx*sensitivity;
  mesh.rotation.x=Math.max(-MAX_PLANET_PITCH,Math.min(MAX_PLANET_PITCH,mesh.rotation.x+dy*sensitivity));
  return true;
}
export function attachPlanetRotation(surface,{canRotate=()=>false,rotate=()=>{},onDragChange=()=>{}}={}){
  if(!surface)return ()=>{};
  let activePointer=null,prevX=0,prevY=0;
  function release(){
    if(activePointer===null)return;
    const id=activePointer;activePointer=null;surface.dataset.dragging='false';
    try{surface.releasePointerCapture?.(id);}catch{}
    onDragChange(false);
  }
  function down(e){
    if(!canRotate()||(e.pointerType==='mouse'&&e.button!==0)||activePointer!==null)return;
    activePointer=e.pointerId;prevX=e.clientX;prevY=e.clientY;
    surface.dataset.dragging='true';
    try{surface.setPointerCapture?.(e.pointerId);}catch{}
    onDragChange(true);e.preventDefault();
  }
  function move(e){
    if(activePointer===null||activePointer!==e.pointerId)return;
    if(!canRotate()){release();return;}
    const dx=e.clientX-prevX,dy=e.clientY-prevY;prevX=e.clientX;prevY=e.clientY;
    if(dx||dy)rotate(dx,dy);
    e.preventDefault();
  }
  function up(e){if(activePointer===e.pointerId)release();}
  function keydown(e){
    if(!canRotate())return;
    const moves={ArrowLeft:[-24,0],ArrowRight:[24,0],ArrowUp:[0,-24],ArrowDown:[0,24]};
    const delta=moves[e.key];if(!delta)return;
    e.preventDefault();rotate(...delta);
  }
  surface.addEventListener('pointerdown',down);
  surface.addEventListener('pointermove',move);
  surface.addEventListener('pointerup',up);
  surface.addEventListener('pointercancel',up);
  surface.addEventListener('lostpointercapture',release);
  surface.addEventListener('keydown',keydown);
  return ()=>{
    release();
    surface.removeEventListener('pointerdown',down);
    surface.removeEventListener('pointermove',move);
    surface.removeEventListener('pointerup',up);
    surface.removeEventListener('pointercancel',up);
    surface.removeEventListener('lostpointercapture',release);
    surface.removeEventListener('keydown',keydown);
  };
}
