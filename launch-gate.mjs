/**
 * Accessible first-visit stage for the 4K solar system.
 * It never renders for no-JS users and releases immediately on WebGL failure.
 * A slow network leaves the visitor a way to access the portfolio without waiting.
 */
export function createLaunchGate({doc=globalThis.document,schedule=globalThis.setTimeout,
  cancel=globalThis.clearTimeout,skipAfterMs=9000,autoReleaseAfterMs=0,onReleased=()=>{}}={}){
  const root=doc?.getElementById('stellar-loader');
  const text=root?.querySelector('#stellar-loader-message');
  const meter=root?.querySelector('#stellar-loader-meter');
  const percent=root?.querySelector('#stellar-loader-percent');
  const skip=root?.querySelector('#stellar-loader-skip');
  const header=doc?.querySelector?.('header'),main=doc?.getElementById?.('main');
  if(!root||!text||!meter||!skip)return {
    active:false,open(){},progress(){},close(){},dispose(){}
  };
  let active=false,timeout=null,autoTimeout=null,previousHeader=false,previousMain=false;
  const close=()=>{
    if(!active)return;
    active=false;root.hidden=true;
    doc.body?.classList?.remove('stellar-preparing');
    if(header)header.inert=previousHeader;
    if(main)main.inert=previousMain;
    if(timeout!==null){cancel(timeout);timeout=null;}
    if(autoTimeout!==null){cancel(autoTimeout);autoTimeout=null;}
    skip.removeEventListener('click',close);
    onReleased();
  };
  return {
    get active(){return active;},
    open(total){
      if(active)return;
      active=true;
      previousHeader=Boolean(header?.inert);previousMain=Boolean(main?.inert);
      if(header)header.inert=true;
      if(main)main.inert=true;
      meter.max=100;meter.value=0;
      if(percent)percent.textContent='0%';
      root.hidden=false;skip.hidden=true;
      doc.body?.classList?.add('stellar-preparing');
      text.textContent='Preparing high-resolution planet textures and lighting…';
      skip.addEventListener('click',close);
      timeout=schedule(()=>{
        if(!active)return;
        skip.hidden=false;
        text.textContent='Still preparing detailed textures. You can continue now or wait for the complete scene.';
      },skipAfterMs);
      if(autoReleaseAfterMs>0)autoTimeout=schedule(close,autoReleaseAfterMs);
    },
    progress(completed,total,failed=0){
      if(!active)return;
      const value=Math.max(0,Math.min(100,Math.round(100*completed/Math.max(1,total))));
      meter.max=100;meter.value=value;
      if(percent)percent.textContent=value+'%';
      text.textContent=failed
        ?`${completed} of ${total} visuals prepared. ${failed} using fallback artwork.`
        :`${completed} of ${total} high-resolution visuals prepared.`;
    },
    close,dispose:close,
  };
}
