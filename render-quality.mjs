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
/** Keep Earth's orbiting Moon fully on-screen at any width. */
export function satelliteSafeZoom(requested,viewport,anchorX,scale,reach=17,margin=20){
  if(!Number.isFinite(requested)||requested<=0||!Number.isFinite(scale)||scale<=0)return 1;
  const available=Math.max(1,Math.min(anchorX-viewport.left,viewport.left+viewport.width-anchorX)-margin);
  return Math.max(1,Math.min(requested,available/(reach*scale)));
}
