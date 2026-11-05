"""Optional browser smoke checks. Requires Python playwright and a Chromium browser."""
import mimetypes
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage'])
    for name,viewport in [('desktop',{'width':1440,'height':950}),('mobile',{'width':375,'height':812})]:
        context=browser.new_context(viewport=viewport,device_scale_factor=1)
        # Offline Three import should degrade to a fully functional 2D explorer.
        def fulfill_local(route):
            from urllib.parse import urlparse,unquote
            path=unquote(urlparse(route.request.url).path).lstrip('/') or 'index.html'
            file=(ROOT/path).resolve()
            if not file.is_file() or ROOT not in file.parents:
                route.fulfill(status=404,body='Not found'); return
            mime=mimetypes.guess_type(str(file))[0] or 'application/octet-stream'
            if file.suffix=='.mjs':mime='text/javascript'
            route.fulfill(status=200,content_type=mime,body=file.read_bytes())
        context.route('https://portfolio.test/**',fulfill_local)
        context.route('https://cdn.jsdelivr.net/**',lambda route: route.abort())
        page=context.new_page()
        page_errors=[]
        page.on('console',lambda msg:print('BROWSER CONSOLE',msg.type,msg.text[:400]))
        page.on('pageerror',lambda e:page_errors.append(str(e)))
        import re
        html=(ROOT/'index.html').read_text()
        html=re.sub(r'<script[^>]+src="/app.mjs"[^>]*>\s*</script>','',html)
        page.set_content(html,wait_until='load')
        page.add_style_tag(content=(ROOT/'styles.css').read_text())
        modules=[]
        for file in ['planets.mjs','question-bank.mjs','quiz.mjs','quiz-ui.mjs','solar-system.mjs','app.mjs']:
            code=(ROOT/file).read_text()
            code=re.sub(r'^import[^\n]*\n','',code,flags=re.M)
            code=code.replace('export const ','const ').replace('export function ','function ')
            modules.append(code)
        page.evaluate('() => {\n'+'\n'.join(modules)+'\nwindow.__smoke_loaded=true;\n}')
        print('loaded',page.evaluate('window.__smoke_loaded'),'errors',page_errors, 'text', page.locator('#solar-status').text_content(), 'buttons',page.locator('#planet-picker button').count(), 'html',page.locator('#planet-picker').evaluate('(e)=>e.outerHTML')[:1000])
        page.locator('#planet-picker button').first.wait_for(timeout=10000)
        assert page.locator('#planet-picker button').count()==10
        page.locator('#planet-picker button[data-body="mars"]').click()
        assert page.locator('body').get_attribute('data-planet')=='mars'
        assert page.locator('#planet-name').inner_text()=='Mars'
        page.locator('#planet-picker button[data-body="moon"]').click()
        assert page.locator('#planet-name').inner_text()=='The Moon'
        assert page.locator('#planet-fact').inner_text()
        page.locator('#planet-picker button[data-body="earth"]').click()
        page.evaluate('window.scrollTo({top:0,behavior:"instant"})')
        page.wait_for_timeout(200)
        page.screenshot(path=f'/mnt/data/stellar-v3-preview-{name}.png',full_page=False,animations='disabled')
        page.locator('#quiz-difficulty button').filter(has_text='Medium').click()
        assert 'MEDIUM' in page.locator('#quiz-progress').inner_text()
        page.locator('#quiz-options button').first.click()
        assert page.locator('#quiz-feedback').inner_text()
        assert page.locator('#quiz-next').is_visible()
        page.locator('#quiz-next').click()
        assert '2 OF 10' in page.locator('#quiz-progress').inner_text()
        page.locator('#quiz-stop').click()
        assert page.locator('#quiz-choose').is_visible()
        page.locator('[data-lab-theme="nova"]').click()
        assert page.locator('#lab-preview').get_attribute('data-theme')=='nova'
        assert 'wa.me/971521133465' in page.locator('.contact-actions a.btn-primary').get_attribute('href')
        width=page.evaluate('document.documentElement.scrollWidth');view=viewport['width']
        assert width <= view + 1, f'{name} overflow {width} vs {view}'
        assert not page_errors, f'{name} JS errors {page_errors}'
        print(f'{name}: OK; 10 bodies, themes, quiz, web lab, WhatsApp; no overflow; no page errors')
        context.close()
    browser.close()
