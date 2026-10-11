'use strict';
window.SILM = window.SILM || {};
SILM.create = () => {
  const U = SimCore.ExperienceUI, model = SILM.createScientificState(), X = SILM.crystal;
  let ctx = null, host = null, stopOpening = null;
  const icon = 'assets/silm-icone.svg', VERSION = '0.5.0';
  const modules = [
    {id:'explorar',title:'Explorar',description:'Monte a estrutura metálica e observe sua organização cristalina: célula, rede e vizinhança.',icon:'grid'},
    {id:'medir',title:'Medir',description:'Consulte medidas da representação. Os instrumentos de medição ainda não estão disponíveis.',icon:'lab'},
    {id:'calcular',title:'Calcular',description:'Investigue relações quantitativas. As fórmulas e os cálculos serão incorporados após validação.',icon:'report'}
  ];
  const C=SILM.assembly.contract;
  const crystalline=()=>model.state.structure?.mode==='crystalline';
  const moduleMessage=id=>({explorar:crystalline()?'Observe a estrutura cristalina: célula, rede e vizinhança.':model.state.structure?'Adicione, selecione e mova unidades; depois, organize a estrutura.':model.state.metal?'A estrutura ainda não foi montada. Use Iniciar montagem.':'A estrutura ainda não foi montada.',medir:'As ferramentas de medição ainda não estão disponíveis nesta versão.',calcular:'Os cálculos ainda não estão disponíveis nesta versão.'})[id];
  const moduleName = () => ctx?.modules.get(model.state.module.active)?.title || 'Explorar';
  const D=SILM.data,tableState={query:'',selection:null};
  let viewScope=null,showTable=true,presentation=null,restoringModule=false,view=null,viewKey=null,pendingAnimation=null;
  const watchers=new Set(),watch=(scope,fn)=>{watchers.add(fn);scope.cleanup(()=>watchers.delete(fn));};
  const editable=()=>model.state.module.active==='explorar';
  const selected=()=>D.get(model.state.metal?.atomicNumber);
  const lower=text=>String(text||'').toLocaleLowerCase('pt-BR');
  const unitName=()=>'unidade de '+lower(selected()?.name);
  const crystalOf=e=>X.eligibility(e);
  const referenceName=e=>{const ref=D.structure(e);return ['CFC','CCC','HC'].includes(ref.type)?ref.type:'de referência ('+ref.label+')';};
  const canInvestigate=()=>!ctx.experience.restricted;
  const canTeacherInvestigate=()=>!ctx.activity.current||ctx.activity.current.type==='free';
  const reducedMotion=()=>!!(ctx?.accessibility.reducedMotion||document.documentElement.dataset.motion==='on'||matchMedia('(prefers-reduced-motion: reduce)').matches);
  const tag=(text,cls='silm-kind-tag')=>U.element('span',text,cls);
  /* ---------- Histórico da investigação (paridade SIAB: sequência cronológica, não é Caderno nem relatório) ---------- */
  const HISTORY_LIMIT=300;
  function historyRecord(){const id=model.state.investigation?.id,saved=ctx.storage.get('investigation.history',null);return saved&&saved.investigationId===id&&Array.isArray(saved.entries)?saved:{investigationId:id,entries:[]};}
  function logEvent(text){if(!ctx||!model.state.investigation)return;const record=historyRecord();record.entries.push({at:new Date().toISOString(),text:String(text).slice(0,300)});if(record.entries.length>HISTORY_LIMIT)record.entries.splice(0,record.entries.length-HISTORY_LIMIT);ctx.storage.set('investigation.history',record);for(const fn of [...watchers])fn();}
  function renderSources(e,target){
    target.append(U.element('h2','Referências · '+e.name));
    const fields=U.element('ul',null,'silm-reference-fields');
    const reference=D.structure(e);
    for(const [name,id]of [['Identidade periódica',e.identityProvenance.atomicNumber.sourceId],['Peso atômico / número de massa',e.atomicWeight.sourceId],['Configuração eletrônica',e.electronConfiguration?.sourceId],['Convenção de valência',e.valenceModel?.sourceId],['Estrutura e parâmetros',reference?.sourceId],['Condição de temperatura',reference?.conditions.temperature.sourceId],['Condição de pressão',reference?.conditions.pressure.sourceId]])if(id){const r=D.source(id);fields.append(U.element('li',name+' → '+r.title));}
    target.append(fields);ctx.references.render(target,{ids:D.sourceIds(e)});
  }
  function openSources(e){const body=U.element('div');renderSources(e,body);return ctx.modal.open({title:'Fontes dos dados · '+e.name,content:body,size:'wide'});}
  function confirmDestructive(title,description,label){const handle=ctx.modal.open({title,content:description,actions:[{id:'cancel',label:'Cancelar'},{id:'confirm',label,intent:'danger'}]});return handle?.result.then(answer=>answer==='confirm')||Promise.resolve(false);}
  async function investigate(e){
    if(!canInvestigate()||e.silmEligibility.status!=='available')return false;
    const units=model.state.structure?.units.length||0,assembly=model.state.structure?' A '+(crystalline()?'estrutura cristalina atual':'montagem atual')+(units?' com '+units+' '+(units===1?'unidade':'unidades'):'')+' será removida; as unidades não são convertidas para o novo metal.':'';
    if(model.state.investigation&&!await U.confirm(ctx,'Iniciar uma nova investigação?','A investigação atual será encerrada. Seus dados científicos serão substituídos; os textos de relatório permanecem salvos.'+assembly,'Iniciar nova investigação'))return false;
    if(!model.begin(e.atomicNumber,ctx.activity.current?.type||'free'))return false;
    logEvent('Investigação iniciada com '+e.name+' ('+e.symbol+').');
    showTable=false;tableState.selection=e.atomicNumber;await ctx.activity.touch();contextChanged();await ctx.screens.navigate('laboratorio');
    ctx.viewport.host.scrollTop=0;host?.querySelector('h1')?.focus();SimCore.notifications.announce('Investigação iniciada com '+e.name+'.');return true;
  }
  async function resetInvestigation(){if(!model.state.investigation)return false;
    if(!await confirmDestructive('Resetar investigação?','O metal e a identidade da investigação serão mantidos. A estrutura, as observações e os dados construídos serão limpos.','Resetar investigação'))return false;
    model.resetInvestigation();logEvent('Investigação resetada; metal mantido.');await ctx.activity.touch();contextChanged();ctx.notify('Investigação resetada. Metal e preferências preservados.',{type:'info'});SimCore.notifications.announce('Investigação resetada.');return true;
  }
  async function closeInvestigation(){if(!model.state.investigation)return false;
    if(!await confirmDestructive('Encerrar investigação?','O metal e a estrutura serão removidos e o Laboratório voltará à seleção. Os textos de relatório permanecem salvos.','Encerrar investigação'))return false;
    model.close();ctx.storage.remove('investigation.history');showTable=true;tableState.selection=null;tableState.query='';await ctx.activity.touch();contextChanged();ctx.viewport.host.scrollTop=0;ctx.notify('Investigação encerrada.',{type:'info'});SimCore.notifications.announce('Investigação encerrada. Selecione um metal.');return true;
  }
  /* ---------- Montagem livre (0.4.x) ---------- */
  function structureChanged(){view?.update();for(const fn of [...watchers])fn();}
  function say(text){if(view)view.say(text);else SimCore.notifications.announce(text);}
  async function startAssembly(){if(!model.beginAssembly())return false;logEvent('Montagem iniciada.');await ctx.activity.touch();contextChanged();view?.focusAdd?.();say('Montagem iniciada. Use Adicionar unidade para inserir unidades de '+lower(selected().name)+'.');return true;}
  function addUnit(){if(!editable())return {ok:false,reason:'MODULE'};const r=model.addUnit();
    if(!r.ok){say(r.reason==='UNITS_LIMIT'?'Limite de '+C.maxUnits+' unidades desta cena atingido.':r.reason==='CRYSTALLINE_MODE'?'Volte à montagem livre para adicionar unidades.':'Não há espaço livre na cena. Reorganize as unidades.');return r;}
    structureChanged();view?.select?.(r.unit.id,{announce:false});const n=model.state.structure.units.length;logEvent('Unidade '+n+' adicionada.');say(unitName().replace(/^u/,'U')+' '+n+' adicionada e selecionada. Toque no destino para posicioná-la.');return r;}
  /* Como no SIAB: cada ação desfazível tem descrição; o botão mostra “Desfazer: …” e o anúncio “Desfeito: …”. */
  function describeLast(){const last=model.lastAction;if(!last)return null;const k=(model.state.structure?.units.findIndex(u=>u.id===last.unitId)??-1)+1;return (last.type==='add'?'adição da unidade ':'movimento da unidade ')+k;}
  function undoAction(){if(!editable())return {ok:false,reason:'MODULE'};const description=describeLast(),r=model.undo();if(!r.ok){say('Nada para desfazer.');return r;}structureChanged();logEvent('Desfeito: '+description+'.');say('Desfeito: '+description+'.');return r;}
  function moveUnit(id,position,options){if(!editable())return {ok:false,reason:'MODULE'};const r=model.moveUnit(id,position,options);if(r.ok&&!r.unchanged){structureChanged();const k=model.state.structure.units.findIndex(u=>u.id===id)+1;logEvent('Unidade '+k+(r.adjusted?' movida com ajuste de posicionamento assistido.':' movida.'));}return r;}
  async function clearStructure(){const s=model.state.structure;if(!s)return false;
    if(s.units.length&&!await confirmDestructive('Remover estrutura atual?','O metal selecionado será mantido. '+s.units.length+' '+(s.units.length===1?'unidade será removida':'unidades serão removidas')+'; esta ação não pode ser desfeita.','Limpar estrutura'))return false;
    model.clearStructure();logEvent('Estrutura removida; metal mantido.');await ctx.activity.touch();contextChanged();host?.querySelector('h1')?.focus();ctx.notify('Estrutura removida. '+selected().name+' continua selecionado.',{type:'info'});return true;}
  function setAssistance(enabled){if(!model.setAssistance(enabled))return;structureChanged();logEvent('Posicionamento assistido '+(enabled?'ativado.':'desativado.'));say(enabled?'Posicionamento assistido ativado.':'Posicionamento assistido desativado. Destinos ocupados serão recusados.');}
  function toggleAssembled(){const s=model.state.structure;if(!s)return;const next=s.status==='assembled'?'assembling':'assembled';if(!model.setAssemblyStatus(next))return;structureChanged();logEvent(next==='assembled'?'Montagem marcada como concluída.':'Montagem retomada.');say(next==='assembled'?'Montagem marcada como concluída. Ela continua editável.':'Montagem retomada.');}
  function explore(){return ctx.modules.select('explorar');}
  /* ---------- Cristalografia (0.5.x) ---------- */
  function organizeState(){
    const e=selected(),el=crystalOf(e),s=model.state.structure;
    if(el.status!=='available')return {disabled:true,reason:el.message+' ('+(el.registeredLabel||D.structure(e)?.label||'sem registro')+'.)'};
    if(!s?.units.length)return {disabled:true,reason:'',title:'Adicione ao menos uma unidade para organizar a estrutura.'};
    return {disabled:!editable(),reason:'',title:'Organizar segundo a estrutura '+X.models[el.structureType].code+' de referência'};
  }
  async function organizeStructure(){
    const e=selected(),el=crystalOf(e),s=model.state.structure;if(!s||crystalline()||!editable())return false;
    if(el.status!=='available'){say(el.message);return false;}
    if(!s.units.length){say('Adicione ao menos uma unidade para organizar a estrutura.');return false;}
    const m=X.models[el.structureType],ref=el.reference,n=s.units.length,complete=Math.max(0,m.cellSites-n);
    const body=U.element('div');body.append(U.element('p','As unidades serão organizadas segundo a estrutura cristalina de referência deste metal.'),U.element('p',e.name+': '+m.code+' ('+m.international+') · '+m.name+'. Condição de referência: '+ref.conditions.temperature.display+'; '+lower(ref.conditions.pressure.display)+'.'),U.element('p','Suas '+n+' '+(n===1?'unidade será reposicionada':'unidades serão reposicionadas')+(complete?'; o SILM completará '+complete+' '+(complete===1?'unidade':'unidades')+' para representar a célula unitária ('+m.cellSites+' posições).':'.')),U.element('p','A montagem livre fica guardada e pode ser restaurada com Voltar à montagem livre. Esta é uma reorganização didática, não uma simulação de cristalização.'));
    const handle=ctx.modal.open({title:'Organizar estrutura?',content:body,actions:[{id:'cancel',label:'Cancelar'},{id:'organize',label:'Organizar estrutura',primary:true}]});
    if((await handle?.result)!=='organize')return false;
    const from=Object.fromEntries(model.state.structure.units.map(u=>[u.id,u.position]));
    const r=model.organize();if(!r.ok){say('Não foi possível organizar a estrutura.');return false;}
    pendingAnimation=from;logEvent('Estrutura organizada como '+m.code+' ('+m.international+'): '+r.reused+' unidades reaproveitadas'+(r.added?', '+r.added+' completadas pelo SILM.':'.'));
    await ctx.activity.touch();contextChanged();view?.title?.focus();
    say('Estrutura organizada: '+m.code+', '+m.name+'. '+(r.added?r.added+' unidades completadas pelo SILM. ':'')+'Célula unitária visível.');return true;
  }
  async function restoreFree(){if(!crystalline()||!editable())return false;if(!model.restoreFree())return false;logEvent('Retorno à montagem livre; posições anteriores restauradas.');await ctx.activity.touch();contextChanged();view?.title?.focus();say('Montagem livre restaurada com as posições anteriores. O metal e a investigação continuam.');return true;}
  function geometry(){return X.geometry(selected());}
  function unitInfo(id){const s=model.state.structure,i=s.units.findIndex(u=>u.id===id);if(i<0)return null;const info=geometry().role(s.units[i].site);return {index:i+1,label:info.label};}
  function represent(patch,{announce=true}={}){
    if(!crystalline())return false;const before=model.state.structure.crystallography.representation;
    if(!model.setCrystalRepresentation(patch))return false;structureChanged();if(!announce)return true;
    const r=model.state.structure.crystallography.representation;
    if('view' in patch&&patch.view!==before.view){logEvent('Vista: '+(r.view==='lattice'?'rede extensa.':'célula unitária.'));say(r.view==='lattice'?'Vista da rede extensa: a estrutura se repete além da célula.':'Vista da célula unitária.');}
    if('unitCell' in patch&&patch.unitCell!==before.unitCell)say('Célula unitária '+(r.unitCell?'visível.':'oculta. A estrutura cristalina não muda.'));
    if('labels' in patch&&patch.labels!==before.labels)say('Rótulos das posições '+(r.labels?'visíveis.':'ocultos.'));
    if('neighbors' in patch||'selectedUnitId' in patch)announceNeighbors();
    return true;
  }
  function announceNeighbors(){
    const r=model.state.structure.crystallography.representation;if(!r.neighbors||!r.selectedUnitId)return;
    const s=model.state.structure,u=s.units.find(x=>x.id===r.selectedUnitId),n=geometry().neighbors(u.site),info=unitInfo(u.id);
    say(n.list.length+' vizinhos imediatos destacados da unidade '+info.index+' ('+info.label+'). Coordenação do modelo: '+s.crystallography.coordination+'.');
  }
  function selectCrystal(id){
    if(!represent({selectedUnitId:id},{announce:false}))return;
    if(!id){say('Seleção removida.');return;}
    const info=unitInfo(id),r=model.state.structure.crystallography.representation;
    if(r.neighbors)announceNeighbors();else say('Unidade '+info.index+' selecionada: '+info.label+'.');
  }
  function toggleNeighbors(){
    const r=model.state.structure?.crystallography?.representation;if(!r)return;
    if(!r.neighbors&&!r.selectedUnitId){const g=geometry(),central=model.state.structure.units.find(u=>X.key(u.site)===g.cell[0].key)||model.state.structure.units[0];represent({neighbors:true,selectedUnitId:central.id});}
    else represent({neighbors:!r.neighbors});
    if(model.state.structure.crystallography.representation.neighbors)logEvent('Vizinhos imediatos destacados.');else say('Destaque de vizinhos desligado.');
  }
  function openTable(){showTable=true;ctx.panels.close('left');ctx.panels.close('right');draw();ctx.viewport.host.scrollTop=0;host?.querySelector('.periodic-heading h1')?.focus();}
  function draw(){
    if(!ctx||!host)return;
    const table=(showTable||!selected())&&!ctx.experience.restricted,structure=model.state.structure;
    const key=!table&&selected()&&structure?'assembly:'+model.state.investigation.id+':'+model.state.module.active+':'+structure.mode:null;
    if(key&&key===viewKey&&view){view.update();return;}
    view=null;viewKey=key;viewScope?.destroy();viewScope=SimCore.createScope();host.replaceChildren();
    if(table){SILM.createPeriodicTable(host,{scope:viewScope,state:tableState,onInvestigate:investigate,onSources:openSources,canInvestigate});return;}
    const e=selected();
    if(key&&structure.mode==='crystalline'){const animateFrom=pendingAnimation;pendingAnimation=null;view=SILM.createCrystalView(host,{scope:viewScope,model,element:e,geometry:geometry(),moduleTitle:moduleName(),note:editable()?'':moduleMessage(model.state.module.active),animateFrom,reducedMotion,actions:{represent,select:selectCrystal,toggleNeighbors}});return;}
    if(key){view=SILM.createAssemblyView(host,{scope:viewScope,model,element:e,editable:editable(),note:moduleMessage(model.state.module.active),reference:referenceName(e),moduleTitle:moduleName(),describeLast,actions:{add:addUnit,undo:undoAction,move:moveUnit},canExplore:()=>ctx.modules.available('explorar'),onExplore:explore,organize:{run:organizeStructure,state:organizeState}});return;}
    const card=U.element('section',null,'silm-metal-card');
    card.append(U.element('p','LABORATÓRIO · '+moduleName().toUpperCase(),'eyebrow'));
    if(e)card.append(U.element('div',e.symbol,'metal-symbol'));
    const h=U.element('h1',e?e.name:'Atividade de interface');h.tabIndex=-1;card.append(h);
    if(e){const ref=D.structure(e),investigation=model.state.investigation,el=crystalOf(e);card.append(U.element('p','Metal da investigação: '+e.name+', '+e.symbol+', número atômico '+e.atomicNumber+'.'),U.element('p','Investigação '+(investigation?.status==='paused'?'pausada':'ativa'),'silm-investigation-status'),U.element('p','A estrutura metálica ainda não foi montada.'),U.element('p','Estrutura de referência: '+ref.label+' · '+ref.conditions.temperature.display+' · dado tabelado.'));
      const crystalNote=U.element('p',el.status==='available'?'Cristalografia disponível: depois de montar, use Organizar estrutura para ver a '+X.models[el.structureType].code+'.':'Cristalografia indisponível: '+el.message,'silm-crystal-availability');crystalNote.id='silm-card-crystal';card.append(crystalNote);
      if(!editable())card.append(U.element('p',moduleMessage(model.state.module.active)));
      const actions=U.element('div',null,'action-row');
      if(editable())actions.append(U.button('Iniciar montagem',startAssembly,viewScope,{id:'silm-start-assembly',primary:true}));else if(ctx.modules.available('explorar'))actions.append(U.button('Montar em Explorar',explore,viewScope,{id:'silm-card-explore',primary:true}));
      if(canInvestigate())actions.append(U.button('Selecionar outro metal',openTable,viewScope,{id:'silm-select-other'}),U.button('Resetar investigação',resetInvestigation,viewScope,{id:'silm-reset'}),U.button('Encerrar investigação',closeInvestigation,viewScope,{id:'silm-close'}));actions.append(U.button('Dados do metal',()=>ctx.panels.open('right','dados'),viewScope,{id:'silm-info'}),U.button('Fontes',()=>openSources(e),viewScope,{id:'silm-sources'}));card.append(actions);
    }else card.append(U.element('p','Esta atividade preserva o percurso de interface definido pelo professor.'));
    if(ctx.experience.restricted)card.append(U.button('Ajuda da atividade',()=>ctx.experience.details(),viewScope));host.append(card);
  }
  function contextChanged(){ctx.setContext({module:model.state.module.active,restricted:ctx.experience.restricted,metal:model.state.metal?.atomicNumber||null,mode:model.state.structure?.mode||null});draw();}
  /* ---------- Painel Montagem (paridade SIAB: Resumo, Metal, Estrutura, Módulo) ---------- */
  function structureLine(){const s=model.state.structure;if(!s)return 'Não montada';if(s.mode==='crystalline'){const m=X.models[s.crystallography.structureType];return m.code+' organizada · '+s.units.length+' unidades';}return 'Montagem livre · '+s.units.length+' '+(s.units.length===1?'unidade':'unidades')+' · '+{empty:'vazia',assembling:'em construção',assembled:'concluída pelo usuário'}[s.status];}
  function crystalLine(e){const el=crystalOf(e);return el.status==='available'?'Disponível · '+X.label(el.structureType):'Indisponível · '+el.message;}
  function summaryPanel(el,local){
    const e=selected(),box=U.element('section',null,'silm-panel');box.append(U.element('p','RESUMO DA INVESTIGAÇÃO','eyebrow'));
    if(!e){box.append(U.element('h3','Nenhum metal selecionado'),U.element('p','Escolha um metal disponível na Tabela Periódica para iniciar uma investigação.'));if(canInvestigate())box.append(U.button('Selecionar metal',openTable,local.scope,{id:'silm-resumo-select',primary:true}));el.append(box);return;}
    const identity=U.element('div',null,'silm-panel-identity');identity.append(U.element('strong',e.symbol),U.element('span',e.name),U.element('span','Z = '+e.atomicNumber));
    const sr=U.element('p','Metal da investigação: '+e.name+', '+e.symbol+', número atômico '+e.atomicNumber+'.','sr-only');box.append(identity,sr);
    const facts=U.element('dl',null,'silm-facts');box.append(facts);
    const update=()=>{const add=(n,v)=>facts.append(U.element('dt',n),U.element('dd',v));facts.replaceChildren();add('Investigação',model.state.investigation?.status==='paused'?'Pausada':'Ativa');add('Módulo',moduleName());add('Estrutura',structureLine());add('Cristalografia',crystalLine(e));};
    watch(local.scope,update);update();
    const s=model.state.structure,next=U.element('div',null,'silm-assembly-controls');
    if(!s&&editable())next.append(SILM.actionButton('Iniciar montagem',startAssembly,local.scope,{id:'silm-resumo-start',primary:true}));
    else if(s&&!crystalline()&&editable()&&crystalOf(e).status==='available')next.append(SILM.actionButton('Organizar estrutura',organizeStructure,local.scope,{id:'silm-resumo-organize'}));
    if(next.childElementCount)box.append(next);el.append(box);
  }
  function metalPanel(el,local){
    const e=selected(),box=U.element('section',null,'silm-panel');box.append(U.element('p','ELEMENTO DA INVESTIGAÇÃO','eyebrow'),U.element('h3',e?e.symbol+' · '+e.name:'Nenhum metal selecionado'));
    if(!e){box.append(U.button('Selecionar metal',openTable,local.scope,{id:'silm-select-metal',primary:true}));el.append(box);return;}
    box.append(U.element('p','Z = '+e.atomicNumber+' · um metal por investigação.'));
    const row=U.element('div',null,'silm-assembly-controls');
    row.append(SILM.actionButton('Selecionar outro metal',openTable,local.scope,{id:'silm-select-metal'}),U.button('Resetar investigação',resetInvestigation,local.scope,{id:'silm-panel-reset'}),U.button('Encerrar investigação',closeInvestigation,local.scope,{id:'silm-panel-close'}),U.button('Fontes dos dados',()=>openSources(e),local.scope,{id:'silm-panel-sources'}));
    box.append(row);el.append(box);
  }
  function structurePanel(el,local){
    const e=selected(),s=model.state.structure,box=U.element('section',null,'silm-panel');box.append(U.element('p','ESTRUTURA','eyebrow'));
    if(!e){box.append(U.element('p','Selecione um metal para montar sua estrutura.','silm-panel-note'));el.append(box);return;}
    box.append(U.element('h3',e.symbol+' · '+e.name));
    const controls=U.element('div',null,'silm-assembly-controls');controls.setAttribute('role','group');controls.setAttribute('aria-label',crystalline()?'Controles da estrutura cristalina':'Controles de montagem');box.append(controls);
    const exploreNote=()=>{if(editable())return;controls.append(U.element('p','A edição da estrutura está disponível em Explorar.','silm-panel-note'));if(ctx.modules.available('explorar'))controls.append(SILM.actionButton('Montar em Explorar',explore,local.scope,{id:'silm-panel-explore'}));};
    if(!s){if(editable())controls.append(SILM.actionButton('Iniciar montagem',startAssembly,local.scope,{id:'silm-panel-start-assembly',primary:true}));else exploreNote();el.append(box);return;}
    if(s.mode==='crystalline'){
      const m=X.models[s.crystallography.structureType];controls.append(U.element('p','Estrutura organizada: '+X.label(m.id)+'.','silm-panel-note'));
      const toggle=(id,label,run,pressed)=>{const b=SILM.actionButton(label,run,local.scope,{id});b.dataset.pressedSource=pressed;return b;};
      const cell=toggle('silm-panel-cell','Mostrar célula unitária',()=>represent({unitCell:!model.state.structure.crystallography.representation.unitCell}),'unitCell');
      const lattice=toggle('silm-panel-lattice','Mostrar rede',()=>represent({view:model.state.structure.crystallography.representation.view==='lattice'?'cell':'lattice'}),'view');
      const neighbors=toggle('silm-panel-neighbors','Mostrar vizinhos',toggleNeighbors,'neighbors');
      const labels=toggle('silm-panel-labels','Mostrar rótulos das posições',()=>represent({labels:!model.state.structure.crystallography.representation.labels}),'labels');
      controls.append(cell,lattice,neighbors,labels);
      if(editable())controls.append(SILM.actionButton('Voltar à montagem livre',restoreFree,local.scope,{id:'silm-panel-free'}));
      controls.append(SILM.actionButton('Limpar estrutura',clearStructure,local.scope,{id:'silm-panel-clear',danger:true}));exploreNote();
      const update=()=>{const st=model.state.structure;if(st?.mode!=='crystalline')return;const r=st.crystallography.representation;
        cell.setAttribute('aria-pressed',String(r.unitCell));lattice.setAttribute('aria-pressed',String(r.view==='lattice'));neighbors.setAttribute('aria-pressed',String(r.neighbors));labels.setAttribute('aria-pressed',String(r.labels));
        cell.textContent=r.unitCell?'Ocultar célula unitária':'Mostrar célula unitária';lattice.textContent=r.view==='lattice'?'Mostrar só a célula':'Mostrar rede';neighbors.textContent=r.neighbors?'Ocultar vizinhos':'Mostrar vizinhos';labels.textContent=r.labels?'Ocultar rótulos das posições':'Mostrar rótulos das posições';};
      watch(local.scope,update);update();el.append(box);return;
    }
    const count=U.element('p','','silm-panel-note');count.id='silm-panel-count';
    const add=SILM.actionButton('Adicionar unidade',addUnit,local.scope,{id:'silm-panel-add',primary:true,glyph:'+'}),undo=SILM.actionButton('Desfazer',undoAction,local.scope,{id:'silm-panel-undo',glyph:'↶',label:'Desfazer última ação'});
    const organize=SILM.actionButton('Organizar estrutura',organizeStructure,local.scope,{id:'silm-panel-organize'}),reason=U.element('p','','silm-panel-note');reason.id='silm-panel-crystal-reason';organize.setAttribute('aria-describedby',reason.id);
    const clear=SILM.actionButton('Limpar estrutura',clearStructure,local.scope,{id:'silm-panel-clear',danger:true}),finish=SILM.actionButton('Concluir montagem',toggleAssembled,local.scope,{id:'silm-panel-finish'});
    const assistLabel=U.element('label',null,'check-row'),assist=U.element('input');assist.type='checkbox';assist.id='silm-panel-assist';assistLabel.append(assist,U.element('span','Posicionamento assistido'));
    local.scope.listen(assist,'change',()=>setAssistance(assist.checked));
    controls.append(count,add,undo,organize,reason,clear,assistLabel,U.element('p','Mecanismo de interface que evita sobreposição; não representa forças entre átomos.','silm-panel-note'),finish);exploreNote();
    const update=()=>{const st=model.state.structure;if(!st||st.mode!=='free')return;const n=st.units.length;
      count.textContent='Montagem: '+n+' '+(n===1?'unidade':'unidades')+' de '+C.maxUnits+'.';
      add.setAttribute('aria-disabled',String(!editable()||n>=C.maxUnits));undo.setAttribute('aria-disabled',String(!editable()||!model.canUndo));const last=describeLast();undo.title=last?'Desfazer: '+last:'Nada para desfazer';
      const o=organizeState();organize.setAttribute('aria-disabled',String(o.disabled));reason.textContent=o.reason||o.title||'';
      assist.checked=st.assistance.enabled;finish.hidden=n<2;finish.textContent=st.status==='assembled'?'Retomar construção':'Concluir montagem';};
    watch(local.scope,update);update();el.append(box);
  }
  /* ---------- Ver: observar a estrutura (representação + resultados do modelo) ---------- */
  const LIMITS=['A representação cristalográfica é um modelo didático da organização periódica do sólido metálico.','A célula unitária representa a unidade repetitiva da rede, não uma molécula metálica independente.','Linhas de ligação localizadas não são utilizadas porque o modelo do SILM não representa a ligação metálica como pares isolados M—M.','A visualização desta série não inclui ainda elétrons deslocalizados.','Parâmetros cristalográficos dependem das condições de referência registradas no banco científico.'];
  function observePanel(el,local){
    const box=U.element('section',null,'silm-panel'),e=selected();box.id='silm-structure-summary';
    if(!e){box.append(U.element('h3','Nada para observar'),U.element('p','Selecione um metal e monte sua estrutura.'));el.append(box);return;}
    const body=U.element('div');box.append(body);
    // Partes estáticas criadas uma vez (o modo livre/cristalino re-renderiza o painel pelo contexto).
    if(crystalline()){const limits=U.element('details'),list=U.element('ul');limits.append(U.element('summary','Limitações do modelo'),list);for(const t of LIMITS)list.append(U.element('li',t));box.append(U.button('Fontes destes dados',()=>openSources(e),local.scope,{id:'silm-observe-sources'}),limits);}
    const update=()=>{
      body.replaceChildren();const s=model.state.structure,dl=U.element('dl',null,'silm-facts silm-crystal-facts'),add=(n,v,kind)=>{const dd=U.element('dd',v);if(kind)dd.append(U.element('br'),tag(kind));dl.append(U.element('dt',n),dd);};
      if(!s){body.append(U.element('h3','Estrutura não montada'),U.element('p',crystalLine(e)));return;}
      if(s.mode==='free'){const n=s.units.length;body.append(U.element('p','REPRESENTAÇÃO DIDÁTICA','silm-datum-kind'),U.element('h3','Montagem'));
        add('Metal',e.name+' · '+e.symbol);add('Unidades',String(n));add('Estado',{empty:'Vazia',assembling:'Em construção',assembled:'Concluída pelo usuário'}[s.status]);add('Posicionamento',s.assistance.enabled?'Assistido (mecanismo de interface)':'Livre, com prevenção de sobreposição');add('Escala','Sem escala física: posições normalizadas da cena');add('Cristalografia',crystalLine(e));
        body.append(dl,U.element('p','A montagem atual ainda não representa a geometria cristalográfica '+referenceName(e)+'. As distâncias visuais não correspondem a distâncias interatômicas reais.','silm-limitation'));return;}
      const g=geometry(),m=g.model,ref=g.reference,r=s.crystallography.representation,lp=ref.latticeParameters;
      body.append(U.element('p','ESTRUTURA CRISTALINA','silm-datum-kind'),U.element('h3',e.name+' · '+e.symbol));
      add('Estrutura de referência',X.label(m.id),'Dado tabelado');add('Grupo espacial',ref.spaceGroup+' (nº '+ref.spaceGroupNumber+')','Dado tabelado');
      add('Condição de referência',ref.conditions.temperature.display+' · '+ref.conditions.pressure.display+' · fase '+lower(ref.conditions.phase.display),'Dado tabelado');
      add('Parâmetros de rede',(m.system==='hexagonal'?'a = '+lp.a.display+' Å · c = '+lp.c.display+' Å':'a = '+lp.a.display+' Å')+' (na condição de referência)','Dado tabelado');
      add('Número de coordenação',String(s.crystallography.coordination),'Resultado do modelo cristalográfico');
      add('Átomos efetivos na célula',m.effective.value+' · '+m.effective.explanation,'Informação descritiva do modelo');
      if(m.system==='hexagonal'){const ratio=g.ratio,dev=Math.abs(ratio-m.idealRatio)/m.idealRatio;add('Razão c/a',ratio.toFixed(3).replace('.',',')+' (ideal: '+m.idealRatio.toFixed(3).replace('.',',')+')'+(dev>.02?'. Neste metal, os 6 vizinhos dos planos adjacentes não ficam exatamente à mesma distância que os 6 do mesmo plano.':''),'Calculado pelo SILM a partir de a e c');add('Camadas','A e B, empilhamento ABAB','Resultado do modelo cristalográfico');}
      add('Vista',(r.view==='lattice'?'Rede extensa':'Célula unitária')+' · célula '+(r.unitCell?'visível':'oculta'),'Representação didática');
      const sel=r.selectedUnitId?unitInfo(r.selectedUnitId):null;add('Unidade selecionada',sel?'Unidade '+sel.index+': '+sel.label:'Nenhuma');
      if(r.neighbors&&sel)add('Vizinhos imediatos',g.neighbors(s.units.find(u=>u.id===r.selectedUnitId).site).list.length+' destacados (halo pontilhado e contorno)','Resultado do modelo cristalográfico');
      body.append(dl);
    };
    watch(local.scope,update);update();el.append(box);
  }
  /* ---------- Dados: tabela, histórico e relatório ---------- */
  function tablePanel(el,local){
    const box=U.element('section',null,'silm-panel'),e=selected();
    if(!e){box.append(U.element('h3','Nenhum metal selecionado'),U.element('p','Explore a Tabela Periódica e escolha um metal disponível. Os dados possuem referências locais e fontes rastreáveis.'));el.append(box);return;}
    const ref=D.structure(e),facts=U.element('dl',null,'silm-facts');box.append(U.element('p','DADO TABELADO','silm-datum-kind'),U.element('h3',e.name+' · '+e.symbol));
    const add=(name,value)=>facts.append(U.element('dt',name),U.element('dd',value));
    add('Número atômico',String(e.atomicNumber));add(e.atomicWeight.form==='massNumber'?'Número de massa (convenção IUPAC)':'Peso atômico padrão (adimensional)',e.atomicWeight.display);add('Posição periódica','Grupo '+(e.group??'não atribuído à série')+' · período '+e.period+' · bloco '+e.block);add('Configuração eletrônica · átomo neutro',e.electronConfiguration.display);add('Estrutura de referência',ref.label+' · '+ref.phaseLabel);add('Temperatura de referência',ref.conditions.temperature.display);add('Cristalografia no SILM',crystalLine(e));box.append(facts);
    const details=U.element('details');details.append(U.element('summary','Valência e condições dos dados'),U.element('p',e.valenceModel.display+' — '+e.valenceModel.convention),U.element('p',e.valenceModel.explanation),U.element('p','Representação qualitativa: convenção de valência; não é uma contagem de elétrons livres.'),U.element('p','Pressão: '+ref.conditions.pressure.display+'. Fase: '+ref.conditions.phase.display+'.'),U.element('p',ref.conditions.notes),U.element('p',e.atomicWeight.convention));
    if(e.group===null)details.append(U.element('p',e.notes));
    details.append(U.element('p',Object.entries(ref.latticeParameters).map(([k,v])=>k+' = '+v.display+' '+v.unit).join(' · ')));box.append(details,U.button('Referências destes dados',()=>openSources(e),local.scope,{id:'silm-info-sources'}));
    el.append(box);
  }
  function historyPanel(el,local){
    const box=U.element('section',null,'silm-panel');box.append(U.element('p','HISTÓRICO DA INVESTIGAÇÃO','eyebrow'));
    const list=U.element('ol',null,'silm-history');list.id='silm-history';const empty=U.element('p','','panel-empty');
    box.append(U.element('p','Sequência cronológica de ações. O Histórico não é Caderno nem relatório.','silm-panel-note'),empty,list);
    const update=()=>{const entries=model.state.investigation?historyRecord().entries:[];list.replaceChildren(...entries.map(x=>{const li=U.element('li'),t=U.element('time',new Date(x.at).toLocaleTimeString('pt-BR'));t.dateTime=x.at;li.append(t,document.createTextNode(x.text));return li;}));empty.textContent=entries.length?'':'Nenhuma ação registrada nesta investigação.';empty.hidden=!!entries.length;};
    watch(local.scope,update);update();el.append(box);
  }
  function reportPanel(el,local){const box=U.element('section',null,'silm-panel');box.append(U.element('p','RELATÓRIO','eyebrow'),U.element('p','O relatório reúne o estado da investigação, os dados tabelados e seus textos.'),U.button('Abrir relatório',()=>ctx.screens.navigate('relatorios'),local.scope,{id:'silm-report',primary:true}));el.append(box);}
  function teacherResources(el,local){const box=U.element('section',null,'silm-teacher-resource');box.id='teacher-periodic-resource';const text=U.element('div');text.append(U.element('p','RECURSO PEDAGÓGICO','eyebrow'),U.element('h2','Tabela Periódica'),U.element('p','Visualize e explore os 118 elementos em formato ampliado para apresentação à turma.'));const open=U.button('Abrir Tabela Periódica',()=>presentation.open({opener:open}),local.scope,{id:'teacher-periodic-open',primary:true});box.append(text,open);el.append(box);}
  function openingSettings() {
    const box=U.element('div',null,'silm-opening-setting');
    const label=U.element('label',null,'check-row'),input=U.element('input');input.type='checkbox';input.id='silm-opening-check';input.checked=ctx.storage.get('abertura',true)!==false;
    label.append(input,U.element('span','Animação de abertura'));box.append(label,U.element('p','Exibir ao abrir ou recarregar. A redução de movimento sempre prevalece.'));
    return ctx.modal.open({title:'Animação de abertura',content:box,actions:[{id:'cancel',label:'Cancelar'},{id:'save',label:'Salvar',primary:true,run:()=>{
      const saved=ctx.storage.set('abertura',input.checked);if(!input.checked)stopOpening?.();
      ctx.notify(saved?'Preferência da abertura salva.':'Preferência aplicada nesta visita. O navegador não permitiu salvá-la.',{type:saved?'success':'warning'});
    }}]});
  }
  function reportText(){
    const state=model.snapshot(),e=selected(),i=state.investigation;if(!(e&&i))return 'SILM '+VERSION+' · Nenhuma investigação científica ativa; não há medidas ou cálculos científicos.';
    const s=state.structure;let structure='Estrutura ainda não montada.';
    if(s?.mode==='free')structure='Montagem livre (representação didática): '+s.units.length+' '+(s.units.length===1?'unidade':'unidades')+'; ainda não representa a geometria cristalográfica nem distâncias reais.';
    if(s?.mode==='crystalline'){const m=X.models[s.crystallography.structureType],added=s.units.filter(u=>u.placement==='crystallographic').length;structure='Estrutura organizada segundo a referência: '+X.label(m.id)+'; '+s.units.length+' unidades ('+(s.units.length-added)+' do estudante, '+added+' completadas pelo SILM). Número de coordenação do modelo: '+s.crystallography.coordination+'. Representação didática com esferas reduzidas, sem escala física absoluta.';}
    return 'SILM '+VERSION+' · ID: '+i.id+' · '+e.name+' ('+e.symbol+'), Z = '+e.atomicNumber+' · Início: '+i.createdAt+' · Módulo ativo: '+(ctx.modules.get(state.module.active)?.title||state.module.active)+'. Dado tabelado: '+D.structure(e).label+'; '+D.structure(e).conditions.temperature.display+'. Fonte: '+D.source(D.structure(e).sourceId).title+'. '+structure+' Sem medidas ou cálculos científicos.';
  }
  return {
    manifest:{id:'silm',nome:'SILM',nomeCurto:'SILM',versao:VERSION,titulo:'SILM — A Arquitetura dos Metais',subtitulo:'Simulador Interativo de Ligações Metálicas',icone:icon,
      tema:{
        dark:{background:'#16181c',surface:'#1f2329',primary:'#c7a54a',onPrimary:'#16181c',secondary:'#b6bdc7',text:'#f2f1ec',border:'#59616d',accent:'#dcc074',scientificAccent:'#4fc3f7',textAccent:'#dcc074'},
        light:{background:'#f5f3ee',surface:'#fffefa',primary:'#725416',onPrimary:'#fffefa',secondary:'#505762',text:'#20252c',border:'#8d8980',accent:'#725416',scientificAccent:'#006a91',textAccent:'#725416'}
      },
      manual:SILM.manual,viewport:{label:'Área de investigação da estrutura metálica'},
      // Paridade com o SIAB 1.0.0 (correção de origem 0.1.x): Montagem / Ver / Dados.
      painelEsquerdo:{title:'Montagem',sections:[{id:'resumo',title:'Resumo',render:summaryPanel},{id:'metal',title:'Metal',visible:context=>!context?.restricted,render:metalPanel},{id:'estrutura',title:'Estrutura',render:structurePanel},{id:'modulo',title:'Módulo',render:(el,local)=>local.modules.render(el,local)}]},
      painelDireito:{title:'Ver',sources:[{id:'ver',title:'Ver',sections:[{id:'observar',title:'Observar',render:observePanel}]},{id:'dados',title:'Dados',sections:[{id:'tabela',title:'Tabela',render:tablePanel},{id:'historico',title:'Histórico',render:historyPanel},{id:'relatorio',title:'Relatório',render:reportPanel}]}]},
      recursos:['domain/entry.js','domain/silm/prelude.js','domain/silm/data/bundle.js','domain/silm/data-api.js','domain/silm/periodic-table.js','domain/silm/presentation.js','domain/silm/periodic-table.css','domain/silm/assembly.js','domain/silm/crystal.js','domain/silm/state.js','domain/silm/assembly-view.js','domain/silm/crystal-view.js','domain/silm/assembly.css','domain/silm/bootstrap.js','domain/silm/manual.js','domain/silm/styles.css','domain/silm/identidade.css','domain/silm/abertura.js','domain/silm/abertura.css',icon]
    },
    init(context) {
      ctx=context;model.connect({storage:ctx.storage,emit:(name,detail)=>ctx.events.emit(name,detail)});
      let restoration=model.load();
      if(restoration.empty){const session=ctx.storage.get('experience.session',null),legacy=session?.sessionId&&ctx.storage.get('scientific.session.'+session.sessionId,null);if(legacy)restoration=model.restore(legacy);}
      if(!restoration.ok)ctx.notify('A investigação anterior não pôde ser restaurada. Selecione um metal para iniciar outra.',{type:'warning'});
      showTable=!selected();restoringModule=!!selected()&&model.state.module.active!=='explorar';
      presentation=SILM.createPresentation(ctx,{onInvestigate:investigate,onSources:renderSources,canInvestigate:canTeacherInvestigate});SILM.presentationSelection=presentation.state;ctx.scope.cleanup(()=>{viewScope?.destroy();viewScope=null;delete SILM.presentationSelection;});
      Object.defineProperty(SILM,'scientificState',{configurable:true,get:()=>model.snapshot()});
      ctx.scope.cleanup(()=>{delete SILM.scientificState;});
      ctx.experience.configure({
        home:{title:'A Arquitetura dos Metais',description:'Explore o SILM e selecione um metal com dados de referência para começar uma investigação.',primary:[
          {id:'laboratorio',title:'Laboratório',description:'Monte a estrutura metálica e observe sua organização cristalina em Explorar, Medir e Calcular.',icon:'lab',destination:'laboratorio',order:'01'},
          {id:'aprender',title:'Aprender',description:'Conheça os temas iniciais e encontre orientações relacionadas.',icon:'learn',destination:'aprender',order:'02'},
          {id:'missoes',title:'Missões',description:'Experimente o fluxo de evidências e conclusão em uma demonstração.',icon:'mission',destination:'missoes',order:'03'},
          {id:'roteiros',title:'Roteiros Experimentais',description:'Percorra a interface com um roteiro demonstrativo.',icon:'routes',destination:'roteiros',order:'04'}
        ],support:[
          {id:'manual',title:'Manual',description:'Consulte as orientações de uso e os limites desta versão.',icon:'manual',destination:'manual',order:'01'},
          {id:'professor',title:'Área do Professor',description:'Prepare instruções e experimente uma atividade livre ou restrita.',icon:'teacher',destination:'professor',order:'02'}
        ]},
        notebook:{enabled:false},modulePanel:false,
        navigation:{desktop:[{id:'inicio',label:'Início',icon:'home'},{id:'aprender',label:'Aprender',icon:'learn'},{id:'missoes',label:'Missões',icon:'mission'},{id:'roteiros',label:'Roteiros Experimentais',icon:'routes'},{id:'laboratorio',label:'Laboratório',icon:'lab'},{id:'manual',label:'Manual',icon:'manual'}],mobile:[{id:'inicio',label:'Início',icon:'home'},{id:'aprender',label:'Aprender',icon:'learn'},{id:'laboratorio',label:'Laboratório',icon:'lab'},{id:'missoes',label:'Missões',icon:'mission'}]},
        shell:{startup:{destinations:[{id:'inicio',label:'Início'},{id:'aprender',label:'Aprender'},{id:'laboratorio',label:'Laboratório'}]},resources:[{id:'abertura',title:'Animação de abertura',icon:'tour',action:openingSettings}]},
        themes:[['ligacao-metalica','Ligação metálica'],['estrutura','Estrutura'],['eletrons','Elétrons'],['propriedades','Propriedades']].map(([id,title])=>({id,title,subtitle:'Conteúdo inicial',description:'Este tema apresenta um ponto de entrada. O conteúdo científico será incorporado nas etapas próprias do SILM.',icon:'learn',related:{content:[{title:'Sobre o SILM',destination:'manual',parameter:'sobre-silm'}],investigations:[{title:'Conhecer o Laboratório',destination:'laboratorio'}],routes:['percurso-interface'],missions:[]}})),
        modules:modules.map(m=>({...m,controls(el){el.append(U.element('p',moduleMessage(m.id),'panel-empty'));}})),
        resources:[],
        routes:[{id:'percurso-interface',title:'Um percurso pelo SILM',subtitle:'Demonstração interna de interface · sem experimento científico',module:'explorar',description:'Conheça a navegação e os painéis.',objective:'Reconhecer os controles do Laboratório e o acesso ao relatório.',procedure:['Abra Montagem e consulte o Resumo.','Na aba Módulo, consulte Explorar.','Abra Ver e depois Dados → Relatório.','Retorne ao Laboratório pelo botão Voltar.'],requirements:['Mouse, toque ou teclado.'],help:{instructions:'Este roteiro demonstra somente o funcionamento da interface.',tips:['Use Fechar ou Escape para recolher os painéis.'],explanations:'Nenhum metal, instrumento ou resultado científico está ativo.',manualTopic:'interface'},navigation:'free',initialState:{schemaVersion:1}}],
        missions:[{id:'revisar-registro',title:'Revisar um registro',subtitle:'Demonstração interna de interface · sem conteúdo científico',module:'medir',objective:'Experimentar o registro e a conclusão de uma atividade restrita.',problem:'Como distinguir concluir uma atividade de encerrar seu contexto?',conditions:['Preencha evidência e conclusão com uma observação sobre a interface.'],evidence:['Um registro textual da navegação.'],help:{instructions:'Use Finalizar missão no Menu para preencher os dois campos e concluir.',tips:['O relatório continua acessível depois de concluir.'],explanations:'Concluir preserva a atividade. Encerrar atividade libera a navegação e retoma o Laboratório Livre.',manualTopic:'atividades'},navigation:'restricted',restrictions:{resources:[]},initialState:{schemaVersion:1},validate({fields}){return fields.evidence.trim()&&fields.conclusion.trim()?{ok:true}:{ok:false,message:'Preencha evidência e conclusão para finalizar esta demonstração.'};}}],
        teacher:true,teacherResources,
        about:{description:'A Arquitetura dos Metais · SILM '+VERSION+'. Banco científico, investigação persistente, montagem da estrutura metálica e estruturas cristalinas CCC, CFC e HC.',modelTitle:'Modelo científico',model:'O banco apresenta 118 elementos e dados documentados. A investigação tem estado científico único. A montagem livre é uma representação didática de construção coletiva. A organização cristalográfica reorganiza a montagem segundo a estrutura de referência registrada no banco (CCC, CFC ou HC); a representação cristalográfica é um modelo didático da organização periódica do sólido metálico, a célula unitária é a unidade repetitiva da rede e não uma molécula, e não há linhas de ligação M—M. Não há elétrons, medidas ou cálculos. O símbolo e a abertura representam organização coletiva e fluxo deslocalizado de forma qualitativa; não representam trajetórias ou quantidades literais de elétrons.',manualTopic:'sobre-silm',licenses:['SILM: GNU GPL v3. Veja LICENSE na distribuição.','dialog-polyfill: licença BSD preservada em vendor/dialog-polyfill/LICENSE.']},
        references:[{id:'contrato-silm',type:'tecnica',title:'Contrato de desenvolvimento do SILM',authors:['Documentação do projeto SILM'],year:'2026',source:'docs/CONTRATO-VERSIONAMENTO.md',notes:'Referência técnica local. Contrato de escopo e versionamento do projeto.'},{id:'identidade-silm',type:'tecnica',title:'Identidade visual SILM preservada da versão de origem',source:'Símbolo e abertura preservados da versão anterior.',notes:'Créditos e hashes dos artefatos constam em BUILD-INFO.json.'},...D.sources],
        report:{collect(){return {sections:[{title:'Estado da investigação',text:reportText()},{title:'Limites do registro',text:'As observações e conclusões abaixo são textos do usuário. As atividades demonstrativas verificam apenas o fluxo de uso da interface. O Histórico da investigação fica em Dados → Histórico e não é copiado para o relatório.'}]};}},
        // Correção de origem 0.3.x: investigação válida do Laboratório Livre é retomada diretamente (0.3.0 §52–53).
        session:{resumeFree:'direct',hasChanges(){return !!model.state.investigation;},capture(){/* scientific.state é persistido pelo serviço único no namespace SILM */},restore(){showTable=!selected();contextChanged();}},
        onStart(){/* Atividade pedagógica muda o contexto, não cria outro estado científico. */contextChanged();}
      });
      ctx.scope.on('module:changed',event=>{const id=event.detail?.id;if(restoringModule&&id==='explorar')return;restoringModule=false;const before=model.state.module.active;model.setModule(id);if(before!==id&&model.state.investigation)logEvent('Módulo: '+(ctx.modules.get(id)?.title||id)+'.');contextChanged();});
      ctx.scope.on('activity:changed',()=>{if(restoringModule){const target=model.state.module.active;restoringModule=false;ctx.modules.select(target).catch(error=>console.error('Falha ao retomar módulo',error));}contextChanged();});
      const themeColor=()=>{document.querySelector('meta[name="theme-color"]').content=ctx.accessibility.state.contrast?'#000000':ctx.accessibility.state.theme==='light'?'#fffefa':'#1f2329';};
      ctx.scope.on('theme:changed',themeColor);themeColor();
      contextChanged();
    },
    mount(){host=U.element('section',null,'silm-laboratory');host.id='silm-view';ctx.viewport.host.append(host);ctx.scope.cleanup(()=>{host?.remove();host=null;});draw();},
    activate() {
      const favicon=document.querySelector('link[rel=icon]');delete favicon.dataset.domainIcon;A11Y.atualizarFavicon(ctx.accessibility.state.theme);
      try{stopOpening=SILM.startOpening?.(ctx);}catch(error){console.warn('Abertura visual omitida; espaço disponível.',error);document.getElementById('silm-opening')?.remove();}
      draw();
    },
    resize(size){if(host)host.dataset.viewportWidth=String(Math.round(size.width));},
    async reset(){if(model.resetInvestigation()){logEvent('Investigação resetada; metal mantido.');await ctx.activity.touch();contextChanged();ctx.notify('Investigação resetada. Metal e preferências preservados.',{type:'info'});}else ctx.notify('Não há investigação científica para resetar.',{type:'info'});},
    deactivate(){stopOpening?.();stopOpening=null;},
    destroy(){host=null;ctx=null;}
  };
};
