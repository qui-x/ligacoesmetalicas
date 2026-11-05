// Fluxo E2E da Oficina: descoberta por elemento, troca protegida e compatibilidade do início direto.
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const browserName = process.env.BROWSER_NAME || "chromium";
const baseUrl = process.env.BASE_URL || "http://127.0.0.1:8765";
const modulePath = process.env.PLAYWRIGHT_MODULE;
if (!modulePath) throw new Error("PLAYWRIGHT_MODULE não definido.");
if (!["chromium", "firefox"].includes(browserName)) throw new Error("BROWSER_NAME deve ser chromium ou firefox.");

const require = createRequire(import.meta.url);
const playwright = require(modulePath);
const browser = await playwright[browserName].launch({ headless: true });
const errors = [];
const url = baseUrl + "/index.html#/ambiente";

async function openPeriodicTable(page) {
  await page.locator("#silm-workshop-context").getByRole("button", { name: "Tabela Periódica" }).click();
  await page.locator("#silm-periodic-dialog").waitFor({ state: "visible" });
}

async function chooseElementAndAction(page, atomicNumber, action) {
  await page.locator("#silm-periodic-dialog [data-z='" + atomicNumber + "']").click();
  await page.locator("#silm-periodic-dialog [id$='-" + action + "']").click();
  await page.locator("#silm-periodic-dialog").waitFor({ state: "hidden" });
}

