/** Camera choreography is pure and testable; all coordinates are illustrative scene units. */
export const CAMERA_OVERVIEW = Object.freeze({x:0,y:0,zoom:1});
export const FOCUS_DURATION_MS = 1450;
export function easeInOutCubic(t) {
  const x=Math.max(0,Math.min(1,Number.isFinite(t)?t:0));
  return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
}
/** Frame each world's sphere. Actual Saturnian rings extend beyond the sphere and need room. */
export function focusZoomFor(body) {
  if(!body || !(body.size>0)) return 1;
  const ringFactor=body.id==='saturn'?2.15:body.id==='uranus'?1.75:body.id==='neptune'?1.55:body.id==='jupiter'?1.45:1;
  const satelliteFactor=body.id==='earth'?1.15:1;
  return Math.min(34,Math.max(4,155/(body.size*.75*ringFactor*satelliteFactor)));
}
export function transitionCamera(from,to,startMs,durationMs=FOCUS_DURATION_MS) {
  return {from:{...from},to:{...to},startMs,durationMs:Math.max(1,durationMs)};
}
export function sampleCamera(transition,nowMs,targetOverride) {
  const progress=Math.max(0,Math.min(1,(nowMs-transition.startMs)/transition.durationMs));
  const e=easeInOutCubic(progress);
  const target=targetOverride ?? transition.to;
  return {x:transition.from.x+(target.x-transition.from.x)*e,
          y:transition.from.y+(target.y-transition.from.y)*e,
          zoom:transition.from.zoom+(target.zoom-transition.from.zoom)*e,
          complete:progress===1};
}
