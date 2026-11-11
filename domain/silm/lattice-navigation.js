'use strict';
window.SILM = window.SILM || {};

// Navega nos sítios do recorte desenhado, usando as coordenadas e vizinhanças do motor.
SILM.createLatticeCursor = function (geometry, initialKey, initialAnchor) {
  const origin = geometry.cell[0], limit = 2;
  const references = new Map(geometry.cell.map(site => [site.key,site]));
  const lattice = geometry.lattice();
  function lookup(key) {
    const match = /^(-?\d+),(-?\d+),(-?\d+)\|(\d+)$/.exec(key || '');
    if (!match) return null;
    const cell = match.slice(1,4).map(Number), basis = Number(match[4]);
    if (basis >= geometry.model.basis.length || cell.some(n=>Math.abs(n)>limit+3)) return null;
    return geometry.site({cell,basis});
  }
  let current=origin,anchor=origin,shell,offset=[0,0,0],displacement=[0,0,0],context=null;
  function position(site, reference) {
    current = site;
    anchor = reference;
    const next = site.cell.map((n, i) => n - reference.cell[i]);
    if(next.some((n,i)=>n!==offset[i]))context=null;
    offset=next;
    displacement = [0, 1, 2].map(i => geometry.vectors.reduce((sum, vector, j) => sum + offset[j] * vector[i], 0));
    shell = null;
  }
  function displaySite(site) {
    return geometry.site({basis: site.basis, cell: site.cell.map((n, i) => n + offset[i])});
  }
  function referenceFor(target,reference) {
    if(!target)return null;
    const local=references.get(SILM.crystal.key({basis:target.basis,cell:target.cell.map((n,i)=>n-offset[i])}));
    const base=reference || local || (anchor.basis===target.basis?anchor:geometry.cell.find(site=>site.basis===target.basis));
    return base&&target.basis===base.basis&&target.cell.every((n,i)=>Math.abs(n-base.cell[i])<=limit)?geometry.site(base):null;
  }
  const saved=lookup(initialKey),base=referenceFor(saved,initialAnchor);
  if(base)position(saved,base);
  return {
    get site() { return current; },
    get anchor() { return anchor; },
    get contextSites() {
      if(context)return context;
      // A malha de fundo inclui as células adjacentes, mesmo nas bases cristalinas complexas.
      const sites=new Map(lattice.map(site=>[site.key,site]));
      for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++)for(let k=-1;k<=1;k++){
        const cell=[offset[0]+i,offset[1]+j,offset[2]+k];
        for(let basis=0;basis<geometry.model.basis.length;basis++){
          const site=geometry.site({cell,basis});
          sites.set(site.key,site);
        }
      }
      return context=[...sites.values()];
    },
    get offset() { return [...offset]; },
    displaySite,
    displayCart(cart) { return cart.map((v, i) => v + displacement[i]); },
    get shell() { return shell || (shell = geometry.neighbors(current)); },
    has(key) { return !!referenceFor(lookup(key)); },
    translate(axis, step) {
      if (![0, 1, 2].includes(axis) || ![-1, 1].includes(step)) return null;
      const cell = [...current.cell];
      cell[axis] += step;
      return Math.abs(offset[axis]+step)<=limit ? geometry.site({cell,basis:current.basis}) : null;
    },
    select(key, reference) {
      // Um centro de borda pode pertencer a mais de uma célula. O clique preserva a célula exibida.
      const target = lookup(key);
      const base = referenceFor(target,reference);
      if (!base) return false;
      position(target, geometry.site(base));
      return true;
    }
  };
};

SILM.createLatticePanel = function ({geometry, initialKey, initialAnchor, onFocus, scope, mode='network'}) {
  const cursor = SILM.createLatticeCursor(geometry, initialKey, initialAnchor);
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
  const more=element('details');more.className='silm-lattice-more';
  const summary=element('summary',mode==='center'?'Escolher centro':'Navegação por eixos');
  const controls=element('div');controls.className='silm-lattice-more-controls';
  more.append(summary,controls);
  function button(label, title, action) {
    const node = element('button', label);
    node.type = 'button';
    node.setAttribute('aria-label', title);
    node.title = title;
    scope.listen(node, 'click', action);
    controls.append(node);
    return node;
  }
  const moves = [];
  function visit(site, reference) {
    if (!site || !cursor.select(site.key, reference)) return;
    refresh();
    onFocus(cursor.site, cursor.anchor);
  }
  if(mode!=='center')for (const [axis, letter] of ['a','b','c'].entries()) {
    for (const step of [-1,1]) {
      const title = (step > 0 ? 'Avançar' : 'Recuar') + ' uma célula no eixo ' + letter;
      moves.push({axis,step,node:button((step > 0 ? '+' : '−') + letter, title, () => visit(cursor.translate(axis,step),cursor.anchor))});
    }
  }
  if(mode==='center')controls.append(select);else root.append(select);
  scope.listen(select, 'change', () => {
   const site=cursor.shell.list.find(site => site.key === select.value);
   if(site)visit(site);
  });
  button('Origem', 'Voltar ao centro inicial da rede', () => visit(geometry.cell[0], geometry.cell[0]));
  root.append(more);
  function refresh() {
    const site = cursor.site, shell = cursor.shell;
    position.textContent = 'Célula [' + cursor.offset.join(', ') + '] · sítio ' + (site.basis + 1);
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
