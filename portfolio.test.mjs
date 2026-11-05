import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { SIGNALS, initialGame, updateGame } from './game.mjs';
import { ACHIEVEMENT_KEY, readAchievement, writeAchievement } from './storage.mjs';
const root = dirname(fileURLToPath(import.meta.url));
const read = (name) => readFileSync(join(root,name),'utf8');

// Self-contained deliverables and paths.
test('all critical deploy assets exist at GitHub repo root', () => {
  for (const f of ['index.html','styles.css','app.mjs','game.mjs','storage.mjs','favicon.svg','og-image.png','Ahmed-Osama-Resume.pdf','robots.txt','vercel.json']) {
    assert.ok(existsSync(join(root,f)), `Missing ${f}`);
  }
});
test('the static page is readable without JavaScript', () => {
  const page = read('index.html');
  for (const section of ['work','experience','skills','about','contact']) {
    assert.match(page, new RegExp(`id=["']${section}["']`), `Missing ${section} section`);
  }
  for (const item of ['75%', '15+', '30%', 'R.M. Team FZE','Webology','The British University in Dubai', 'Namshi.com', 'Sandoq Al Watan']) {
    assert.ok(page.includes(item), `Missing ${item}`);
  }
  assert.match(page, /mailto:F\.ahmed30@yahoo\.com/);
  assert.match(page, /Ahmed-Osama-Resume\.pdf/);
});
test('all local files linked by HTML exist', () => {
  const page = read('index.html');
  const uris = [...page.matchAll(/(?:src|href)=["'](\/[a-zA-Z0-9_.\/-]+)["']/g)].map(m=>m[1]);
  assert.ok(uris.length >= 4, `Found suspiciously few local assets ${JSON.stringify(uris)}`);
  for (const uri of uris) assert.ok(existsSync(join(root,decodeURIComponent(uri).slice(1))), `Broken local link: ${uri}`);
});
test('module paths in app.mjs are relative and exist', () => {
  const app = read('app.mjs');
  assert.match(app, /from '\.\/game\.mjs'/);
  assert.match(app, /from '\.\/storage\.mjs'/);
  assert.doesNotMatch(app,/interaction\//);
  assert.doesNotMatch(app,/fetch\(['"`]/); // No fragile runtime data loads
});
test('Vercel configuration deploys root with no build step', () => {
  const config = JSON.parse(read('vercel.json'));
  assert.equal(config.outputDirectory,'.');
  assert.equal(config.framework,null);
  assert.ok(!config.buildCommand, 'No build command is necessary');
});
test('complete game sequence wins after three signals', () => {
  let state = updateGame(initialGame(), {type: 'START'});
  for (let i=0; i<SIGNALS.length; i++) {
    assert.equal(state.round,i);
    state = updateGame(state,{type:'ANSWER',answer:SIGNALS[i].correct});
    assert.equal(state.answered,true);
    if(i<SIGNALS.length-1) state=updateGame(state,{type:'NEXT'});
  }
  assert.equal(state.phase,'complete');
});
test('wrong answer allows retry; early NEXT cannot skip', () => {
  let s=updateGame(initialGame(),{type:'START'});
  s=updateGame(s,{type:'NEXT'});
  assert.equal(s.round,0);
  s=updateGame(s,{type:'ANSWER',answer:'definitely wrong'});
  assert.match(s.feedback,/Try another/);
  assert.equal(s.answered,false);
});
test('EXIT and RESTART reset the game immediately', () => {
  let s=updateGame(initialGame(),{type:'START'});
  assert.deepEqual(updateGame(s,{type:'EXIT'}),initialGame());
  s=updateGame(s,{type:'RESTART'});
  assert.equal(s.round,0);
});
test('achievement persistence works and uses a stable key', () => {
  const store = new Map();
  const storage={getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)};
  assert.equal(readAchievement(storage),false);
  assert.equal(writeAchievement(storage),true);
  assert.equal(readAchievement(storage),true);
  assert.equal(store.get(ACHIEVEMENT_KEY),'unlocked');
});
test('blocked storage degrades without breaking the portfolio',()=>{
  const deny={getItem(){throw Error('Permission denied')},setItem(){throw Error('Permission denied')}};
  assert.equal(readAchievement(deny),false);
  assert.equal(writeAchievement(deny),false);
  assert.equal(readAchievement(null),false);
});
test('reduced motion and visible focus are styled',()=>{
  const css=read('styles.css');
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /:focus-visible/);
});
