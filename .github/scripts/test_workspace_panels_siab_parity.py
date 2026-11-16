#!/usr/bin/env python3
"""Regressão do fluxo Montagem/Ver/Dados: sem aba Unidades ou duplicação científica.
Uso: python .github/scripts/test_workspace_panels_siab_parity.py --browser chromium
"""
import argparse
import pathlib
from playwright.sync_api import sync_playwright

parser = argparse.ArgumentParser()
parser.add_argument("--browser", choices=("chromium", "firefox", "webkit"), default="chromium")
args = parser.parse_args()
out = pathlib.Path("artifacts/workspace-panels")
out.mkdir(parents=True, exist_ok=True)

with sync_playwright() as pw:
    browser = getattr(pw, args.browser).launch(headless=True)
    for name, width, height in (("desktop", 1440, 900), ("mobile", 390, 844)):
        context = browser.new_context(viewport={"width": width, "height": height}, reduced_motion="reduce")
        page = context.new_page()
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))
        response = page.goto("http://127.0.0.1:8765/index.html#/ambiente", wait_until="load")
        assert response and response.ok, (name, "SILM não carregou")
        page.wait_for_function("window.SILMIntegration && document.querySelector('#silm-start')")
        montagem = page.locator('[data-open-dock="montagem"]')

        # Nenhuma aba Unidades: os centros são manipulados na cena. A escolha
        # de módulo ocorre somente na Montagem, com um seletor interno oculto.
        assert page.locator('[data-left-tab="objetos"], [data-left-panel="objetos"]').count() == 0, (
            name, "A aba Unidades ainda existe"
        )
        assert page.locator("#silm-unit-inventory, #silm-unit-count").count() == 0, (
            name, "Inventário de unidades duplicado"
        )
        assert page.locator("#silm-module-shortcuts, [data-silm-module-shortcut]").count() == 0
        assert page.locator('[data-left-panel="modulo"] #silm-module-cards').count() == 1
        assert page.locator('#silm-module-choice').is_hidden()
        assert page.locator('[data-left-panel="preparo"] #silm-free-assembly').count() == 1
        assert page.locator('[data-right-panel="ver"] #silm-module').count() == 0
        assert page.locator('[data-right-panel="dados"] #silm-data-catalog').count() == 1

        # Doca esquerda e direita devem preservar integralmente o espaço
        # reservado à cena, inclusive em 901, 1024, 1280, 1440 e 1920 px.
        if name == "desktop":
            for viewport_width in (901, 1024, 1280, 1440, 1920):
                page.set_viewport_size({"width": viewport_width, "height": 900})
                initial = page.locator("#si-stage").bounding_box()
                before = page.evaluate("JSON.stringify(SILMIntegration.snapshot())")
                montagem.click()
                left = page.locator("#si-dock-left").bounding_box()
                stage = page.locator("#si-stage").bounding_box()
                action = page.locator("#silm-scene-actionbar").bounding_box()
                assert left["x"] + left["width"] <= stage["x"] + 2, (args.browser, viewport_width, "Montagem sobreposta")
                assert action is None or left["x"] + left["width"] <= action["x"] + 2, (
                    args.browser, viewport_width, "Montagem cobre a barra científica"
                )
                assert stage["width"] > 340 and stage["width"] < initial["width"] - 100, (
                    args.browser, viewport_width, "Cena não redimensionou"
                )
                page.locator('[data-left-tab="resumo"]').click()
                page.locator('[data-close-dock="left"]').click()
                assert page.locator("#si-stage").bounding_box()["width"] > stage["width"] + 100
                montagem.click()
                assert page.locator('[data-left-tab="resumo"]').get_attribute("aria-pressed") == "true"
                assert page.locator("#si-left-title").inner_text() == "Resumo"
                page.locator('[data-close-dock="left"]').click()
                page.locator('[data-open-dock="dados"]').click()
                right = page.locator("#si-dock-right").bounding_box()
                stage = page.locator("#si-stage").bounding_box()
                action = page.locator("#silm-scene-actionbar").bounding_box()
                assert stage["x"] + stage["width"] <= right["x"] + 2, (args.browser, viewport_width, "Dados sobreposto")
                assert action is None or action["x"] + action["width"] <= right["x"] + 2
                montagem.click()
                assert page.locator("#si-dock-right").is_hidden()
                assert page.locator("#si-dock-left").is_visible()
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 5")
                assert page.evaluate("JSON.stringify(SILMIntegration.snapshot())") == before
                page.locator('[data-close-dock="left"]').click()
            page.set_viewport_size({"width": width, "height": height})

        montagem.click()
        page.locator('[data-left-tab="preparo"]').click()
        assert page.locator("#silm-free-assembly").is_hidden(), (name, "Montagem livre sem investigação ativa")
        assert page.locator("#silm-open-periodic").is_visible()
        assert page.locator("#silm-manual-start").count() == 1
        page.locator("#silm-manual-start > summary").click()
        assert page.locator("#silm-manual-start").evaluate("(el) => el.open")
        page.locator("#silm-metal").select_option("29")
        page.locator("#silm-start").click()
        page.wait_for_function(
            "SILMIntegration.snapshot()?.metal?.atomicNumber === 29 "
            "&& SILMIntegration.snapshot()?.structure?.mode === 'free'"
        )
        assert page.locator("#silm-free-assembly").is_visible(), (name, "Montagem livre não acessível em Preparo")
        assert page.locator("#silm-free-assembly").evaluate("(el) => el.open"), (
            name, "Montagem livre recém-iniciada deveria abrir para o estudante"
        )
        assert page.locator("#silm-free-tools").is_visible()
        assert page.locator("#silm-add").is_visible()
        page.locator("#silm-add").click()
        page.wait_for_function("SILMIntegration.snapshot().structure.units.length === 1")
        assert page.locator("#silm-summary-list").count() == 1
        page.locator('[data-left-tab="resumo"]').click()
        summary = page.locator("#silm-summary-list").inner_text()
        assert "Cobre" in summary and "Montagem livre" in summary
        assert "Medições" not in summary and "Cálculos" not in summary, (
            name, "Dados científicos duplicados no Resumo"
        )

        # Um cartão ativo por vez, sem o seletor paralelo ficar visível.
        page.locator('[data-left-tab="modulo"]').click()
        cards = page.locator("#silm-module-cards details")
        assert cards.count() == 3
        cards.nth(0).locator("summary").click()
        cards.nth(1).locator("summary").click()
        page.wait_for_function(
            "() => !document.querySelector('#silm-module-cards details:nth-child(1)').open "
            "&& document.querySelector('#silm-module-cards details:nth-child(2)').open"
        )
        page.locator("#silm-module-activate-medir").click()
        page.wait_for_function("SILMIntegration.snapshot().module.active === 'medir'")
        assert page.locator("#si-workspace").get_attribute("data-silm-module") == "medir"
        assert page.locator('#silm-module-choice').is_hidden()
        cards.nth(0).locator("summary").click()
        page.locator("#silm-module-activate-explorar").click()
        page.wait_for_function("SILMIntegration.snapshot().module.active === 'explorar'")

        # Ferramentas de construção só aparecem na Montagem livre em Preparo.
        page.locator('[data-left-tab="preparo"]').click()
        # A montagem livre é uma seção secundária recolhível; o usuário
        # pode voltar ao módulo e expandi-la novamente.
        if not page.locator("#silm-free-assembly").evaluate("(el) => el.open"):
            page.locator("#silm-free-assembly > summary").click()
        assert page.locator("#silm-add").is_visible()
        page.locator('[data-close-dock="left"]').click()
        page.locator('[data-open-dock="ver"]').click()
        more = page.locator("#silm-ver-more")
        assert more.count() == 1 and not more.evaluate("(el) => el.open")
        assert page.locator("#silm-explore-extras").count() == 0
        assert page.locator("#silm-direct-actionbar .silm-observer-action").count() > 0
        assert page.locator('[data-silm-data-open]').count() == 3
        more.locator(":scope > summary").click()
        assert page.locator("#si-viewer-catalog").is_visible()
        page.locator('[data-close-dock="right"]').click()

        page.locator('[data-open-dock="dados"]').click()
        assert page.locator('[data-silm-data-open="tabela"] strong').inner_text() == "Metal e propriedades"
        assert page.locator('#silm-data-catalog .silm-data-documents a').count() == 2
        page.locator('[data-silm-data-open="tabela"]').click()
        panel = page.locator("#silm-data")
        assert "Propriedades do metal" in panel.inner_text()
        assert "Estrutura de referência" in panel.inner_text()
        details = panel.locator("details")
        assert details.count() >= 1
        details.first.locator("summary").click()
        assert details.first.evaluate("(el) => el.open")
        # Atualização científica não pode fechar os dados e suas fontes
        # enquanto o estudante os lê no painel direito.
        page.evaluate("document.querySelector('#silm-add').click()")
        page.wait_for_function("SILMIntegration.snapshot().structure.units.length === 2")
        assert details.first.evaluate("(el) => el.open")
        page.locator("#silm-data-back").click()
        assert not page.locator("#silm-data-catalog").is_hidden()

        # A estrutura livre pode ser organizada, mas a ação desaparece depois
        # da transição cristalográfica (sem recriar aba Unidades).
        page.locator('[data-close-dock="right"]').click()
        montagem.click()
        page.locator('[data-left-tab="preparo"]').click()
        page.locator("#silm-organize").click()
        page.wait_for_function("SILMIntegration.snapshot().structure.mode === 'crystalline'")
        assert page.locator("#silm-add").is_hidden()
        assert page.locator("#silm-organize").is_hidden()
        assert page.locator("#silm-free-assembly").is_visible()
        page.locator("#silm-free-assembly > summary").click()
        assert page.locator("#silm-free").is_visible()
        assert page.locator('[data-left-tab="resumo"]').count() == 1
        assert page.locator('[data-left-tab="modulo"]').count() == 1

        if name == "mobile":
            assert page.locator("#si-dock-left").is_visible()
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 5")
        page.screenshot(path=str(out / f"{args.browser}-{name}.png"), animations="disabled")
        assert not errors, (name, "Erros JS", errors)
        print(f"OK {args.browser} {name}: sem Unidades, edição contextual, módulo único, Ver e Dados preservados")
        context.close()
    browser.close()
