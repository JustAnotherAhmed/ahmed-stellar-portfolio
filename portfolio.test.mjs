import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=name=>readFileSync(new URL(name,import.meta.url),'utf8');
const exists=name=>existsSync(new URL(name,import.meta.url));
test('complete portfolio and offline quiz assets are shipped',()=>{
  for(const path of ['index.html','styles.css','app.mjs','solar-system.mjs','planet-textures.mjs',
    'camera-focus.mjs','planets.mjs','quiz.mjs','quiz-bank.mjs','quiz-ui.mjs',
    'Ahmed-Osama-Resume.pdf','favicon.svg','og-image.png','vercel.json','robots.txt']) assert.ok(exists(path),path);
});
test('public résumé sections, WhatsApp and downloadable PDF remain',()=>{
  const html=read('index.html');
  for(const section of ['work','experience','skills','about','contact','solar-system','signal','web-lab'])assert.match(html,new RegExp(`id="${section}"`));
  for(const claim of ['75%','15+','30%','R.M. Team FZE','Webology','The British University in Dubai'])assert.ok(html.includes(claim));
  assert.match(html,/wa\.me\/971521133465\?text=/);
  assert.match(html,/mailto:F\.ahmed30@yahoo\.com/);
  assert.match(html,/Ahmed-Osama-Resume\.pdf/);
});
test('planet focus and return controls exist and giant Saturn ring artifact is removed',()=>{
  const html=read('index.html'),solar=read('solar-system.mjs'),textures=read('planet-textures.mjs');
  assert.match(html,/id="solar-return"/);assert.match(html,/id="solar-closeup"/);
  assert.doesNotMatch(html,/class="solar-aura"/);
  assert.match(solar,/startCameraTransition/);assert.match(solar,/focusZoomFor/);
  assert.match(textures,/new THREE\.RingGeometry\(config\.inner,config\.outer,128\)/);
});
test('quiz has an explicit curated topic selector and no paid API generation',()=>{
  const html=read('index.html');
  for(const name of ['quiz-form','quiz-topic','quiz-generate','quiz-error','quiz-retry','quiz-difficulty','quiz-final-score'])assert.match(html,new RegExp(`id="${name}"`));
  assert.match(html,/<select class="quiz-topic-input" id="quiz-topic"/);
  assert.match(html,/Start free quiz/);
  assert.match(html,/no AI provider or API key required/);
  assert.doesNotMatch(html,/Generate AI quiz|Generating five questions|server-side AI model/);
  for(const file of ['quiz-ui.mjs','quiz.mjs','quiz-bank.mjs']){
    assert.doesNotMatch(read(file),/fetch\s*\(|OPENAI_API_KEY|\/api\/generate-quiz/);
  }
  assert.equal(exists('api/generate-quiz.mjs'),false);
});
test('all local links and module imports exist',()=>{
  const html=read('index.html');
  const localLinks=[...html.matchAll(/(?:src|href)="\/(.*?)"/g)].map(m=>m[1]);
  for(const item of localLinks)assert.ok(exists(item),item);
  for(const file of ['app.mjs','solar-system.mjs','quiz-ui.mjs','quiz.mjs']){
    for(const m of read(file).matchAll(/from '(\.\.?\/[^']+)'/g)){
      const u=new URL(m[1],new URL(file,import.meta.url));
      assert.ok(exists(u.pathname.slice(new URL('.',import.meta.url).pathname.length)),`${file}: ${m[1]}`);
    }
  }
});
test('reduced motion, graphics fallback, tab pause and focus remain available',()=>{
  const solar=read('solar-system.mjs'),css=read('styles.css');
  assert.match(solar,/visibilitychange/);assert.match(solar,/prefers-reduced-motion/);
  assert.match(solar,/webglcontextlost/);assert.match(solar,/solar-fallback/);
  assert.match(css,/:focus-visible/);assert.match(css,/prefers-reduced-motion:reduce/);
});
test('Vercel deploys static root without any backend or build command',()=>{
  const cfg=JSON.parse(read('vercel.json'));
  assert.equal(cfg.framework,null);assert.equal(cfg.outputDirectory,'.');
  assert.ok(!cfg.buildCommand);assert.ok(!cfg.functions);
  assert.match(read('solar-system.mjs'),/three@0\.187\.0/);
});

test('short Vercel domain is canonical and optional original music is accessible',()=>{
  const html=read('index.html');
  assert.match(html,/<link rel="canonical" href="https:\/\/ahmedosama-dev\.vercel\.app\/"\/>/);
  assert.match(html,/property="og:url"/);
  for(const id of ['ambient-toggle','ambient-volume','ambient-status'])assert.match(html,new RegExp(`id="${id}"`));
  assert.match(html,/aria-pressed="false"/);
  assert.match(html,/value="34"/);
  assert.doesNotMatch(html,/<audio[^>]+autoplay/);
  assert.ok(exists('ambient-audio.mjs'));
  assert.match(read('app.mjs'),/initAmbientAudio/);
});

test('career targeting and universal and planetary sounds are integrated',()=>{
  const html=read('index.html'),audio=read('ambient-audio.mjs'),solar=read('solar-system.mjs');
  for(const role of ['AI Engineering','Automation','Web Development','IT Support','Related Technical Opportunities'])assert.ok(html.includes(role),role);
  assert.match(html,/aria-pressed="true" data-playing="false" data-enabled="true"/);
  assert.match(audio,/readSoundPreference/);
  assert.match(audio,/visibilitychange/);
  assert.match(audio,/playEffect/);
  assert.match(solar,/button\.dataset\.planetSound=body\.id/);
  assert.match(solar,/pick\.dataset\.planetSound=body\.id/);
});
