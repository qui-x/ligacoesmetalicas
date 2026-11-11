"""Teste de organização do Manual do SILM conforme o padrão estrutural do SIAB.

Executa sobre a aplicação real servida localmente, com um navegador Playwright.
"""
from __future__ import annotations

import argparse
from pathlib import Path
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
            expect(page.locator(".silm-manual-lattice")).to_be_visible()
            expect(page.locator(".silm-manual-lattice circle")).to_have_count(9)
            expect(page.locator(".silm-manual-card > .silm-manual-symbol > .silm-manual-svg")).to_have_count(13)
            assert not page.locator(".silm-manual-card.button").count(), "Cartões herdaram estilo de botão"
            if width == 1440:
                Path("artifacts").mkdir(exist_ok=True)
                page.screenshot(path=f"artifacts/manual-home-{browser_name}.png", full_page=True)

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
            expect(page.locator('.silm-manual-category-page[data-manual-category="bancada"]')).to_be_visible()
            expect(page.locator(".silm-manual-category-page .silm-manual-purpose p")).to_be_visible()
            expect(page.locator(".silm-manual-category-page .silm-manual-explanation")).to_be_visible()
            expect(page.locator(".silm-manual-category-page .silm-manual-explanation")).to_contain_text("A Oficina dos Metais é o espaço principal")
            assert len(page.locator(".silm-manual-category-page .silm-manual-explanation").inner_text().strip()) >= 400
            expect(page.locator(".silm-manual-category-page .silm-manual-article-head")).to_be_visible()
            expect(page.locator(".silm-manual-category-page .silm-manual-steps li")).to_have_count(4)
            if width == 1440:
                Path("artifacts").mkdir(exist_ok=True)
                page.screenshot(path=f"artifacts/manual-categoria-oficina-{browser_name}.png", full_page=True)
            topic = page.locator(".silm-manual-topic-link").first
            topic.click(force=True)
            expect(page.locator(".silm-manual-article")).to_be_visible()
            expect(page.locator(".silm-manual-breadcrumb")).to_be_visible()
            expect(page.locator(".silm-manual-purpose")).to_be_visible()
            expect(page.locator(".silm-manual-related")).to_be_visible()
            expect(page.locator(".silm-manual-article-head")).to_be_visible()
            expect(page.locator(".silm-manual-steps li")).not_to_have_count(0)
            # O SIAB apresenta números 01, 02, ... e separadores.
            assert "counter(" in page.locator(".silm-manual-steps li").first.evaluate(
                """el => getComputedStyle(el, '::before').content"""
            ), "Numeração decimal 01/02 ausente"
            assert not page.locator("#manual-indice a.button").count(), "Links do índice são botões"
            expect(page.locator("#manual-indice > ul > li")).to_have_count(13)
            first_category = page.locator("#manual-indice > ul > li").first
            expect(first_category).to_contain_text("Comece por aqui")
            expect(first_category.locator("svg[data-icon='home']")).to_have_count(1)
            expect(page.locator("#manual-indice a[aria-current='page']")).to_have_count(1)
            if width == 1440:
                page.screenshot(path=f"artifacts/manual-article-{browser_name}.png", full_page=True)

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
                assert index.evaluate("""el => Math.abs(el.getBoundingClientRect().width - (window.innerWidth<=1100 ? 190:218))""") <= 3

            page.goto(base_url.rstrip("/") + "/#/manual", wait_until="domcontentloaded")
            expect(page.locator(".silm-manual-card")).to_have_count(13)
            page.locator("#manual-search").fill("eletrons")
            expect(page.locator(".silm-manual-results")).to_be_visible()
            expect(page.locator(".silm-manual-search-list > li")).not_to_have_count(0)
            assert not page.locator(".silm-manual-results .silm-manual-topic-link").count()
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
            if width == 1440:
                # Auditoria de conteúdo completa: nenhum dos 29 tópicos pode ficar
                # sem explicação detalhada, seja na fonte, seja na página renderizada.
                topic_rows = page.evaluate("""() => window.SILM.manual.topics.map(t => ({
                    id: t.id, title: t.title, summary: t.summary || '',
                    content: t.content || ''
                }))""")
                assert len(topic_rows) == 29, f"Tópicos do Manual: {len(topic_rows)}"
                assert len({item["id"] for item in topic_rows}) == 29
                for item in topic_rows:
                    assert len(item["summary"].strip()) >= 20, (
                        f"Resumo ausente em {item['id']}"
                    )
                    assert len(item["content"].strip()) >= 120, (
                        f"Explicação ausente em {item['id']}"
                    )
                    page.evaluate(
                        """topicId => {location.hash = '#/manual?topico='
                          + encodeURIComponent(topicId)}""", item["id"]
                    )
                    article = page.locator(
                        f'.silm-manual-article[data-manual-topic="{item["id"]}"]'
                    )
                    expect(article).to_be_visible(timeout=10000)
                    expect(article.locator(".silm-manual-purpose p")).to_be_visible()
                    explanation = article.locator(".silm-manual-explanation")
                    expect(explanation.locator("h2")).to_have_text("Entenda")
                    assert len(explanation.locator("p").all_inner_texts()) >= 1
                    assert len(" ".join(explanation.locator("p").all_inner_texts()).strip()) >= 120, (
                        f"Página sem explicação renderizada: {item['id']}"
                    )
                # Todas as 13 categorias são artigos independentes, não apenas
                # listas de links ou cópias do primeiro subtópico.
                categories = page.evaluate("""() => Object.entries(window.SILM.manual.categoryGuides).map(([id, guide]) => ({
                    id, purpose: guide.purpose || '', content: guide.content || '',
                    steps: guide.steps || []
                }))""")
                assert len(categories) == 13, f"Guias de categorias: {len(categories)}"
                for category in categories:
                    assert len(category["purpose"].strip()) >= 60, category["id"]
                    assert len(category["content"].strip()) >= 200, category["id"]
                    assert len(category["steps"]) >= 3, category["id"]
                    page.evaluate(
                        """id => {location.hash = '#/manual?categoria='
                          + encodeURIComponent(id)}""", category["id"]
                    )
                    article = page.locator(
                        f'.silm-manual-category-page[data-manual-category="{category["id"]}"]'
                    )
                    expect(article).to_be_visible(timeout=10000)
                    expect(article.locator(".silm-manual-purpose p")).to_be_visible()
                    explanation = article.locator(".silm-manual-explanation")
                    expect(explanation).to_be_visible()
                    assert len(explanation.inner_text().strip()) >= 200, (
                        f"Categoria sem explicação visível: {category['id']}"
                    )
                    expect(article.locator(".silm-manual-how .silm-manual-steps li")).not_to_have_count(0)
                    expect(article.locator(".silm-manual-more .silm-manual-topic-link")).not_to_have_count(0)
                expect(page.locator("#manual-conteudo")).to_be_visible()
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
