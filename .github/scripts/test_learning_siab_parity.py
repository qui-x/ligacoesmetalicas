"""Valida os catálogos expandidos e suas interfaces em Chromium, Firefox e WebKit.

Os critérios científicos e a persistência são testados separadamente pelo contrato Node.
"""
from __future__ import annotations

import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright, expect


def run(browser_name: str, base_url: str) -> None:
    root = base_url.rstrip("/")
    with sync_playwright() as playwright:
        browser = getattr(playwright, browser_name).launch(headless=True)
        for width, height in ((390, 844), (1440, 900)):
            context = browser.new_context(
                viewport={"width": width, "height": height},
                locale="pt-BR",
                reduced_motion="reduce",
                service_workers="block",
            )
            page = context.new_page()
            errors: list[str] = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.goto(root + "/#/aprender", wait_until="domcontentloaded")
            expect(page.locator("#silm-themes .silm-content-row").first).to_be_visible(timeout=20000)
            expect(page.locator("#silm-themes-filter")).to_be_visible()
            expect(page.locator("#silm-themes-search")).to_be_visible()
            expect(page.locator("#silm-themes-metal-filter option")).to_have_count(66)
            expect(page.locator(".silm-learning-count")).to_contain_text("temas")
            page.locator("#silm-themes-filter").select_option("familias")
            assert page.locator("#silm-themes .silm-content-row:visible").count() >= 6
            page.locator("#silm-themes-filter").select_option("all")
            page.locator("#silm-themes-search").fill("neodimio")
            assert page.locator("#silm-themes .silm-content-row:visible").count() >= 1
            page.locator("#silm-themes-search").fill("")
            page.locator("#silm-themes-metal-filter").select_option("60")
            assert page.locator("#silm-themes .silm-content-row:visible").count() > 0
            assert "temas" in page.locator(".silm-learning-count").inner_text()
            page.locator("#silm-themes-metal-filter").select_option("all")
            themes = page.evaluate(
                """() => window.SILM.themes.registry.map(t => ({
                    id:t.id, metals:t.relatedMetals, investigation:t.investigation
                }))"""
            )
            assert len(themes) == 39
            expect(page.locator("#silm-themes .silm-content-row")).to_have_count(len(themes))
            active_themes = themes if width == 1440 else [
                x for x in themes if x["id"] in
                ("ligacao-metalica", "familia-alcalinos", "lantanideos-modelos", "cobre-neodimio", "lantanideos-dhcp")
            ]
            for theme in active_themes:
                study = theme["investigation"]
                assert study and len(study["actions"]) == 3, theme["id"]
                page.goto(root + "/#/aprender?tema=" + theme["id"])
                section = page.locator("#silm-themes .silm-theme-inquiry")
                expect(section).to_be_visible()
                expect(section.locator("h2")).to_have_text("Investigue este tema")
                expect(section.locator(".silm-theme-inquiry-steps li")).to_have_count(3)
                expect(page.locator("#theme-investigate")).to_be_visible()
                if len(theme["metals"]) > 1 and theme["id"] != "cobre-neodimio":
                    expect(page.locator("#silm-theme-metal option")).to_have_count(
                        len(theme["metals"])
                    )
                assert len(section.inner_text().strip()) > 250, theme["id"]
            page.goto(root + "/#/aprender?tema=lantanideos-modelos")
            page.locator("#silm-theme-metal").select_option("60")
            expect(page.locator("#silm-theme-metal")).to_have_value("60")
            page.goto(root + "/#/aprender?tema=cobre-neodimio")
            expect(page.locator("#theme-compare-neodimio")).to_be_visible()
            expect(page.locator(".silm-learning-science-note")).to_contain_text(
                "não calcula o magnetismo"
            )

            page.goto(root + "/#/missoes", wait_until="domcontentloaded")
            expect(page.locator("#silm-mission-catalog .silm-content-row").first).to_be_visible(timeout=20000)
            expect(page.locator("#silm-missions-filter")).to_be_visible()
            expect(page.locator("#silm-missions-search")).to_be_visible()
            expect(page.locator("#silm-missions-metal-filter option")).to_have_count(66)
            expect(page.locator(".silm-learning-count")).to_contain_text("missões")
            page.locator("#silm-missions-filter").select_option("propriedades")
            assert page.locator("#silm-mission-catalog .silm-content-row:visible").count() >= 5
            page.locator("#silm-missions-filter").select_option("all")
            page.locator("#silm-missions-search").fill("neodimio")
            assert page.locator("#silm-mission-catalog .silm-content-row:visible").count() >= 1
            page.locator("#silm-missions-search").fill("")
            page.locator("#silm-missions-metal-filter").select_option("60")
            assert page.locator("#silm-mission-catalog .silm-content-row:visible").count() > 0
            page.locator("#silm-missions-metal-filter").select_option("all")
            missions = page.evaluate(
                """() => window.SILM.missions.registry.map(m => ({
                    id:m.id, metals:m.metalSelection.atomicNumbers,
                    study:m.study, objectives:m.evidenceObjectives
                }))"""
            )
            assert len(missions) == 42
            expect(page.locator("#silm-mission-catalog .silm-content-row")).to_have_count(len(missions))
            active_missions = missions if width == 1440 else [
                x for x in missions if x["id"] in
                ("montagem-ordem", "lantanideos-eletrons", "calor-metalico",
                 "objeto-ao-centro", "travessia-metais", "lantanideos-dhcp")
            ]
            for mission in active_missions:
                study = mission["study"]
                assert study and len(study["questions"]) >= 2, mission["id"]
                assert len(mission["objectives"]) >= 2, mission["id"]
                page.goto(root + "/#/missoes?item=" + mission["id"])
                section = page.locator("#silm-mission-catalog .silm-mission-inquiry")
                expect(section).to_be_visible()
                expect(section).to_contain_text(study["question"])
                expect(page.locator("#mission-metal option")).to_have_count(
                    len(mission["metals"])
                )
                expect(page.locator(".silm-mission-objectives li")).to_have_count(
                    len(mission["objectives"])
                )
                expect(page.locator("#mission-mount")).to_be_visible()
            page.goto(root + "/#/missoes?item=objeto-ao-centro")
            expect(page.locator("#mission-metal option")).to_have_count(1)
            page.goto(root + "/#/missoes?item=travessia-metais")
            expect(page.locator("#mission-metal option")).to_have_count(62)
            page.goto(root + "/#/missoes?item=lantanideos-eletrons")
            expect(page.locator("#mission-metal option")).to_have_count(14)
            expect(page.locator("#mission-metal")).to_contain_text("rede não disponível")

            if width == 390:
                for route in (
                    "#/aprender", "#/missoes",
                    "#/aprender?tema=lantanideos-modelos",
                    "#/missoes?item=travessia-metais",
                ):
                    page.goto(root + "/" + route)
                    overflow = page.evaluate(
                        "() => document.documentElement.scrollWidth - window.innerWidth"
                    )
                    assert overflow <= 2, (browser_name, route, overflow)
            else:
                Path("artifacts").mkdir(exist_ok=True)
                page.goto(root + "/#/aprender")
                page.screenshot(
                    path=f"artifacts/temas-catalogo-{browser_name}.png",
                    full_page=True,
                )
                page.goto(root + "/#/aprender?tema=lantanideos-modelos")
                page.screenshot(
                    path=f"artifacts/temas-lantanideos-{browser_name}.png",
                    full_page=True,
                )
                page.goto(root + "/#/missoes")
                page.screenshot(
                    path=f"artifacts/missoes-catalogo-{browser_name}.png",
                    full_page=True,
                )
                page.goto(root + "/#/missoes?item=travessia-metais")
                page.screenshot(
                    path=f"artifacts/missoes-travessia-{browser_name}.png",
                    full_page=True,
                )
            assert not errors, (browser_name, width, errors)
            print(f"OK: {browser_name} {width}x{height}; {len(themes)} temas e {len(missions)} missões")
            context.close()
        browser.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--browser", choices=("chromium", "firefox", "webkit"), required=True)
    parser.add_argument("--url", default="http://127.0.0.1:8765")
    args = parser.parse_args()
    run(args.browser, args.url)
