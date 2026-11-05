export const ACHIEVEMENT_KEY = 'ahmed-portfolio-explorer-v1';
/** Storage can throw in private mode / hardened browsers; the portfolio must still work. */
export function readAchievement(storage) {
  try { return storage?.getItem(ACHIEVEMENT_KEY) === 'unlocked'; }
  catch { return false; }
}
export function writeAchievement(storage) {
  try { storage?.setItem(ACHIEVEMENT_KEY, 'unlocked'); return true; }
  catch { return false; }
}
