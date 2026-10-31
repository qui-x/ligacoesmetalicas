import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright';

const sourceVersion = readFileSync(new URL('../VERSION', import.meta.url), 'utf8').trim();
const viewports = [
  { width: 320, height: 640, name: 'mobile-small' },
  { width: 390, height: 844, name: 'mobile-portrait' },
  { width: 844, height: 390, name: 'mobile-landscape' },
  { width: 1024, height: 768, name: 'tablet-desktop' },
  { width: 1440, height: 1000, name: 'desktop' },
];
const apps = [
  {
    name: 'SIAB',
    url: 'https://qui-x.github.io/acidobase/',
    route: '#/laboratorio',
    ready: '#menu-btn',
    initExpression: () => {
      try {
        localStorage.setItem('siab_abertura', 'off');
        localStorage.setItem('siab_inicializacao', 'inicio');
      } catch {}
    },
  },
  {
    name: 'SILM',
    url: 'https://qui-x.github.io/ligacoesmetalicas/',
    route: '#/ambiente',
    ready: '#nav-toggle',
    initExpression: () => {
      try {
        localStorage.setItem('simcore_core_v1_opening', 'false');
        localStorage.setItem('simcore_core_v1_startup', JSON.stringify('inicio'));
        localStorage.setItem('simcore_domain_silm_v1_tour.welcome-seen', 'true');
      } catch {}
    },
  },
];
const failures = [];
const checks = [];
const report = (message, ok, detail = '') => {
  checks.push({ message, status: ok ? 'PASS' : 'FAIL', detail });
  if (!ok) failures.push(message + (detail ? ': ' + detail : ''));
  console.log((ok ? 'PASS ' : 'FAIL ') + message + (detail ? ' — ' + detail : ''));
};

const browser = await chromium.launch({ headless: true });
try {
  for (const app of apps) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: 'reduce',
      serviceWorkers: 'block',
      locale: 'pt-BR',
    });
    await context.addInitScript(app.initExpression);
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    const pageErrors = [];
    const consoleErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    try {
      const response = await page.goto(app.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      report(app.name + ' página pública responde', !!response && response.ok(),
        response ? String(response.status()) : 'sem resposta HTTP');
      await page.locator(app.ready).waitFor({ state: 'visible', timeout: 45000 });
      if (app.name === 'SIAB') {
        await page.waitForFunction(() => window.SIAB && typeof window.SIAB.rotear === 'function');
        const version = await page.evaluate(() => ({
          runtime: window.SIAB?.version ?? null,
          labels: [...document.querySelectorAll('[data-app-version]')].map(el => el.textContent.trim()),
        }));
        console.log('INFO SIAB versão observada: ' + JSON.stringify(version));

        await page.locator('#menu-btn').click();
        await page.waitForFunction(() => document.querySelector('#app-drawer')?.open === true);
        report('SIAB menu abre e expõe aria-expanded', await page.locator('#menu-btn').getAttribute('aria-expanded') === 'true');
        await page.keyboard.press('Escape');
        await page.waitForFunction(() => {
          const drawer = document.querySelector('#app-drawer');
          return drawer && !drawer.open && document.querySelector('#menu-btn')?.getAttribute('aria-expanded') === 'false';
        });
        report('SIAB Escape fecha o menu e sincroniza aria-expanded', true);
        report('SIAB foco volta ao botão de menu', await page.evaluate(() => document.activeElement?.id === 'menu-btn'));

        await page.evaluate(route => { location.hash = route; }, app.route);
        await page.waitForFunction(() => window.SIAB?.rota?.nome === 'laboratorio');
        report('SIAB navegação chega ao Laboratório', await page.evaluate(() => document.body.dataset.rota === 'laboratorio'));
        await page.locator('#workspace').waitFor({ state: 'visible', timeout: 15000 });
      } else {
        await page.waitForFunction(() => window.SILMIntegration && window.SILM);
        const version = await page.evaluate(() => [...document.querySelectorAll('[data-app-version]')].map(el => el.textContent.trim()));
        console.log('INFO SILM versão publicada: ' + JSON.stringify(version) + '; versão do código-fonte: ' + sourceVersion);
        if (version.length && !version.includes(sourceVersion)) {
          console.warn('WARN DIVERGÊNCIA DE PUBLICAÇÃO: o rótulo da página não corresponde à versão do código no repositório; não será alterada/publicada por este teste.');
        }

        await page.locator('#nav-toggle').click();
        await page.waitForFunction(() => document.querySelector('#sidebar')?.getAttribute('aria-hidden') === 'false');
        report('SILM menu abre e expõe aria-expanded', await page.locator('#nav-toggle').getAttribute('aria-expanded') === 'true');
        await page.keyboard.press('Escape');
        let escapeClosed = false;
        try {
          await page.waitForFunction(() => document.querySelector('#sidebar')?.getAttribute('aria-hidden') === 'true', null, { timeout: 1800 });
          escapeClosed = true;
        } catch {}
        report('SILM Escape fecha o menu', escapeClosed);
        if (!escapeClosed) {
          await page.locator('#si-nav-close').click();
          await page.waitForFunction(() => document.querySelector('#sidebar')?.getAttribute('aria-hidden') === 'true');
        }
        report('SILM foco volta ao acionador do menu',
          await page.evaluate(() => document.activeElement?.id === 'nav-toggle'));

        await page.evaluate(route => { location.hash = route; }, app.route);
        await page.waitForFunction(() => window.SILMIntegration && location.hash === '#/ambiente');
        report('SILM navegação chega à Oficina dos Metais', await page.evaluate(() => location.hash === '#/ambiente'));
      }

      for (const viewport of viewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(180);
        const metrics = await page.evaluate(() => ({
          width: innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          height: innerHeight,
        }));
        report(app.name + ' sem rolagem horizontal em ' + viewport.width + '×' + viewport.height,
          metrics.scrollWidth <= metrics.width + 1,
          JSON.stringify(metrics));
      }
      report(app.name + ' sem exceções JavaScript fatais', pageErrors.length === 0, JSON.stringify(pageErrors));
      if (consoleErrors.length) console.log('WARN ' + app.name + ' erros de console (não equivalem necessariamente a exceção fatal): ' + JSON.stringify(consoleErrors.slice(0, 12)));
    } catch (error) {
      report(app.name + ' smoke test completou', false, String(error?.stack || error).slice(0, 1300));
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

console.log('\nResumo: ' + checks.filter(x => x.status === 'PASS').length + ' PASS; ' +
  checks.filter(x => x.status === 'FAIL').length + ' FAIL.');
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}
