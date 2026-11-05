/** Lightweight, deterministic render pacing for desktop and low-power devices. */
export function frameIntervalFor(width,deviceMemory=8){
  if(!Number.isFinite(width)||width<1)return 1000/60;
  if(width<=680||(Number.isFinite(deviceMemory)&&deviceMemory>0&&deviceMemory<=4))return 1000/30;
  if(width<=1024)return 1000/45;
  return 1000/60;
}
export const MARKER_INTERVAL_MS=1000/24;
export function dueForUpdate(now,last,interval){
  if(!Number.isFinite(now)||!Number.isFinite(interval)||interval<=0)return false;
  return last===0||now-last+0.5>=interval;
}
