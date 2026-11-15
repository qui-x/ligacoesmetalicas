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
        montagem.click()
        page.locator("#silm-start").click()
        page.wait_for_function("window.SILMIntegration.snapshot().metal !== null")
        page.locator("#silm-add").click()
        page.wait_for_function("window.SILMIntegration.snapshot().structure.units.length === 1")
        page.locator('[data-left-tab="objetos"]').click()
        page.locator("#silm-unit-inventory .silm-unit-inventory button").first.wait_for()
        assert page.locator("#silm-unit-inventory .silm-unit-inventory button").count() == 1, f"{name}: inventário inicial"
        assert "1 unidade" in page.locator("#silm-unit-count").inner_text(), f"{name}: contagem inicial"
        if name == "desktop":
            assert page.locator("#silm-unit-inventory button").first.get_attribute("aria-label").startswith("Localizar unidade"), "inventário sem navegação"
        page.locator('[data-close-dock="left"]').click()
        dados = page.locator('[data-open-dock="dados"]')
        dados.click()
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
