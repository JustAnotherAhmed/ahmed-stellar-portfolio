/** Progressive quality: prevent multiple 4K decode/upload jobs competing at startup. */
export const ATLAS_CONCURRENCY = 2;
export function createTextureQueue(ids,{load,failed=()=>{},onSettled=()=>{},onComplete=()=>{},
  maxConcurrent=ATLAS_CONCURRENCY,delayMs=150,schedule=setTimeout,cancel=clearTimeout}={}){
  if(typeof load!=='function'||!Number.isInteger(maxConcurrent)||maxConcurrent<1)
    throw new TypeError('A loader and positive concurrency limit are required');
  let pending=[...new Set(ids)],active=new Set(),complete=new Set();
  let stopped=false,paused=false,timer=null,finished=false;
  const total=pending.length;
  const pump=()=>{
    if(stopped||paused)return;
    while(active.size<maxConcurrent&&pending.length){
      const id=pending.shift();
      if(complete.has(id)||active.has(id))continue;
      active.add(id);
      Promise.resolve().then(()=>load(id)).then(()=>true,async error=>{
        if(!stopped)try{await failed(id,error);}
        catch(fallbackError){console.warn('Texture fallback failed:',id,fallbackError);}
        return false;
      }).then(success=>{
        active.delete(id);complete.add(id);
        if(stopped)return;
        try{onSettled({id,success,completed:complete.size,total});}
        catch(error){console.warn('Texture progress unavailable:',error);}
        if(complete.size===total && !finished){
          finished=true;
          try{onComplete({completed:complete.size,total});}
          catch(error){console.warn('Texture completion handler failed:',error);}
        }else if(pending.length)next();
      });
    }
  };
  const next=()=>{
    if(stopped||paused||timer!==null)return;
    timer=schedule(()=>{timer=null;pump();},delayMs);
  };
  return {
    start:next,
    prioritize(id){
      if(stopped||active.has(id)||complete.has(id))return;
      const index=pending.indexOf(id);
      if(index>=0){pending.splice(index,1);pending.unshift(id);next();}
    },
    pause(){paused=true;if(timer!==null){cancel(timer);timer=null;}},
    resume(){if(stopped||!paused)return;paused=false;next();},
    stop(){stopped=true;pending=[];if(timer!==null){cancel(timer);timer=null;}},
    get pending(){return [...pending];},
    get active(){return [...active];},
  };
}
