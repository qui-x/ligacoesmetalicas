'use strict';
window.SILM = window.SILM || {};

// Navega nos sítios do recorte desenhado, usando as coordenadas e vizinhanças do motor.
SILM.createLatticeCursor = function (geometry, initialKey) {
  const sites = new Map([...geometry.lattice(), ...geometry.cell].map(site => [site.key, site]));
  let current = sites.get(initialKey) || geometry.cell[0];
  let shell = null;
  return {
    get site() { return current; },
    get shell() { return shell || (shell = geometry.neighbors(current)); },
    has(key) { return sites.has(key); },
    translate(axis, step) {
      if (![0, 1, 2].includes(axis) || ![-1, 1].includes(step)) return null;
      const cell = [...current.cell];
      cell[axis] += step;
      return sites.get(SILM.crystal.key({cell, basis: current.basis})) || null;
    },
    select(key) {
      if (!sites.has(key)) return false;
      current = sites.get(key);
      shell = null;
      return true;
    }
  };
};

SILM.createLatticePanel = function ({geometry, initialKey, onFocus, scope}) {
  const cursor = SILM.createLatticeCursor(geometry, initialKey);
  function element(tag, text) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    return node;
  }
  const root = element('div');
  root.className = 'silm-lattice-nav';
  root.setAttribute('role', 'group');
  root.setAttribute('aria-label', 'Navegar na rede cristalina');
  root.hidden = true;
  const status = element('p');
  status.className = 'silm-lattice-status';
  status.hidden = true;
  const position = element('output');
  position.setAttribute('aria-live', 'polite');
  const select = element('select');
  select.setAttribute('aria-label', 'Ir a um vizinho');
  select.className = 'silm-lattice-neighbors';
  const reading = element('span');
  status.append(position, reading);
  root.append(element('strong', 'Rede'));
  function button(label, title, action) {
    const node = element('button', label);
    node.type = 'button';
    node.setAttribute('aria-label', title);
    node.title = title;
    scope.listen(node, 'click', action);
    root.append(node);
    return node;
  }
  const moves = [];
  function visit(site) {
    if (!site || !cursor.select(site.key)) return;
    refresh();
    onFocus(cursor.site);
  }
  for (const [axis, letter] of ['a','b','c'].entries()) {
    for (const step of [-1,1]) {
      const title = (step > 0 ? 'Avançar' : 'Recuar') + ' uma célula no eixo ' + letter;
      moves.push({axis,step,node:button((step > 0 ? '+' : '−') + letter, title, () => visit(cursor.translate(axis,step)))});
    }
  }
  root.append(select);
  scope.listen(select, 'change', () => visit(cursor.shell.list.find(site => site.key === select.value)));
  button('Origem', 'Voltar ao centro inicial da rede', () => visit(geometry.cell[0]));
  function refresh() {
    const site = cursor.site, shell = cursor.shell;
    position.textContent = 'Célula [' + site.cell.join(', ') + '] · sítio ' + (site.basis + 1);
    const placeholder = element('option','Vizinhos (' + shell.list.length + ')');
    placeholder.value = '';
    select.replaceChildren(placeholder);
    shell.list.forEach((neighbor, i) => {
      const option = element('option',(i + 1) + ' · ' + shell.distances[i].toLocaleString('pt-BR',{maximumFractionDigits:3}) + ' Å · [' + neighbor.cell.join(', ') + ']');
      option.value = neighbor.key;
      option.disabled = !cursor.has(neighbor.key);
      if (option.disabled) option.textContent += ' · fora do recorte';
      select.append(option);
    });
    moves.forEach(({axis,step,node}) => { node.disabled = !cursor.translate(axis,step); });
  }
  refresh();
  return {root, status, cursor, visit, reading};
};
