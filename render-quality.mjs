/** Keep the scene crisp on high-DPI screens without unlimited GPU work. */
export const MAX_RENDER_PIXELS = 9_500_000;
export function effectivePixelRatio(width,height,deviceRatio=1,budget=MAX_RENDER_PIXELS){
  if(![width,height,deviceRatio,budget].every(Number.isFinite)||width<=0||height<=0||budget<=0)return 1;
  const desired=Math.min(Math.max(deviceRatio,1),2.25);
  return Math.max(.5,Math.min(desired,Math.sqrt(budget/(width*height))));
}
export function sceneAnchoring(backdrop,stage){
  const scale=stage.width/440;
  return {scale,
    x:stage.left+stage.width/2-(backdrop.left+backdrop.width/2),
    y:(backdrop.top+backdrop.height/2)-(stage.top+stage.height/2)};
}
/**
 * Compute the camera offset so a local world point stays at the
 * scene's right-hand overlay anchor under orthographic zoom.
 *
 * projectedX = zoom * (anchor.x + local.x * scale - camera.x)
 * At centered focus projectedX must equal anchor.x for any zoom.
 */
export function anchoredCameraOffset(anchor,local,scale,zoom,parallax={x:0,y:0}){
  if(!Number.isFinite(zoom)||zoom<=0||!Number.isFinite(scale)||scale<=0)
    throw new RangeError('Invalid camera scale or zoom');
  const hold=1-1/zoom;
  return {
    x:local.x*scale+anchor.x*hold+(parallax.x||0),
    y:local.y*scale+anchor.y*hold+(parallax.y||0)
  };
}
/** Keep Earth's orbiting Moon fully on-screen at any width. */
export function satelliteSafeZoom(requested,viewport,anchorX,scale,reach=17,margin=20){
  if(!Number.isFinite(requested)||requested<=0||!Number.isFinite(scale)||scale<=0)return 1;
  const available=Math.max(1,Math.min(anchorX-viewport.left,viewport.left+viewport.width-anchorX)-margin);
  return Math.max(1,Math.min(requested,available/(reach*scale)));
}

/** Quality-first retina framebuffer up to 4x pixel density.
 * Hardware maximum renderbuffer dimension is the only safety cap.
 * No mobile/device-memory FPS or megapixel budget downshift. */
export function cinematicPixelRatio(width,height,deviceRatio=1,maxRenderbuffer=16384){
  if(![width,height,deviceRatio,maxRenderbuffer].every(Number.isFinite)||width<=0||height<=0||maxRenderbuffer<1)return 1;
  const ratio=Math.max(2.5,Math.min(4,deviceRatio*1.5));
  return Math.max(.5,Math.min(ratio,maxRenderbuffer/width,maxRenderbuffer/height));
}
