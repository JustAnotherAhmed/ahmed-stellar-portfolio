import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=name=>readFileSync(new URL(name,import.meta.url),'utf8');
const exists=name=>existsSync(new URL(name,import.meta.url));
test('all production assets are included at root',()=>{
  for(const file of ['index.html','styles.css','app.mjs','solar-system.mjs','planets.mjs','question-bank.mjs','quiz.mjs','quiz-ui.mjs','Ahmed-Osama-Resume.pdf','favicon.svg','og-image.png','vercel.json','robots.txt']) assert.ok(exists(file),file);
});
test('resume remains available even if JavaScript is disabled',()=>{
  const page=read('index.html');
  for(const section of ['work','experience','skills','about','contact','solar-system','signal','web-lab'])assert.match(page,new RegExp(`id="${section}"`));
  for(const claim of ['75%','15+','30%','R.M. Team FZE','Webology','The British University in Dubai'])assert.ok(page.includes(claim));
  assert.match(page,/wa\.me\/971521133465\?text=/);
  assert.match(page,/mailto:F\.ahmed30@yahoo\.com/);
  assert.match(page,/Ahmed-Osama-Resume\.pdf/);
});
test('all local script and stylesheet paths resolve',()=>{
  const page=read('index.html');
  const resources=[...page.matchAll(/(?:src|href)="\/(.*?)"/g)].map(m=>m[1]);
  for(const resource of resources)assert.ok(exists(resource),resource);
  for(const mod of ['app.mjs','solar-system.mjs','quiz-ui.mjs','quiz.mjs']){
    const source=read(mod);
    for(const path of source.matchAll(/from '(\.\/[^']+)'/g))assert.ok(exists(path[1].slice(2)),`${mod} -> ${path[1]}`);
  }
});
test('error fallbacks, visibility pause, reduced motion and focus styles exist',()=>{
  const solar=read('solar-system.mjs'),css=read('styles.css'),app=read('app.mjs');
  assert.match(solar,/visibilitychange/);assert.match(solar,/prefers-reduced-motion/);assert.match(solar,/webglcontextlost/);
  assert.match(solar,/try \{/);assert.match(solar,/catch\(error\)/);
  assert.match(css,/:focus-visible/);assert.match(css,/prefers-reduced-motion: reduce/);
  assert.match(app,/Could not initialize/);
});
test('Vercel is configured for root static output and pinned Three CDN CSP',()=>{
  const config=JSON.parse(read('vercel.json'));
  assert.equal(config.framework,null);assert.equal(config.outputDirectory,'.');
  assert.ok(!config.buildCommand);
  assert.ok(config.headers[0].headers.some(h=>h.key==='Content-Security-Policy'&&h.value.includes('cdn.jsdelivr.net')));
  assert.match(read('solar-system.mjs'),/three@0\.187\.0\/build\/three\.module\.js/);
});
