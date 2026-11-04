import { createRequire } from "node:module";

const browserName = process.env.BROWSER_NAME || "chromium";
const baseUrl = process.env.BASE_URL || "http://127.0.0.1:8765";
const modulePath = process.env.PLAYWRIGHT_MODULE;

if (!modulePath) throw new Error("PLAYWRIGHT_MODULE não definido.");
if (!["chromium", "firefox"].includes(browserName)) {
  throw new Error("BROWSER_NAME deve ser chromium ou firefox.");
}

const require = createRequire(new URL("../package.json", import.meta.url));
const playwright = require(modulePath);
const browserType = playwright[browserName];
if (!browserType) throw new Error("Browser Playwright indisponível: " + browserName);

const browser = await browserType.launch({ headless: true });
let failures = 0;

try {
  for (const path of [
    "/tests/multiphysics-indexeddb-browser.html",
    "/tests/multiphysics-indexeddb-a23-browser.html"
  ]) {
    const page = await browser.newPage();
    const pageErrors = [];
    page.on("pageerror", error => pageErrors.push(error.message));
    const url = baseUrl + path;

    try {
      const response = await page.goto(url, { waitUntil: "load", timeout: 30000 });
      if (!response?.ok()) throw new Error("HTTP " + (response?.status() ?? "sem resposta"));
      await page.waitForFunction(
        () => ["passed", "failed"].includes(document.body.dataset.testResult),
        { timeout: 90000 }
      );

      const outcome = await page.evaluate(() => ({
        status: document.body.dataset.testResult,
        summary: document.querySelector("#summary")?.textContent || "",
        tests: [...document.querySelectorAll("#results li")].map(item => item.textContent)
      }));

      console.log("\\n[" + browserName + "] " + path);
      console.log(outcome.summary);
      for (const line of outcome.tests) console.log(" - " + line);

      if (outcome.status !== "passed" || pageErrors.length) {
        failures++;
        for (const error of pageErrors) console.error("pageerror: " + error);
      }
    } catch (error) {
      failures++;
      console.error("[" + browserName + "] " + path + ": " + (error?.stack || error));
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
}

if (failures) {
  console.error("\\n" + failures + " página(s) de teste falharam em " + browserName + ".");
  process.exitCode = 1;
} else {
  console.log("\\nSuítes A2.2 e A2.3 aprovadas em " + browserName + ".");
}
