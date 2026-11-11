"""Audita a dinâmica investigativa das Missões e Temas do SILM em navegadores reais.

O catálogo SIAB orienta pergunta, previsão, evidência, interpretação e conclusão;
o modelo SILM permanece como única fonte dos critérios científicos.
"""
from __future__ import annotations

import argparse
from pathlib import Path
from playwright.sync_api import sync_playwright, expect


def run(browser_name: str, base_url: str) -> None:
    root = base_url.rstrip("/")
    with sync_playwright() as playwright:
        browser = getattr(playwright, browser_name).launch(headless=True)
        for width, height in [(390, 844), (1440, 900)]:
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
            expect(page.locator("#silm-themes .silm-content-row")).to_have_count(
                7, timeout=20000
            )
            themes = page.evaluate(
                """() => window.SILM.themes.registry.map(t => ({
                    id:t.id, investigation:t.investigation
                }))"""
            )
            assert len(themes) == 7
            for theme in themes:
                study = theme["investigation"]
                assert study and len(study["actions"]) == 3, theme["id"]
                for key in ("problem", "prediction", "evidence", "reflection"):
                    assert len(study[key]) >= 50, (theme["id"], key)
                page.goto(root + "/#/aprender?tema=" + theme["id"])
                section = page.locator("#silm-themes .silm-theme-inquiry")
                expect(section).to_be_visible()
                expect(section.locator("h2")).to_have_text("Investigue este tema")
                expect(section.locator(".silm-theme-inquiry-steps li")).to_have_count(3)
                expect(page.locator("#theme-investigate")).to_be_visible()
                assert len(section.inner_text().strip()) > 400, theme["id"]

            page.goto(root + "/#/missoes", wait_until="domcontentloaded")
            expect(page.locator("#silm-mission-catalog .silm-content-row")).to_have_count(
                6, timeout=20000
            )
            missions = page.evaluate(
                """() => window.SILM.missions.registry.map(m => ({
                    id:m.id, study:m.study
                }))"""
            )
            assert len(missions) == 6
            for mission in missions:
                study = mission["study"]
                assert study and len(study["questions"]) >= 2, mission["id"]
                for key in ("context", "question", "prediction", "evidence", "limit"):
                    assert len(study[key]) >= 50, (mission["id"], key)
                page.goto(root + "/#/missoes?item=" + mission["id"])
                section = page.locator("#silm-mission-catalog .silm-mission-inquiry")
                expect(section).to_be_visible()
                expect(section).to_contain_text(study["question"])
                expect(page.locator("#mission-metal")).to_be_visible()
                expect(page.locator("#mission-mount")).to_be_visible()

            # Motor real com modelo de teste isolado: evidência científica + conclusão.
            results = page.evaluate(
                """() => {
                    const clone = x => JSON.parse(JSON.stringify(x));
                    const state = {
                        investigation:{id:'test-inquiry'}, metal:{atomicNumber:29},
                        structure:{mode:'free',units:[]},module:{active:'explorar'},
                        measurements:[],calculations:[],
                        properties:{active:null},electrons:{representation:{visible:false,motion:false}}
                    };
                    const model = {
                        state,
                        checkpoint:() => ({state:clone(state)}),
                        snapshot:() => clone(state),
                        rollback:() => {},
                        restore:() => ({ok:true}),
                        begin:(z,kind) => {state.metal={atomicNumber:z};return kind==='mission';},
                        beginAssembly:() => {state.structure={mode:'free',units:[]};return true;},
                        addUnit:() => {state.structure.units.push({id:state.structure.units.length+1});return {ok:true};},
                        organize:() => {state.structure.mode='crystalline';return {ok:true};},
                        setModule:m => {state.module.active=m;return true;}
                    };
                    const storage = {get:() => null,set:() => true};
                    const session=window.SILM.createRouteSession({
                        model,storage,view:()=>({}),onView:()=>true,say:()=>{}
                    });
                    const started=session.start('montagem-ordem',29);
                    model.organize();
                    const evidenceReady=session.ready();
                    const before=session.complete();
                    const stillActive=session.context()?.status==='active';
                    const stored=session.edit('conclusion','A organização periódica foi observada na estrutura, sem representar uma amostra real.');
                    const after=session.complete();
                    return {started,evidenceReady,before,stillActive,stored,after};
                }"""
            )
            assert results["started"] and results["evidenceReady"], results
            assert results["before"]["ok"] is False, results
            assert "conclusão" in results["before"]["message"].lower(), results
            assert results["stillActive"] and results["stored"], results
            assert results["after"]["ok"] is True, results

            if width == 390:
                for route in ("#/aprender?tema=ligacao-metalica", "#/missoes?item=campo-metal"):
                    page.goto(root + "/" + route)
                    overflow = page.evaluate(
                        "() => document.documentElement.scrollWidth - window.innerWidth"
                    )
                    assert overflow <= 2, (browser_name, route, overflow)
            if width == 1440:
                Path("artifacts").mkdir(exist_ok=True)
                page.goto(root + "/#/aprender?tema=propriedades-metalicas")
                page.screenshot(
                    path=f"artifacts/temas-aprofundados-{browser_name}.png",
                    full_page=True,
                )
                page.goto(root + "/#/missoes?item=campo-metal")
                page.screenshot(
                    path=f"artifacts/missao-aprofundada-{browser_name}.png",
                    full_page=True,
                )
            assert not errors, (browser_name, width, errors)
            print(f"OK: {browser_name} {width}x{height}; 7 temas e 6 missões")
            context.close()
        browser.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--browser", choices=("chromium", "firefox", "webkit"), required=True)
    parser.add_argument("--url", default="http://127.0.0.1:8765")
    args = parser.parse_args()
    run(args.browser, args.url)
