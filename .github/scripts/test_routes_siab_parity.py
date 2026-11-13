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

            # Terras raras = 15 lantanídeos + Sc + Y (17 no total);
            # 16 selecionáveis, pois Pm permanece indisponível.
            page.goto(root.rstrip("/") + "/#/roteiros?item=roteiro-lantanideos")
            expect(page.locator("#route-metal option")).to_have_count(16)
            metals = page.locator("#route-metal option").evaluate_all(
                "(options) => options.map(option => Number(option.value))"
            )
            assert 21 in metals and 39 in metals and 60 in metals
            assert 61 not in metals
            article = page.locator("#silm-route-catalog .silm-reading")
            expect(article).to_contain_text("Terras Raras: explorar os metais")
            expect(article).to_contain_text("campo elétrico")
            expect(page.locator(".silm-experiment-observation-row")).to_have_count(5)

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
            # A ação vem do motor real e alimenta o histórico; nenhuma
            # entrada do diário é fabricada pelo teste.
            page.evaluate("""() => {
                const button = document.querySelector('#silm-direct-actionbar [data-action="property-electrical"]');
                if (!button || button.disabled) throw new Error('Condutividade elétrica indisponível na Oficina');
                button.click();
            }""")
            # Conferir documentos duráveis antes da recarga (intermitência no WebKit).
            page.wait_for_function("""(prediction) => {
                const payload = JSON.parse(localStorage.getItem('silm-base-integration:documents-v1') || '{}');
                const docs = payload.documents || {};
                const experiment = JSON.parse(docs['route.experiment'] || 'null');
                const state = JSON.parse(docs['scientific.state'] || 'null');
                const hypothesis = JSON.parse(docs['route.hypothesis.investigation:' + experiment?.investigation] || 'null');
                return experiment?.hypothesis === prediction &&
                    hypothesis === prediction && state?.investigation?.id === experiment.investigation;
            }""", prediction, timeout=15000)
            page.goto(root.rstrip("/") + "/#/relatorios")
            report = page.locator("#silm-route-report")
            try:
                expect(report).to_contain_text("Hipótese inicial registrada")
            except AssertionError:
                diagnostics = page.evaluate("""() => {
                    const payload = JSON.parse(localStorage.getItem('silm-base-integration:documents-v1') || '{}');
                    const docs = payload.documents || {};
                    return {
                        route: JSON.parse(docs['route.experiment'] || 'null'),
                        scientific: JSON.parse(docs['scientific.state'] || 'null')?.investigation,
                        live: window.SILMIntegration?.snapshot?.()?.investigation,
                        hypothesisKeys: Object.keys(docs).filter(k => k.startsWith('route.hypothesis.investigation:')),
                        currentUrl: location.href
                    };
                }""")
                raise AssertionError(f"Roteiro sem hipótese após navegação: {diagnostics}") from None
            expect(report).to_contain_text(prediction)
            expect(report).to_contain_text("Pergunta central do roteiro")
            expect(report).to_contain_text("Plano de observações")
            expect(report).to_contain_text("Questões para interpretar")
            # A identidade do relatório reflete o metal estudado, sem desenhar
            # moléculas orgânicas ou inventar parâmetros cristalográficos.
            header = report.locator(".silm-report-doc-head")
            expect(header.locator(".silm-report-mast")).to_contain_text("LIGAÇÕES METÁLICAS")
            expect(header.locator(".silm-report-element")).to_contain_text("Cu")
            expect(header.locator(".silm-report-element")).to_contain_text("Cobre")
            expect(header.locator(".silm-report-meta")).to_contain_text("Montagem livre")
            expect(header.locator(".silm-report-provenance")).to_contain_text("Representação qualitativa")
            expect(report.locator(".silm-report-doc")).to_have_attribute("data-scientific-module", "explorar")
            expect(report.locator('[data-report-section="propriedades"]')).to_contain_text("Propriedades disponíveis")
            expect(report.locator(".silm-report-property-history")).to_contain_text("Histórico de interações")
            expect(report.locator(".silm-report-property-history")).to_contain_text("Condutividade elétrica")
            expect(report.locator(".silm-report-property-history")).to_contain_text("Início")
            expect(report.locator(".silm-report-property-history")).to_contain_text("Não são medidas experimentais")
            expect(report.locator('[data-report-section="medicoes"]')).to_have_count(0)
            expect(report.locator('[data-report-section="calculos"]')).to_have_count(0)
            expect(report.locator('[data-report-section="condicoes"]')).to_contain_text("Condições de referência")
            assert page.evaluate("""() => {
                const doc = document.querySelector('.silm-report-doc');
                return document.documentElement.scrollWidth - innerWidth <= 2 &&
                    doc.scrollWidth - doc.clientWidth <= 2;
            }"""), (browser_name, width, "relatório com rolagem horizontal")
            page.emulate_media(media="print")
            assert page.locator(".silm-report-element").is_visible()
            assert not page.locator(".silm-report-settings").is_visible()
            assert page.locator(".silm-report-doc").is_visible()
            page.emulate_media(media="screen")
            # A ficha docente apresenta critérios e presença de registros, sem
            # alterar o relatório original nem simular correção automática.
            before = page.evaluate("""() => {
                const doc = JSON.parse(localStorage.getItem('silm-base-integration:documents-v1') || '{}').documents || {};
                return JSON.stringify(Object.fromEntries(Object.entries(doc).filter(
                    ([key]) => key === 'scientific.state' || key.startsWith('report.free:') || key === 'route.session'
                )));
            }""")
            page.locator("#report-mode").select_option("formativa")
            expect(report.locator('[data-report-section="indicadores"]')).to_contain_text("Indicadores para observação docente")
            expect(report.locator("#report-formative-rubric")).to_contain_text("Limitações do modelo")
            expect(report.locator('[data-report-section="registros"]')).to_contain_text("presença de registros")
            expect(report.locator('[data-report-section="devolutiva"]')).to_contain_text("Próxima investigação ou intervenção")
            expect(report).to_contain_text("não realiza correção automática")
            assert page.evaluate("""() => {
                const doc = JSON.parse(localStorage.getItem('silm-base-integration:documents-v1') || '{}').documents || {};
                return JSON.stringify(Object.fromEntries(Object.entries(doc).filter(
                    ([key]) => key === 'scientific.state' || key.startsWith('report.free:') || key === 'route.session'
                )));
            }""") == before
            page.locator("#report-mode").select_option("completo")
            expect(report).to_contain_text("Hipótese inicial registrada")
            expect(report).to_contain_text(prediction)
            # Um mesmo experimento pode mudar de módulo sem misturar os textos
            # autorais, os registros científicos ou as fontes de cada área.
            report.locator("#report-observations").fill("Observei o brilho no módulo Explorar.")
            report.locator("#route-report-notebook").click()
            # O histórico acompanha o arquivo no Caderno, independente dos
            # registros científicos posteriores da investigação.
            archive = page.evaluate("""() => {
                const store = JSON.parse(localStorage.getItem('silm-base-integration:documents-v1') || '{}').documents || {};
                return Object.values(store).map(v => { try { return JSON.parse(v); } catch { return null; } })
                    .find(v => v?.propertyHistory?.events?.some(x => x.property === 'electrical'));
            }""")
            assert archive and archive["propertyHistory"]["events"], (browser_name, width, "sem histórico arquivado")
            page.goto(root.rstrip("/") + "/#/ambiente")
            measure_button = page.locator('[data-silm-module-shortcut="medir"]')
            expect(measure_button).to_be_enabled()
            page.evaluate("""() => {
                const selector = document.getElementById('silm-module');
                if (!selector || selector.disabled) throw new Error('Seletor científico indisponível');
                selector.value = 'medir';
                selector.dispatchEvent(new Event('change', {bubbles: true}));
            }""")
            page.goto(root.rstrip("/") + "/#/relatorios")
            expect(report.locator(".silm-report-doc")).to_have_attribute("data-scientific-module", "medir")
            expect(report.locator('[data-report-section="medicoes"]')).to_contain_text("Nenhuma medição registrada")
            expect(report.locator('[data-report-section="propriedades"]')).to_have_count(0)
            expect(report.locator('[data-report-section="calculos"]')).to_have_count(0)
            expect(report.locator("#report-observations")).to_have_value("")
            report.locator("#report-observations").fill("A régua do modelo não foi usada.")
            report.locator("#route-report-notebook").click()
            page.goto(root.rstrip("/") + "/#/ambiente")
            calculate_button = page.locator('[data-silm-module-shortcut="calcular"]')
            expect(calculate_button).to_be_enabled()
            page.evaluate("""() => {
                const selector = document.getElementById('silm-module');
                if (!selector || selector.disabled) throw new Error('Seletor científico indisponível');
                selector.value = 'calcular';
                selector.dispatchEvent(new Event('change', {bubbles: true}));
            }""")
            page.goto(root.rstrip("/") + "/#/relatorios")
            expect(report.locator(".silm-report-doc")).to_have_attribute("data-scientific-module", "calcular")
            expect(report.locator('[data-report-section="calculos"]')).to_contain_text("Nenhum cálculo registrado")
            expect(report.locator('[data-report-section="propriedades"]')).to_have_count(0)
            expect(report.locator('[data-report-section="medicoes"]')).to_have_count(0)
            expect(report.locator("#report-observations")).to_have_value("")
            report.locator("#report-observations").fill("Ainda não apliquei uma fórmula.")
            report.locator("#route-report-notebook").click()
            page.goto(root.rstrip("/") + "/#/ambiente")
            page.evaluate("""() => {
                const selector = document.getElementById('silm-module');
                if (!selector || selector.disabled) throw new Error('Seletor científico indisponível');
                selector.value = 'explorar';
                selector.dispatchEvent(new Event('change', {bubbles: true}));
            }""")
            page.goto(root.rstrip("/") + "/#/relatorios")
            expect(report.locator(".silm-report-doc")).to_have_attribute("data-scientific-module", "explorar")
            expect(report.locator("#report-observations")).to_have_value("Observei o brilho no módulo Explorar.")
            expect(report.locator('[data-report-section="medicoes"]')).to_have_count(0)
            expect(report.locator('[data-report-section="calculos"]')).to_have_count(0)
            assert page.evaluate("""() => {
                const s = window.SILMIntegration?.snapshot?.();
                return s?.module?.active === 'explorar' && Array.isArray(s.measurements) &&
                    Array.isArray(s.calculations);
            }"""), (browser_name, width, "dados científicos perdidos ao alternar módulo")
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
