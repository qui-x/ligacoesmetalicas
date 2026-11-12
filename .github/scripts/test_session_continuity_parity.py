"""Fluxo Professor → Oficina → Relatório → Caderno → retomada.
Executar com servidor em http://127.0.0.1:8765.
"""
from __future__ import annotations
import argparse
import re
from playwright.sync_api import expect, sync_playwright

def run(browser_name: str, root: str) -> None:
    with sync_playwright() as pw:
        browser = getattr(pw, browser_name).launch(headless=True)
        for width, height in ((390, 844), (768, 1024), (1440, 900)):
            ctx = browser.new_context(
                viewport={"width": width, "height": height},
                locale="pt-BR", reduced_motion="reduce", service_workers="block"
            )
            page = ctx.new_page()
            errors = []
            page.on("pageerror", lambda err: errors.append(str(err)))
            page.goto(root.rstrip("/") + "/#/professor", wait_until="domcontentloaded")
            expect(page.locator("#teacher-item")).to_be_visible(timeout=20000)
            token = page.evaluate("""() => {
                const S = window.SILM, item = S.routes.get('ordem-metal');
                const c = S.teacherActivities.validate({
                    schema: 1, id: 'act-teste-continuar', type: 'route',
                    item: item.id, title: 'Investigação da turma — retomada',
                    metals: [item.metalSelection.atomicNumbers[0]],
                    tools: item.allowedTools, navigation: 'restrita',
                    identification: {teacher: 'Docente', className: 'Turma 1'}
                });
                return S.teacherActivities.encode(c);
            }""")
            address = root.rstrip("/") + "/#/atividade?c=" + token
            page.goto(address, wait_until="domcontentloaded")
            start = page.locator("#student-start")
            expect(start).to_have_text("Começar atividade")
            start.click()
            expect(page).to_have_url(re.compile(r".*#/ambiente.*"), timeout=10000)
            page.goto(root.rstrip("/") + "/#/relatorios", wait_until="domcontentloaded")
            observations = page.locator("#report-observations")
            expect(observations).to_be_visible(timeout=15000)
            note = f"Observação conservada após retomada — {browser_name} {width}"
            observations.fill(note)
            expect(observations).to_have_value(note)
            page.locator("#route-report-notebook").click()
            page.goto(root.rstrip("/") + "/#/caderno", wait_until="domcontentloaded")
            expect(page.locator("body")).to_contain_text(
                "Investigação da turma — retomada", timeout=15000
            )
            ok = page.evaluate("() => window.BaseDemoSI.clearGuidedReturn()")
            assert ok is None or ok is True
            page.goto(address, wait_until="domcontentloaded")
            expect(page.locator("#student-start")).to_have_text("Retomar atividade")
            page.locator("#student-start").click()
            expect(page).to_have_url(re.compile(r".*#/ambiente.*"), timeout=10000)
            page.goto(root.rstrip("/") + "/#/relatorios", wait_until="domcontentloaded")
            expect(page.locator("#report-observations")).to_have_value(note)
            assert not errors, (browser_name, width, errors)
            if width == 390:
                overflow = page.evaluate(
                    "() => document.documentElement.scrollWidth - innerWidth"
                )
                assert overflow <= 2, (browser_name, overflow)
            print(f"OK: {browser_name} {width}x{height}: relatório, Caderno e retomada")
            ctx.close()
        browser.close()

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--browser", choices=("chromium","firefox","webkit"), required=True)
    ap.add_argument("--url", default="http://127.0.0.1:8765")
    args = ap.parse_args()
    run(args.browser, args.url)
