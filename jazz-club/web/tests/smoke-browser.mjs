/**
 * Jazz e Metais -- real Chromium browser smoke check of built Babylon.js viewer.
 * Requires completed Blender GLB and npm dependencies. No main publication.
 * Run inside jazz-club/web: npm run build && npm run qa:browser
 */
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const out = resolve('qa-artifacts');
await mkdir(out, { recursive: true });

const server = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4173', '--strictPort'],
  { cwd: process.cwd(), stdio: ['ignore','pipe','pipe'] });
server.stdout.on('data', chunk => process.stdout.write(chunk));
server.stderr.on('data', chunk => process.stderr.write(chunk));
let browser;
try {
  let available = false;
  for (let i = 0; i < 75; i++) {
    if (server.exitCode !== null) throw new Error('Vite preview terminated unexpectedly');
    try {
      const response = await fetch('http://127.0.0.1:4173/');
      if (response.ok) { available = true; break; }
    } catch {}
    await new Promise(r => setTimeout(r, 450));
  }
  assert(available, 'Vite preview not ready');

  browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl','--use-gl=angle','--use-angle=swiftshader',
      '--enable-unsafe-swiftshader','--no-sandbox']
  });
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  const url = 'http://127.0.0.1:4173/?qa=1';
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(
    () => window.__jazzQa?.snapshot()?.ready === true, undefined, { timeout: 120000 });
  const initial = await page.evaluate(() => window.__jazzQa.snapshot());
  console.log('INITIAL_SCENE', JSON.stringify(initial));
  assert(initial.webGLVersion >= 1, 'WebGL context not available');
  assert(initial.meshCount > 80, 'Model/scenery not loaded');
  for (const name of ['Smile','JawOpen','Blink_L','Blink_R'])
    assert(initial.morphNames.includes(name), 'Morph missing: ' + name);
  for (const name of ['SmileCycle','JawOpenCycle','BlinkCycle'])
    assert(initial.animationClips.includes(name), 'GLB animation group missing: ' + name);

  await page.locator('button[data-camera=portrait]').click();
  await page.locator('button[data-expression=smile]').click();
  await page.waitForFunction(
    () => (window.__jazzQa?.snapshot().morphWeights.Smile ?? 0) > .7,
    undefined, { timeout: 15000 });
  await page.screenshot({ path: resolve(out,'sommerfeld14-smile-desktop.png') });

  await page.locator('button[data-expression=jawopen]').click();
  await page.waitForFunction(
    () => (window.__jazzQa?.snapshot().morphWeights.JawOpen ?? 0) > .75,
    undefined, { timeout: 15000 });
  const jaw = await page.evaluate(() => window.__jazzQa.snapshot());
  assert((jaw.morphWeights.Smile ?? 0) < .08,
    'Smile morph remained active while JawOpen selected');
  await page.screenshot({ path: resolve(out,'sommerfeld14-jawopen-desktop.png') });

  await page.locator('button[data-expression=neutral]').click();
  await page.waitForFunction(
    () => (window.__jazzQa?.snapshot().morphWeights.JawOpen ?? 1) < .05,
    undefined, { timeout: 15000 });

  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 }, reducedMotion: 'reduce',
    deviceScaleFactor: 1, hasTouch: true, isMobile: true
  });
  mobile.on('pageerror', e => errors.push(e.message));
  await mobile.goto(url, { waitUntil: 'domcontentloaded' });
  await mobile.waitForFunction(
    () => window.__jazzQa?.snapshot()?.ready === true, undefined, { timeout: 120000 });
  const mobileStart = await mobile.evaluate(() => window.__jazzQa.snapshot());
  assert.equal(mobileStart.movementEnabled, false,
    'Reduced-motion setting should disable automatic movement');
  await mobile.locator('button[data-expression=smile]').click();
  await mobile.waitForFunction(() => (window.__jazzQa?.snapshot().morphWeights.Smile ?? 0) > .8, undefined, { timeout: 15000 });
  const mobileEnd = await mobile.evaluate(() => window.__jazzQa.snapshot());
  assert((mobileEnd.morphWeights.Smile ?? 0) > .8,
    'User-requested static facial expression should remain available');
  const layout = await mobile.evaluate(() => ({
    innerWidth, width: document.documentElement.scrollWidth,
    fallbackVisible: !document.querySelector('#fallback').hidden
  }));
  assert(layout.width <= layout.innerWidth + 4, 'Horizontal overflow on mobile');
  assert(!layout.fallbackVisible, 'Fallback error visible on mobile');
  await mobile.screenshot({ path: resolve(out,'sommerfeld14-mobile.png') });
  await mobile.close();

  assert.equal(errors.length,0,'Browser JavaScript/console errors: '+errors.join(' | '));
  console.log('BROWSER_SMOKE_PASS', JSON.stringify({
    desktop: { webGLVersion:initial.webGLVersion, meshCount:initial.meshCount,
      animationClips:initial.animationClips.length },
    mobile: layout, errors
  }));
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
