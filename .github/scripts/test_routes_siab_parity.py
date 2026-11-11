"""Roteiros SIAB → SILM: conteúdo, filtros, hipótese, montagem e relatório.

Executar com servidor local na raiz: python -m http.server 8765
e python .github/scripts/test_routes_siab_parity.py --browser chromium
"""
from __future__ import annotations

import argparse
import re
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


def run(browser_name: str, root: str) -> None:
    with sync_playwright() as p:
        browser = getattr(p, browser_name).launch(headless=True)
        for width, height in [(390, 844), (768, 1024), (1440, 900)]:
            context = browser.new_context(
                viewport={"width": width, "height": height},
                locale="pt-BR",
                reduced_motion="reduce",
                service_workers="block",
            )
            page = context.new_page()
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.goto(root.rstrip("/") + "/#/roteiros", wait_until="domcontentloaded")
            listing = page.locator("#silm-route-catalog .silm-content-row")
            expect(listing).to_have_count(26, timeout=20000)
            expect(page.locator("#silm-routes-filter")).to_be_visible()
            expect(page.locator("#silm-routes-metal-filter option")).to_have_count(66)
            expect(page.locator("#silm-routes-search")).to_be_visible()
            expect(page.locator(".silm-learning-count")).to_contain_text("26 roteiros")

            page.locator("#silm-routes-metal-filter").select_option("60")
            assert page.locator(
                "#silm-route-catalog .silm-content-row:visible"
            ).count() > 0
            page.locator("#silm-routes-filter").select_option("familias")
            assert page.locator(
                "#silm-route-catalog .silm-content-row:visible"
            ).count() > 0
            page.locator("#silm-routes-filter").select_option("all")
            page.locator("#silm-routes-metal-filter").select_option("all")
            page.locator("#silm-routes-search").fill("neodimio")
            assert page.locator(
                "#silm-route-catalog .silm-content-row:visible"
            ).count() > 0
            page.locator("#silm-routes-search").fill("")

            routes = page.evaluate("""() => window.SILM.routes.registry.map(r => ({
                id:r.id, metals:r.metalSelection.atomicNumbers,
                study:r.study, mode:r.structureRequirements
            }))""")
            assert len(routes) == 26

            focus = routes if width == 1440 else [
                r for r in routes if r["id"] in (
                    "ordem-metal", "roteiro-lantanideos",
                    "roteiro-parametro-a", "roteiro-cu-nd"
                )
            ]
            for route in focus:
                study = route["study"]
                assert study and len(study["tasks"]) >= 4, route["id"]
                assert len(study["observe"]) >= 3, route["id"]
                assert len(study["interpretation"]) >= 2, route["id"]
                page.goto(root.rstrip("/") + "/#/roteiros?item=" + route["id"])
                article = page.locator("#silm-route-catalog .silm-reading")
                expect(article).to_be_visible()
                expect(article).to_contain_text("Pergunta central")
                expect(article).to_contain_text(study["question"])
                expect(article.locator("section ol").first).to_have_count(1)
                expect(page.locator(".silm-experiment-observation-row")).to_have_count(
                    len(study["observe"])
                )
                expect(page.locator("#route-hypothesis")).to_be_visible()
                expect(page.locator("#route-metal option")).to_have_count(
                    len(route["metals"])
                )
                expect(page.locator("#route-mount")).to_be_visible()

            # O roteiro continua uma atividade livre: hipótese registrada, sem
            # alterar os valores científicos ou aplicar trava de missão.
            page.goto(root.rstrip("/") + "/#/roteiros?item=roteiro-cu-nd")
            prediction = (
                "Prevejo que o cobre e o neodímio terão limitações diferentes; "
                "o ímã Nd-Fe-B não é o metal puro."
            )
            page.locator("#route-hypothesis").fill(prediction)
            page.locator("#route-metal").select_option("29")
            page.locator("#route-mount").click()
            expect(page).to_have_url(re.compile(r".*#/ambiente.*"), timeout=10000)
            free = page.evaluate("""() => ({
                experiment: BaseDemoSI.storage.get('route.experiment',null),
                route: window.SILM.routes.get('roteiro-cu-nd')
            })""")
            assert free["experiment"]["route"] == "roteiro-cu-nd", free
            assert free["experiment"]["hypothesis"] == prediction, free
            page.goto(root.rstrip("/") + "/#/relatorios")
            report = page.locator("#silm-route-report")
            expect(report).to_contain_text("Hipótese inicial registrada")
            expect(report).to_contain_text(prediction)
            expect(report).to_contain_text("Pergunta central do roteiro")
            expect(report).to_contain_text("Plano de observações")
            expect(report).to_contain_text("Questões para interpretar")
            if width == 1440:
                Path("artifacts").mkdir(exist_ok=True)
                page.goto(root.rstrip("/") + "/#/roteiros")
                page.screenshot(
                    path=f"artifacts/roteiros-catalogo-{browser_name}.png",
                    full_page=True,
                )
                page.goto(root.rstrip("/") + "/#/roteiros?item=roteiro-lantanideos")
                page.screenshot(
                    path=f"artifacts/roteiros-lantanideos-{browser_name}.png",
                    full_page=True,
                )
                page.goto(root.rstrip("/") + "/#/relatorios")
                page.screenshot(
                    path=f"artifacts/roteiros-relatorio-{browser_name}.png",
                    full_page=True,
                )
            if width == 390:
                for route in ("#/roteiros", "#/roteiros?item=roteiro-cu-nd"):
                    page.goto(root.rstrip("/") + "/" + route)
                    overflow = page.evaluate(
                        "() => document.documentElement.scrollWidth - innerWidth"
                    )
                    assert overflow <= 2, (browser_name, route, overflow)
            assert not errors, (browser_name, width, errors)
            print(f"OK: {browser_name} {width}x{height}; 26 roteiros e hipótese registrada")
            context.close()
        browser.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--browser", choices=["chromium", "firefox", "webkit"], required=True)
    parser.add_argument("--url", default="http://127.0.0.1:8765")
    args = parser.parse_args()
    run(args.browser, args.url)
