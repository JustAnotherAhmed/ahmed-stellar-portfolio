"""Optional browser smoke checks. All quiz questions are local; no HTTP mocking or billable requests."""
from playwright.sync_api import sync_playwright
from pathlib import Path
import re, base64
ROOT=Path(__file__).parent

def module_data(name,cache=None):
    cache={} if cache is None else cache
    if name in cache:return cache[name]
    code=(ROOT/name).read_text()
    def replacement(match):
        target=match.group(1)
        return f"from '{module_data(target[2:],cache)}'"
    code=re.sub(r"from '(\./[^']+)'",replacement,code)
    uri='data:text/javascript;base64,'+base64.b64encode(code.encode()).decode()
    cache[name]=uri
    return uri

def main():
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        for width,height,label in [(1440,900,'desktop'),(375,812,'mobile')]:
            context=browser.new_context(viewport={'width':width,'height':height},device_scale_factor=1)
            page=context.new_page();errors=[]
            page.on('pageerror',lambda error:errors.append(str(error)))
            page.route('https://cdn.jsdelivr.net/**',lambda route:route.abort())
            html=(ROOT/'index.html').read_text()
            html=re.sub(r'<script src="/app\.mjs" type="module">\s*</script>','',html)
            page.set_content(html);page.add_style_tag(content=(ROOT/'styles.css').read_text())
            page.evaluate('url=>import(url)',module_data('app.mjs'))
            page.wait_for_selector('#planet-picker .planet-chip')
            page.wait_for_function("document.querySelector('#solar-system').classList.contains('solar-fallback')",timeout=15000)
            assert not page.locator('.solar-aura').count()
            page.locator('.planet-chip[data-body="saturn"]').click()
            assert page.locator('body').get_attribute('data-planet')=='saturn'
            assert page.locator('#solar-return').is_visible()
            page.locator('#solar-return').click()
            assert not page.locator('#solar-return').is_visible()
            page.locator('#quiz-topic').select_option('python')
            page.locator('#quiz-difficulty button').filter(has_text='Intermediate').click()
            page.locator('#quiz-generate').click()
            page.wait_for_selector('#quiz-active:not([hidden])')
            assert 'PYTHON' in page.locator('#quiz-progress').inner_text()
            assert page.locator('.quiz-answer').count()==4
            page.locator('.quiz-answer').first.click()
            assert 'SCORE' in page.locator('#quiz-score').inner_text()
            assert page.locator('#quiz-feedback').inner_text()
            page.locator('#quiz-next').click()
            assert 'OF 5' in page.locator('#quiz-progress').inner_text()
            page.locator('#quiz-stop').click()
            assert page.locator('#quiz-choose').is_visible()
            assert page.locator('#web-lab').count()==1
            assert 'wa.me/971521133465' in page.locator('.contact-actions a').first.get_attribute('href')
            assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 2'), 'horizontal overflow'
            assert not errors, f'{label} JS errors: {errors}'
            print(f'{label}: planet focus, 2D fallback, offline quiz, scoring, stop, WhatsApp, layout PASS')
            context.close()
        browser.close()
if __name__=='__main__':main()
