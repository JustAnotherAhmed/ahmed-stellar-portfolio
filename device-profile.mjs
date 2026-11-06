import {cinematicPixelRatio} from './render-quality.mjs';

/** Keep the cinematic desktop look while avoiding mobile WebGL memory crashes.
 * The atlas pixel dimensions do not have to equal the device framebuffer size. */
export function selectDeviceProfile({width=1280,coarse=false,memory=null,saveData=false}={}){
  const mobile=Boolean(coarse)||width<=760;
  const constrained=Boolean(saveData)||(Number.isFinite(memory)&&memory>0&&memory<=2);
  return Object.freeze({
    mobile,constrained,
    // Phones display an excellent 1K globe in orbit; desktop keeps native 4K.
    textureWidth:mobile?1024:4096,
    focusTextureWidth:mobile?2048:4096,
    mapConcurrency:mobile?1:2,
    frameRate:mobile?30:60,
    initialIds:mobile?['earth','sun','saturn','clouds']:null,
    // Very low-memory devices use the accessible 2D explorer.
    force2D:mobile&&Number.isFinite(memory)&&memory>0&&memory<=1,
    pixelBudget:mobile?(constrained?1_450_000:2_500_000):14_000_000,
    pixelRatioCap:mobile?(constrained?1.25:1.75):4
  });
}
export function adaptivePixelRatio(width,height,deviceRatio,maxRenderbuffer,profile){
  const desired=cinematicPixelRatio(width,height,deviceRatio,maxRenderbuffer);
  if(!(width>0&&height>0))return 1;
  const maxDimension=Math.min(maxRenderbuffer/width,maxRenderbuffer/height);
  const affordable=Math.sqrt(profile.pixelBudget/(width*height));
  return Math.max(.5,Math.min(desired,profile.pixelRatioCap,affordable,maxDimension));
}
