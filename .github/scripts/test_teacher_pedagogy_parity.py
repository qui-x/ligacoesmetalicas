"""Paridade Professor → Aluno nos navegadores e tamanhos de tela.
Executar com python -m http.server 8765 na raiz do projeto.
"""
from __future__ import annotations
import argparse
from playwright.sync_api import expect, sync_playwright

def run(browser_name: str, root: str) -> None:
    with sync_playwright() as pw:
        browser = getattr(pw, browser_name).launch(headless=True)
        for width, height in ((390, 844), (768, 1024), (1440, 900)):
            context = browser.new_context(
                viewport={"width": width, "height": height},
                locale="pt-BR", reduced_motion="reduce", service_workers="block"
            )
            page = context.new_page()
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.goto(root.rstrip("/") + "/#/professor", wait_until="domcontentloaded")
            expect(page.locator("#teacher-item")).to_be_visible(timeout=20000)
            page.locator("#teacher-item").select_option("ordem-metal")
            page.locator("#teacher-material-open").click()
            guide = page.locator("#silm-teacher-guide-body")
            expect(guide).to_contain_text("Procedimento investigativo")
            expect(guide).to_contain_text("Hipótese inicial para discussão")
            expect(guide).to_contain_text("Plano de observações")
            expect(guide).to_contain_text("Mediação do professor")
            expect(guide).to_contain_text("Ficha de acompanhamento formativo")
            expect(guide).to_contain_text("Delimitação do problema")
            page.locator("#silm-teacher-guide-close").click()
            page.locator("#teacher-type").select_option("mission")
            page.locator("#teacher-item").select_option("montagem-ordem")
            page.locator("#teacher-material-open").click()
            expect(guide).to_contain_text("Previsão inicial para discussão")
            expect(guide).to_contain_text("Evidências verificáveis da missão")
            expect(guide).to_contain_text("Ficha de acompanhamento formativo")
            expect(guide).to_contain_text("Evidência observável")
            page.locator("#silm-teacher-guide-close").click()
            for typ, item_id, heading in (
                ("route", "ordem-metal", "Plano de investigação"),
                ("mission", "montagem-ordem", "Plano de investigação"),
            ):
                hash_path = page.evaluate("""({typ, item_id}) => {
                    const S = window.SILM, item = typ === 'route'
                        ? S.routes.get(item_id) : S.missions.get(item_id);
                    const c = S.teacherActivities.validate({
                        schema: 1, id: 'act-browser-parity', type: typ,
                        item: item_id, title: item.title,
                        metals: [item.metalSelection.atomicNumbers[0]],
                        tools: item.allowedTools, navigation: 'restrita',
                        identification: {className: 'Teste'}
                    });
                    return '#/atividade?c=' + S.teacherActivities.encode(c);
                }""", {"typ": typ, "item_id": item_id})
                page.goto(root.rstrip("/") + "/" + hash_path, wait_until="domcontentloaded")
                expect(page.locator("#student-activity-title")).to_be_visible(timeout=20000)
                expect(page.locator("#silm-student-activity")).to_contain_text(heading)
                expect(page.locator(".silm-student-investigation summary")).to_be_visible()
                page.locator(".silm-student-investigation summary").click()
                expect(page.locator(".silm-student-investigation")).to_contain_text("O que registrar")
                expect(page.locator("#student-start")).to_be_enabled()
                if width == 390:
                    overflow = page.evaluate(
                        "() => document.documentElement.scrollWidth - innerWidth"
                    )
                    assert overflow <= 2, (browser_name, typ, overflow)
            assert not errors, (browser_name, width, errors)
            print(f"OK: {browser_name} {width}x{height} — professor, roteiro e missão")
            context.close()
        browser.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--browser", choices=["chromium", "firefox", "webkit"], required=True)
    parser.add_argument("--url", default="http://127.0.0.1:8765")
    args = parser.parse_args()
    run(args.browser, args.url)
