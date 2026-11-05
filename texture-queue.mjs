/** Progressive quality: prevent multiple 4K decode/upload jobs competing at startup. */
export const ATLAS_CONCURRENCY = 2;
export function createTextureQueue(ids,{load,failed=()=>{},maxConcurrent=ATLAS_CONCURRENCY,delayMs=150,
  schedule=setTimeout,cancel=clearTimeout}={}){
  if(typeof load!=='function'||!Number.isInteger(maxConcurrent)||maxConcurrent<1)
    throw new TypeError('A loader and positive concurrency limit are required');
  let pending=[...new Set(ids)],active=new Set(),complete=new Set();
  let stopped=false,timer=null;
  const pump=()=>{
    if(stopped)return;
    while(active.size<maxConcurrent&&pending.length){
      const id=pending.shift();
      if(complete.has(id)||active.has(id))continue;
      active.add(id);
      Promise.resolve().then(()=>load(id)).catch(error=>{if(!stopped)failed(id,error);})
        .finally(()=>{
          active.delete(id);complete.add(id);
          if(!stopped&&pending.length)next();
        });
    }
  };
  const next=()=>{
    if(stopped||timer!==null)return;
    timer=schedule(()=>{timer=null;pump();},delayMs);
  };
  return {
    start:next,
    prioritize(id){
      if(stopped||active.has(id)||complete.has(id))return;
      const index=pending.indexOf(id);
      if(index>=0){pending.splice(index,1);pending.unshift(id);next();}
    },
    stop(){stopped=true;pending=[];if(timer!==null){cancel(timer);timer=null;}},
    get pending(){return [...pending];},
    get active(){return [...active];},
  };
}
