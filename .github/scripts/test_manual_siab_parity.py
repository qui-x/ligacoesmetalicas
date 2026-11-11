"""Teste de organização do Manual do SILM conforme o padrão estrutural do SIAB.

Executa sobre a aplicação real servida localmente, com um navegador Playwright.
"""
from __future__ import annotations

import argparse
from playwright.sync_api import sync_playwright, expect

GROUPS = ["Investigue", "Prepare e registre", "Orientação", "Para ensinar"]
VIEWPORTS = [(360, 720), (390, 844), (768, 1024), (1024, 768), (1440, 900)]


def run(browser_name: str, base_url: str) -> None:
    with sync_playwright() as playwright:
        browser = getattr(playwright, browser_name).launch(headless=True)
        for width, height in VIEWPORTS:
            context = browser.new_context(
                viewport={"width": width, "height": height},
                reduced_motion="reduce",
                service_workers="block",
                locale="pt-BR",
            )
            page = context.new_page()
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.goto(base_url.rstrip("/") + "/#/manual", wait_until="domcontentloaded")
            cards = page.locator(".silm-manual-card")
            expect(cards).to_have_count(13, timeout=20000)
            groups = page.locator(".silm-manual-group > h2").all_text_contents()
            assert groups == GROUPS, f"{browser_name} {width}: grupos {groups!r}"
            expect(page.locator(".silm-manual-home-link")).to_be_visible()
            expect(page.locator("#manual-search")).to_be_visible()
            expect(page.locator("#manual-print")).to_be_visible()
            expect(page.locator(".silm-manual-hero-parity")).to_be_visible()

            overflow = page.evaluate(
                "() => document.documentElement.scrollWidth - window.innerWidth"
            )
            assert overflow <= 2, (
                f"{browser_name} {width}: rolagem horizontal de {overflow}px"
            )

            cards.filter(has_text="Oficina dos Metais").click(force=True)
            expect(page.locator(".silm-manual-category-page h1")).to_have_text(
                "Oficina dos Metais"
            )
            topic = page.locator(".silm-manual-topic-link").first
            topic.click(force=True)
            expect(page.locator(".silm-manual-article")).to_be_visible()
            expect(page.locator(".silm-manual-breadcrumb")).to_be_visible()
            expect(page.locator(".silm-manual-purpose")).to_be_visible()
            expect(page.locator(".silm-manual-related")).to_be_visible()

            index = page.locator("#manual-indice")
            toggle = page.locator("#manual-index-toggle")
            if width <= 800:
                assert not index.is_visible(), (
                    f"{browser_name} {width}: índice mobile começou aberto"
                )
                expect(toggle).to_be_visible()
                toggle.click(force=True)
                expect(index).to_be_visible()
                assert toggle.get_attribute("aria-expanded") == "true"
                page.keyboard.press("Escape")
                assert not index.is_visible()
                assert toggle.get_attribute("aria-expanded") == "false"
            else:
                expect(index).to_be_visible()
                assert not toggle.is_visible()

            page.goto(base_url.rstrip("/") + "/#/manual", wait_until="domcontentloaded")
            expect(page.locator(".silm-manual-card")).to_have_count(13)
            page.locator("#manual-search").fill("eletrons")
            expect(page.locator(".silm-manual-results")).to_be_visible()
            expect(page.locator(".silm-manual-results")).to_contain_text(
                "Elétrons deslocalizados"
            )
            page.locator("#manual-clear").click(force=True)
            expect(page.locator(".silm-manual-card")).to_have_count(13)

            page.evaluate("window.print = () => {}")
            page.locator("#manual-print").click(force=True)
            expect(page.locator(".silm-manual-print-category")).to_have_count(13)
            page.evaluate("window.dispatchEvent(new Event('afterprint'))")
            assert not page.locator(".silm-manual-print-sheet").count()

            page.goto(
                base_url.rstrip("/") + "/#/manual?topico=instrumentos",
                wait_until="domcontentloaded",
            )
            expect(page.locator(".silm-manual-article h1")).to_have_text(
                "Escolher um instrumento"
            )
            assert not errors, f"{browser_name} {width}: erros JS: {errors!r}"
            print(f"OK {browser_name} {width}x{height}: Manual SIAB/SILM")
            context.close()
        browser.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--browser", choices=("chromium", "firefox", "webkit"), required=True)
    parser.add_argument("--url", default="http://127.0.0.1:8765")
    args = parser.parse_args()
    run(args.browser, args.url)
