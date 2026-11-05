import { initSolarSystem } from './solar-system.mjs';
import { initGeneralQuiz } from './quiz-ui.mjs';

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

function initMenu() {
  const toggle = $('#menu-toggle');
  const nav = $('#primary-nav');
  if (!toggle || !nav) return;
  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('nav-open', open);
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (event) => { if (event.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setOpen(false); });
  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
  });
}

function initFilters() {
  const buttons = $$('[data-filter]');
  const cards = $$('.project-card[data-category]');
  const status = $('#filter-status');
  for (const button of buttons) button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    let count = 0;
    for (const card of cards) {
      const visible = filter === 'All' || card.dataset.category === filter;
      card.hidden = !visible;
      if (visible) count++;
    }
    for (const b of buttons) {
      const active = b === button;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', String(active));
    }
    if (status) status.textContent = `Showing ${count} ${filter === 'All' ? '' : filter + ' '}missions.`;
  });
}

const commands = [
  { label: 'Selected work', hint: '01 / PROJECTS', target: '#work', icon: '✦' },
  { label: 'Experience', hint: '02 / FLIGHT RECORD', target: '#experience', icon: '◎' },
  { label: 'Skills & toolkit', hint: '03 / SYSTEMS', target: '#skills', icon: '◈' },
  { label: 'About & education', hint: '04 / PROFILE', target: '#about', icon: '⌁' },
  { label: 'Contact Ahmed', hint: '05 / SAY HELLO', target: '#contact', icon: '↗' },
  { label: 'Web design lab', hint: 'INTERACTIVE / LIVE PREVIEW', target: '#web-lab', icon: '◈' },
  { label: 'Knowledge arcade', hint: 'BONUS / GENERAL QUIZ', target: '#signal', icon: '✧' },
  { label: 'Solar system explorer', hint: 'EXPLORE / PLANETS', target: '#top', icon: '◉' },
];

function initCommandPalette() {
  const dialog = $('#command-dialog');
  const search = $('#command-search');
  const results = $('#command-results');
  if (!dialog || !search || !results) return;
  let lastTrigger = null;
  const close = () => {
    if (dialog.open) {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    }
    lastTrigger?.focus();
  };
  const jump = (target) => {
    close();
    const element = $(target);
    if (element) {
      element.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      history.replaceState(null, '', target);
    }
  };
  const renderResults = () => {
    const term = search.value.trim().toLowerCase();
    const matches = commands.filter(c => `${c.label} ${c.hint}`.toLowerCase().includes(term));
    results.replaceChildren();
    if (!matches.length) {
      const empty = document.createElement('p');
      empty.className = 'command-empty';
      empty.textContent = 'No matching destinations. Try “work” or “contact”.';
      results.append(empty);
      return;
    }
    for (const command of matches) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'command-result';
      const icon = document.createElement('span');
      icon.className = 'command-result__icon'; icon.setAttribute('aria-hidden', 'true'); icon.textContent = command.icon;
      const body = document.createElement('span');
      const name = document.createElement('strong'); name.textContent = command.label;
      const hint = document.createElement('small'); hint.textContent = command.hint;
      body.append(name, hint);
      const arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden','true');
      b.append(icon, body, arrow);
      b.addEventListener('click', () => jump(command.target));
      results.append(b);
    }
  };
  const open = (trigger) => {
    lastTrigger = trigger || document.activeElement;
    search.value = '';
    renderResults();
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    search.focus();
  };
  for (const id of ['command-trigger', 'footer-command']) {
    const trigger = $('#' + id);
    trigger?.addEventListener('click', () => open(trigger));
  }
  $('#command-close')?.addEventListener('click', close);
  dialog.addEventListener('click', (event) => { if (event.target === dialog) close(); });
  dialog.addEventListener('close', () => lastTrigger?.focus());
  search.addEventListener('input', renderResults);
  search.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      results.querySelector('button')?.click();
    }
    if (event.key === 'ArrowDown') { event.preventDefault(); results.querySelector('button')?.focus(); }
  });
  results.addEventListener('keydown', (event) => {
    const items = $$('button', results);
    const index = items.indexOf(document.activeElement);
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      items[(index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length]?.focus();
    }
  });
  document.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (dialog.open) close(); else open(document.activeElement);
    }
    if (event.key === 'Escape' && dialog.open) close();
  });
}

function initDesignLab() {
  const root = $('#design-lab');
  const preview = $('#lab-preview');
  const status = $('#lab-status');
  if (!root || !preview || !status) return;
  const controls = $$('[data-lab-theme], [data-lab-layout]', root);
  for (const button of controls) button.addEventListener('click', () => {
    const setting = button.dataset.labTheme ? 'theme' : 'layout';
    const value = button.dataset.labTheme || button.dataset.labLayout;
    if (!['orbit','nova','grid','stack'].includes(value)) return;
    preview.dataset[setting] = value;
    for (const item of controls) {
      if ((setting === 'theme' && item.dataset.labTheme) || (setting === 'layout' && item.dataset.labLayout)) {
        const selected = item === button;
        item.classList.toggle('is-active', selected);
        item.setAttribute('aria-pressed', String(selected));
      }
    }
    status.textContent = `${preview.dataset.theme === 'nova' ? 'Nova' : 'Orbit'} theme · ${preview.dataset.layout === 'stack' ? 'Stack' : 'Grid'} layout`;
  });
}

function initCopyEmail() {
  const button = $('#copy-email');
  const status = $('#copy-feedback');
  if (!button || !status) return;
  button.addEventListener('click', async () => {
    const emailLink = $('.contact-details a[href^="mailto:"]');
    const email = emailLink?.textContent?.trim();
    if (!email) { status.textContent = 'Email address unavailable. Please use the résumé contact details.'; return; }
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable');
      await navigator.clipboard.writeText(email);
      status.textContent = 'Email copied to clipboard.';
    } catch {
      status.textContent = 'Clipboard unavailable. Select the email address below or use WhatsApp.';
    }
  });
}

/** Feature isolation: broken optional interactions must not hide résumé content. */
for (const [name, setup] of [
  ['menu', initMenu], ['filters', initFilters], ['quick navigation', initCommandPalette],
  ['solar system', initSolarSystem], ['knowledge arcade', initGeneralQuiz], ['web design lab', initDesignLab], ['copy email', initCopyEmail],
]) {
  try { setup(); } catch (error) { console.error(`Could not initialize ${name}:`, error); }
}
