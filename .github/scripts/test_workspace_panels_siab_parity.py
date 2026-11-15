#!/usr/bin/env python3
"""Regressão de paridade de atualização: Montagem/Unidades e Dados (SILM × SIAB).
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
        page.on("pageerror", lambda error: errors.append(str(error)))
        response = page.goto("http://127.0.0.1:8765/index.html#/ambiente", wait_until="load")
        assert response and response.ok, f"{name}: falha ao carregar"
        page.wait_for_function("window.SILMIntegration && document.querySelector('#silm-add')")
        montagem = page.locator('[data-open-dock="montagem"]')
        assert page.locator("#silm-module-shortcuts, [data-silm-module-shortcut], .silm-module-navigation").count() == 0, (
            name, "Ver ainda contém seleção duplicada de módulos"
        )
        assert page.locator('[data-left-panel="modulo"] #silm-module-cards').count() == 1, (
            name, "Módulos não estão exclusivamente na Montagem"
        )
        assert page.locator('[data-right-panel="ver"] #silm-module').count() == 0, (
            name, "Controle de escolha de módulo indevidamente presente em Ver"
        )
        if name == "desktop":
            # A doca deve reservar seu espaço entre 901px e 1920px, sem
            # ocultar a estrutura, a Visão geral ou a barra científica.
            for viewport_width in (901, 1024, 1280, 1440, 1920):
                page.set_viewport_size({"width": viewport_width, "height": 900})
                initial = page.locator("#si-stage").bounding_box()
                before = page.evaluate("JSON.stringify(SILMIntegration.snapshot())")
                montagem.click()
                left = page.locator("#si-dock-left").bounding_box()
                stage = page.locator("#si-stage").bounding_box()
                action = page.locator("#silm-scene-actionbar").bounding_box()
                assert left["x"] + left["width"] <= stage["x"] + 2, (
                    args.browser, viewport_width, "Montagem sobreposta à cena", left, stage
                )
                assert action is None or left["x"] + left["width"] <= action["x"] + 2, (
                    args.browser, viewport_width, "Montagem oculta controles", left, action
                )
                assert stage["width"] > 340 and stage["width"] < initial["width"] - 100, (
                    args.browser, viewport_width, "cena não redimensionou", stage, initial
                )
                page.locator('[data-left-tab="objetos"]').click()
                page.locator('[data-close-dock="left"]').click()
                assert page.locator("#si-stage").bounding_box()["width"] > stage["width"] + 100, (
                    args.browser, viewport_width, "cena não recuperou a largura"
                )
                montagem.click()
                assert page.locator('[data-left-tab="objetos"]').get_attribute("aria-pressed") == "true", (
                    args.browser, viewport_width, "categoria da Montagem não foi preservada"
                )
                assert page.locator("#si-left-title").inner_text() == "Unidades", (
                    args.browser, viewport_width, "título de Montagem incorreto"
                )
                page.locator('[data-close-dock="left"]').click()
                page.locator('[data-open-dock="dados"]').click()
                right = page.locator("#si-dock-right").bounding_box()
                stage = page.locator("#si-stage").bounding_box()
                action = page.locator("#silm-scene-actionbar").bounding_box()
                assert stage["x"] + stage["width"] <= right["x"] + 2, (
                    args.browser, viewport_width, "Dados sobreposto à cena", stage, right
                )
                assert action is None or action["x"] + action["width"] <= right["x"] + 2, (
                    args.browser, viewport_width, "Dados oculta os controles", action, right
                )
                montagem.click()
                assert page.locator("#si-dock-right").is_hidden(), (
                    args.browser, viewport_width, "as duas docas ficaram abertas"
                )
                assert page.locator("#si-dock-left").is_visible(), (
                    args.browser, viewport_width, "Montagem não abriu após Dados"
                )
                assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 5"), (
                    args.browser, viewport_width, "rolagem horizontal global"
                )
                assert page.evaluate("JSON.stringify(SILMIntegration.snapshot())") == before, (
                    args.browser, viewport_width, "abrir e fechar docas alterou a ciência"
                )
                page.locator('[data-close-dock="left"]').click()
            page.set_viewport_size({"width": width, "height": height})
        montagem.click()
        page.locator('[data-left-tab="preparo"]').click()
        assert page.locator('[data-left-panel="preparo"] #silm-add').count() == 0, (
            name, "Adicionar unidade continua incorretamente em Preparo"
        )
        assert page.locator('[data-left-panel="objetos"] #silm-add').count() == 1, (
            name, "A construção não está na aba Unidades"
        )
        page.locator("#silm-start").click()
        page.wait_for_function("window.SILMIntegration.snapshot().metal !== null")
        page.locator('[data-left-tab="modulo"]').click()
        cards = page.locator("#silm-module-cards details")
        assert cards.count() == 3, f"{name}: módulos da Montagem ausentes"
        cards.nth(0).locator("summary").click()
        cards.nth(1).locator("summary").click()
        page.wait_for_function(
            "() => !document.querySelector('#silm-module-cards details:nth-child(1)').open "
            "&& document.querySelector('#silm-module-cards details:nth-child(2)').open"
        )
        assert not cards.nth(0).evaluate("(el) => el.open"), (
            name, "Módulos deveriam abrir apenas um cartão, como no SIAB"
        )
        page.locator("#silm-module-activate-medir").click()
        page.wait_for_function("SILMIntegration.snapshot().module.active === 'medir'")
        assert page.locator("#si-workspace").get_attribute("data-silm-module") == "medir", (
            name, "Alteração do módulo não sincronizou a apresentação"
        )
        cards.nth(0).locator("summary").click()
        page.locator("#silm-module-activate-explorar").click()
        page.wait_for_function("SILMIntegration.snapshot().module.active === 'explorar'")
        assert page.locator("#si-workspace").get_attribute("data-silm-module") == "explorar", (
            name, "Ver não retornou às ferramentas de Explorar"
        )
        page.locator('[data-left-tab="objetos"]').click()
        page.locator("#silm-add").click()
        page.wait_for_function("window.SILMIntegration.snapshot().structure.units.length === 1")
        page.locator("#silm-unit-inventory .silm-unit-inventory button").first.wait_for()
        assert page.locator("#silm-unit-inventory .silm-unit-inventory button").count() == 1, f"{name}: inventário inicial"
        assert "1 unidade" in page.locator("#silm-unit-count").inner_text(), f"{name}: contagem inicial"
        if name == "desktop":
            assert page.locator("#silm-unit-inventory button").first.get_attribute("aria-label").startswith("Localizar unidade"), "inventário sem navegação"
        page.locator('[data-close-dock="left"]').click()
        page.locator('[data-open-dock="ver"]').click()
        advanced = page.locator("#silm-ver-more")
        assert advanced.count() == 1 and not advanced.evaluate("(el) => el.open"), (
            name, "Ferramentas avançadas devem iniciar recolhidas"
        )
        assert page.locator("#silm-explore-extras").count() == 0, (
            name, "Controles visuais duplicados no Ver"
        )
        assert page.locator("#silm-direct-actionbar .silm-observer-action").count() > 0, (
            name, "Comandos científicos de Explorar não aparecem"
        )
        advanced.locator("summary").click()
        assert page.locator("#si-viewer-catalog").is_visible(), (
            name, "Catálogo SIAB não abre"
        )
        page.locator('[data-close-dock="right"]').click()
        dados = page.locator('[data-open-dock="dados"]')
        dados.click()
        assert page.locator('[data-silm-data-open="tabela"] strong').inner_text() == "Metal e propriedades", (
            name, "Dados mantém texto antigo"
        )
        assert page.locator('#silm-data-catalog .silm-data-documents a').count() == 2, (
            name, "Relatório e Caderno devem ser acessos diretos"
        )
        page.locator('[data-silm-data-open="tabela"]').click()
        panel = page.locator('#silm-data')
        assert "Propriedades do metal" in panel.inner_text(), f"{name}: dados das propriedades ausentes"
        assert "Estrutura de referência" in panel.inner_text(), f"{name}: estrutura ausente"
        details = panel.locator("details")
        assert details.count() >= 1, f"{name}: fontes/condições ausentes"
        details.first.locator("summary").click()
        assert details.first.evaluate("(el) => el.open"), f"{name}: fontes não expandem"
        # Uma operação científica com Dados aberto força o ciclo global de atualização;
        # a leitura em curso não deve ser perdida.
        page.evaluate("document.querySelector('#silm-add').click()")
        page.wait_for_function("window.SILMIntegration.snapshot().structure.units.length === 2")
        assert details.first.evaluate("(el) => el.open"), f"{name}: atualização fechou detalhes dos Dados"
        assert page.locator("#silm-unit-inventory .silm-unit-inventory button").count() == 2, f"{name}: inventário desatualizado"
        assert "2 unidades" in page.locator("#silm-unit-count").inner_text(), f"{name}: contagem obsoleta"
        page.locator("#silm-data-back").click()
        assert not page.locator("#silm-data-catalog").is_hidden(), f"{name}: retorno ao catálogo falhou"
        if name == "mobile":
            page.locator('[data-close-dock="right"]').click()
            page.locator('[data-open-dock="montagem"]').click()
            page.locator('[data-left-tab="objetos"]').click()
            assert page.locator("#si-dock-left").is_visible(), "bottom sheet de Montagem invisível"
            assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 5"), "rolagem horizontal no celular"
        page.screenshot(path=str(out / f"{args.browser}-{name}.png"), animations="disabled")
        assert not errors, f"{name}: erros JavaScript: {errors}"
        print(f"OK: {args.browser} {name}, inventário 1→2, Dados/Fontes preservados, navegação e erros JS")
        context.close()
    browser.close()
