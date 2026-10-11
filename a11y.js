/* Motor de preferências preservado da baseline 0.1.0; adaptações documentadas. */


(function () {
  'use strict';

  var CHAVE = 'simcore_a11y_v1';

  var PREFIXO_RAIZ = (function () {
    try {
      var scriptAtual = document.currentScript;
      var src = scriptAtual && scriptAtual.getAttribute('src');
      if (!src) return '';
      return src.replace(/a11y\.js(\?.*)?$/, '');
    } catch (e) {
      return '';
    }
  })();

  var PARAMS = ['theme', 'reading', 'colorblind', 'contrast', 'fontscale', 'spacing', 'motion'];

  var DALTONISMOS = ['protanopia', 'deuteranopia', 'tritanopia', 'acromatopsia'];

  var estado = {
    theme:      'dark',
    reading:    'off',
    colorblind: 'none',
    contrast:   false,
    fontScale:  1,
    spacing:    false,
    motion:     false
  };

  function paraBooleano(valor) {
    return valor === true || valor === 'true' || valor === 'on' || valor === '1';
  }

  function higienizar(bruto) {
    return {
      theme:      bruto.theme === 'light' ? 'light' : 'dark',
      reading:    paraBooleano(bruto.reading) ? 'on' : 'off',
      colorblind: DALTONISMOS.indexOf(bruto.colorblind) !== -1 ? bruto.colorblind : 'none',
      contrast:   paraBooleano(bruto.contrast),
      spacing:    paraBooleano(bruto.spacing),
      motion:     paraBooleano(bruto.motion),
      fontScale:  limitarFonte(bruto.fontScale !== undefined ? bruto.fontScale : bruto.fontscale)
    };
  }

  function limitarFonte(valor) {
    var n = parseFloat(valor);
    if (isNaN(n)) return 1;
    return Math.min(2, Math.max(0.75, Math.round(n * 100) / 100));
  }

  function lerMemoria() {
    try {
      var cru = localStorage.getItem(CHAVE);
      return cru ? JSON.parse(cru) : null;
    } catch (e) {

      console.warn('Preferências inválidas ou indisponíveis; usando padrões.', e);
      return null;
    }
  }

  function gravarMemoria() {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(estado));
    } catch (e) {  }
  }

  function lerURL() {
    var busca = window.location.search;
    if (!busca || busca.length < 2) return null;

    var encontrados = {};
    var achouAlgum = false;

    busca.replace(/^\?/, '').split('&').forEach(function (par) {
      if (!par) return;
      var corte = par.indexOf('=');
      var chave = corte === -1 ? par : par.slice(0, corte);
      var valor = corte === -1 ? '' : par.slice(corte + 1);
      try { valor = decodeURIComponent(valor.replace(/\+/g, ' ')); } catch (e) {  }
      if (PARAMS.indexOf(chave) !== -1) {
        encontrados[chave] = valor;
        achouAlgum = true;
      }
    });

    return achouAlgum ? encontrados : null;
  }

  var daURL = lerURL();
  var daMemoria = lerMemoria();
  var precisaRecarimbarURL = false;

  if (daURL) {
    estado = higienizar(daURL);
  } else if (daMemoria) {
    estado = higienizar(daMemoria);
    precisaRecarimbarURL = true;   // <- este é o caso do botão "voltar"
  }

  gravarMemoria();

  function queryString() {
    return '?theme=' + encodeURIComponent(estado.theme) +
           '&reading=' + encodeURIComponent(estado.reading) +
           '&colorblind=' + encodeURIComponent(estado.colorblind) +
           '&contrast=' + encodeURIComponent(estado.contrast) +
           '&fontscale=' + encodeURIComponent(estado.fontScale) +
           '&spacing=' + encodeURIComponent(estado.spacing) +
           '&motion=' + encodeURIComponent(estado.motion);
  }

  if (precisaRecarimbarURL) {
    try {
      var combined = new URLSearchParams(window.location.search);
      new URLSearchParams(queryString()).forEach(function(value, key) { combined.set(key, value); });
      history.replaceState(null, '', window.location.pathname + '?' + combined.toString() + window.location.hash);
    } catch (e) {  }
  }

  var html = document.documentElement;

  function aplicarNoHtml() {

    html.setAttribute('data-theme',      estado.theme);
    html.setAttribute('data-contrast',   estado.contrast ? 'on' : 'off');
    html.setAttribute('data-reading',    estado.reading);
    html.setAttribute('data-spacing',    estado.spacing ? 'on' : 'off');
    html.setAttribute('data-motion',     estado.motion ? 'on' : 'off');
    html.setAttribute('data-colorblind', estado.colorblind);

    html.style.setProperty('--font-scale', estado.fontScale);
    html.style.setProperty('--a11y-font-scale', estado.fontScale);

    html.style.colorScheme = estado.theme === 'light' ? 'light' : 'dark';

    atualizarFavicon(estado.theme);
  }

  function atualizarFavicon(tema) {
    var link = document.querySelector('link[rel="icon"][type="image/svg+xml"]');
    if (link && (link.getAttribute('href') || '').startsWith('data:')) return;
    if (!link || link.dataset.domainIcon) return;
    var arquivo = tema === 'light' ? 'favicon-light.svg' : 'favicon-dark.svg';
    link.setAttribute('href', PREFIXO_RAIZ + arquivo);
  }

  function aplicarNoBody() {
    var body = document.body;
    if (!body) return;

    alternar(body, 'light-mode',    estado.theme === 'light');
    alternar(body, 'high-contrast', estado.contrast);
    alternar(body, 'simple-read',   estado.reading === 'on');
    alternar(body, 'wide-spacing',  estado.spacing);
    alternar(body, 'reduce-motion', estado.motion);
  }

  function alternar(elemento, classe, ligado) {
    if (ligado) elemento.classList.add(classe);
    else elemento.classList.remove(classe);
  }

  function aplicarDaltonismo() {
    var camada = document.getElementById('colorblindOverlay');
    if (!camada) return;
    var filtro = estado.colorblind === 'none' ? 'none' : 'url(#f-' + estado.colorblind + ')';
    camada.style.backdropFilter = filtro;
    camada.style.webkitBackdropFilter = filtro;
  }

  aplicarNoHtml();

  function carimbarLinks() {
    var links = document.querySelectorAll('a[href]');
    var query = queryString();

    Array.prototype.forEach.call(links, function (link) {
      var href = link.getAttribute('href');
      if (!href) return;

      if (href.charAt(0) === '#') return;
      if (/^(https?:)?\/\//i.test(href)) return;
      if (/^(mailto|tel|javascript|data):/i.test(href)) return;

      var ancora = '';
      var semAncora = href;
      var corteAncora = href.indexOf('#');
      if (corteAncora !== -1) {
        ancora = href.slice(corteAncora);
        semAncora = href.slice(0, corteAncora);
      }
      var caminho = semAncora.split('?')[0];

      if (!/\.html$/i.test(caminho)) return;

      link.setAttribute('href', caminho + query + ancora);
    });

  }

  function aoCarregar() {
    aplicarNoBody();
    aplicarDaltonismo();
    carimbarLinks();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', aoCarregar);
  } else {
    aoCarregar();
  }

  window.addEventListener('pageshow', function (evento) {
    if (evento.persisted) {
      var salvo = lerMemoria();
      if (salvo) estado = higienizar(salvo);
      if (window.A11Y) window.A11Y.estado = estado;
      if (window.A11Y) window.A11Y.estado = estado;
      aplicarNoHtml();
      aplicarNoBody();
      aplicarDaltonismo();
    }
  });

  window.A11Y = {
    estado: estado,

    definir: function (chave, valor) {
      var novo = {};
      PARAMS.concat(['fontScale']).forEach(function (k) { novo[k] = estado[k]; });
      novo[chave] = valor;
      estado = higienizar(novo);
      window.A11Y.estado = estado;
      gravarMemoria();
      aplicarNoHtml();
      aplicarNoBody();
      aplicarDaltonismo();
      carimbarLinks();
    },

    link: function (arquivo) {
      if (!arquivo || !/\.html$/i.test(arquivo)) return '#';
      return arquivo.split('?')[0] + queryString();
    },

    atualizarFavicon: atualizarFavicon,

    query: queryString,
    recarimbar: carimbarLinks
  };

})();