try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(error.message));
  const response = await page.goto(url, { waitUntil: "load", timeout: 45000 });
  assert.ok(response?.ok(), "SILM não respondeu com HTTP 200.");
  await page.waitForFunction(() => {
    const host = document.querySelector("#silm-workshop-context");
    return !!window.SILMIntegration && !!host && !host.hidden;
  }, undefined, { timeout: 45000 });

  await openPeriodicTable(page);
  await chooseElementAndAction(page, 29, "explore");
  await page.getByRole("heading", { name: /Onde encontramos Cobre/ }).waitFor();
  await page.locator(".silm-workshop-card").filter({ hasText: "Motor elétrico" }).getByRole("button", { name: "Investigar componente" }).click();

  await page.waitForFunction(() => {
    const state = window.SILMIntegration?.snapshot?.();
    return state?.metal?.atomicNumber === 29 && !!state?.investigation;
  }, undefined, { timeout: 30000 });
  assert.equal(await page.locator(".silm-workshop-scale").nth(0).getAttribute("aria-pressed"), "true", "A investigação não começou na escala do objeto.");
  const initial = await page.evaluate(() => window.SILMIntegration.snapshot());
  assert.notEqual(initial.structure?.mode, "crystalline", "A rede foi construída antes da escala 3.");
  assert.equal(await page.locator("#silm-integration-scene").isVisible(), false, "A cena cristalina apareceu antes do zoom.");

  await page.locator(".silm-workshop-scale").nth(1).click();
  assert.equal(await page.locator(".silm-workshop-scale").nth(1).getAttribute("aria-pressed"), "true", "A escala 2 não foi ativada.");
  assert.equal(await page.locator("#silm-integration-scene").isVisible(), false, "A cena cristalina apareceu na escala microestrutural.");
  const micro=page.locator(".silm-workshop-micro-viewer");
  assert.equal(await micro.isVisible(), true, "A escala 2 não exibiu o campo microestrutural ampliado.");
  const grains=micro.locator(".silm-micro-grain");
  assert.ok(await grains.count()>=45, "A exibição ampliada não possui grãos suficientes para observação.");
  const area=await micro.locator(".silm-workshop-micro-viewport").boundingBox();
  assert.ok(area.width>650&&area.height>=320, "A microestrutura permanece pequena no desktop.");
  await grains.nth(25).click();
  assert.equal(await micro.locator(".silm-workshop-micro-map").getAttribute("data-selected-grain"),"26","O destaque de grão não funcionou.");
  const stateBeforeZoom=await page.evaluate(()=>window.SILMIntegration.snapshot());
  await micro.getByRole("button",{name:"Ampliar microestrutura"}).click();
  assert.equal(await micro.locator(".silm-workshop-micro-map").getAttribute("data-zoom"),"1.25","O zoom não ampliou a imagem.");
  await micro.getByRole("button",{name:"Ajustar microestrutura ao quadro"}).click();
  assert.equal(await micro.locator(".silm-workshop-micro-map").getAttribute("data-zoom"),"1","O ajuste ao quadro falhou.");
  assert.deepEqual(await page.evaluate(()=>window.SILMIntegration.snapshot()),stateBeforeZoom,"Operações visuais alteraram o estado científico.");


  await page.locator(".silm-workshop-scale").nth(2).click();
  await page.waitForFunction(() => {
    const state = window.SILMIntegration.snapshot();
    return state.structure?.mode === "crystalline" && state.structure.units.length > 0 &&
      state.structure.crystallography.representation.neighbors === false;
  }, undefined, { timeout: 30000 });
  assert.equal(await page.locator("#silm-integration-scene").isVisible(), true, "A cena cristalina não apareceu na escala 3.");

  await page.locator(".silm-workshop-scale").nth(3).click();
  await page.waitForFunction(() => {
    const representation = window.SILMIntegration.snapshot().structure?.crystallography?.representation;
    return representation?.neighbors === true && !!representation.selectedUnitId;
  }, undefined, { timeout: 15000 });
  const centerBeforeSwitch = await page.evaluate(() => window.SILMIntegration.snapshot().structure.crystallography.representation.selectedUnitId);

  await openPeriodicTable(page);
  await chooseElementAndAction(page, 26, "explore");
  await page.locator(".silm-workshop-pending-notice").waitFor({ state: "visible" });
  let state = await page.evaluate(() => window.SILMIntegration.snapshot());
  assert.equal(state.metal.atomicNumber, 29, "A seleção pendente substituiu a investigação ativa antes da confirmação.");

  await page.locator(".silm-workshop-card").filter({ hasText: "Parafuso de aço" }).getByRole("button", { name: "Investigar componente" }).click();
  await page.locator("#si-modal-cancel").waitFor({ state: "visible" });
  await page.locator("#si-modal-cancel").click();
  await page.getByText("Motor elétrico", { exact: false }).first().waitFor({ state: "visible" });
  state = await page.evaluate(() => window.SILMIntegration.snapshot());
  assert.equal(state.metal.atomicNumber, 29, "Cancelar a troca alterou o metal da investigação.");
  assert.equal(state.structure.crystallography.representation.neighbors, true, "Cancelar a troca perdeu o ambiente atômico.");
  assert.equal(state.structure.crystallography.representation.selectedUnitId, centerBeforeSwitch, "Cancelar a troca perdeu o centro de observação.");
  await context.close();

  const legacyContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const legacyPage = await legacyContext.newPage();
  legacyPage.on("pageerror", error => errors.push(error.message));
  const legacyResponse = await legacyPage.goto(url, { waitUntil: "load", timeout: 45000 });
  assert.ok(legacyResponse?.ok(), "A rota legada da Oficina não abriu.");
  await legacyPage.waitForFunction(() => !!window.SILMIntegration && !document.querySelector("#silm-workshop-context")?.hidden, undefined, { timeout: 45000 });
  await openPeriodicTable(legacyPage);
  await chooseElementAndAction(legacyPage, 26, "investigate");
  await legacyPage.waitForFunction(() => window.SILMIntegration.snapshot().metal?.atomicNumber === 26, undefined, { timeout: 15000 });
  await legacyContext.close();

  const mobileContext=await browser.newContext({viewport:{width:390,height:844}});
  const mobilePage=await mobileContext.newPage();
  mobilePage.on("pageerror",error=>errors.push(error.message));
  await mobilePage.goto(url,{waitUntil:"load",timeout:45000});
  await mobilePage.waitForFunction(()=>!!window.SILMIntegration&&!document.querySelector("#silm-workshop-context")?.hidden,undefined,{timeout:45000});
  await openPeriodicTable(mobilePage);
  await chooseElementAndAction(mobilePage,26,"explore");
  await mobilePage.locator(".silm-workshop-card").filter({hasText:"Parafuso de aço"}).getByRole("button",{name:"Investigar componente"}).click();
  await mobilePage.locator(".silm-workshop-scale").nth(1).click();
  const mobileFrame=await mobilePage.locator(".silm-workshop-micro-viewport").boundingBox();
  assert.ok(mobileFrame.width>=260&&mobileFrame.width<=390&&mobileFrame.height>=290,"A microestrutura não se ajustou ao celular.");
  assert.equal(await mobilePage.locator("#silm-integration-scene").isVisible(),false,"A escala 2 ativou a rede no celular.");
  await mobileContext.close();

  assert.deepEqual(errors, [], "O navegador registrou erros JavaScript: " + errors.join(" | "));
  console.log("APROVADO — " + browserName + ": descoberta, investigação, escala 4, cancelamento protegido e início direto legado.");
} finally {
  await browser.close();
}
