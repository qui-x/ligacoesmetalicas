'use strict';
window.SILM = window.SILM || {};
SILM.create = () => {
  const U = SimCore.ExperienceUI, model = SILM.createScientificState(), X = SILM.crystal;
  let ctx = null, host = null;
  const icon = 'assets/silm-simbolo.svg', VERSION = '0.11.0';
  const modules = [
    {id:'explorar',number:1,title:'Explorar',description:'Investigação qualitativa integrada: monte, organize, observe célula, rede, elétrons e propriedades, use camadas e compare representações.',icon:'explore',
     facts:[['Você ajusta','Metal, unidades e organização cristalina'],['Você observa','Célula, rede, elétrons e propriedades'],['Bom para','Construir e comparar representações']],note:'Representação didática: a organização cristalina não é uma simulação de cristalização.'},
    {id:'medir',number:2,title:'Medir',description:'Meça distâncias, ângulos, parâmetros de rede e coordenação no modelo cristalográfico (medidas do modelo).',icon:'ruler',
     facts:[['Você ajusta','Instrumento e pontos da estrutura'],['Você observa','Distância, ângulo, parâmetro de rede e coordenação'],['Bom para','Relacionar geometria e estrutura']],note:'Medidas do modelo, calculadas das coordenadas científicas, nunca da tela nem de uma amostra real.'},
    {id:'calcular',number:3,title:'Calcular',description:'Relacione estrutura e dados: número efetivo, volume da célula, raio, fator de empacotamento, densidade teórica e c/a, com fórmula, entradas e origem de cada valor.',icon:'calculator',
     facts:[['Você ajusta','A grandeza a calcular'],['Você observa','Fórmula, entradas e origem de cada valor'],['Bom para','Ligar a estrutura aos dados tabelados']],note:'Cada resultado mostra a fórmula, as entradas e a fonte; comparações com valores tabelados não são erro experimental.'}
  ];
  const C=SILM.assembly.contract;
  const crystalline=()=>model.state.structure?.mode==='crystalline';
  const moduleMessage=id=>({explorar:crystalline()?'Observe a estrutura cristalina: célula, rede e vizinhança.':model.state.structure?'Adicione, selecione e mova unidades; depois, organize a estrutura.':model.state.metal?'A estrutura ainda não foi montada. Use Iniciar montagem.':'A estrutura ainda não foi montada.',medir:'Use Ver → Medir → Instrumentos: distância, ângulo, parâmetro de rede e coordenação sobre a estrutura cristalina (medidas do modelo, não de uma amostra real).',calcular:'Use Ver → Analisar → Calcular: número efetivo, volume da célula, raio e parâmetro de rede (r ↔ a), fator de empacotamento, densidade teórica e c/a, com a origem de cada valor (calculado pelo SILM).'})[id];
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
  /* Sem metal: na navegação livre, o pedido de escolher um; em atividade restrita, que ela não usa metal. */
  const noMetal=text=>canInvestigate()?text:'Esta atividade não usa um metal. Para investigar um metal, use Encerrar atividade no Menu da atividade.';
  const canTeacherInvestigate=()=>!ctx.activity.current||ctx.activity.current.type==='free';
  // 0.11.x: como no SIAB (semMovimento), Leitura simples também reduz movimento.
  const reducedMotion=()=>!!(ctx?.accessibility.reducedMotion||ctx?.accessibility.state?.reading==='on'||document.documentElement.dataset.motion==='on'||document.documentElement.dataset.reading==='on'||matchMedia('(prefers-reduced-motion: reduce)').matches);
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
  /* Montagem pronta: inicia a investigação do metal, monta e organiza segundo a estrutura de referência do banco. */
  async function preset(z){
    const e=D.get(z);if(!e||e.silmEligibility.status!=='available'||!canInvestigate())return false;
    if(!model.begin(e.atomicNumber,ctx.activity.current?.type||'free'))return false;
    exploration=EX.sanitize(null);ctx.storage.set('exploration.view',exploration);applyLayers();resetMeasure();resetCalc();resetRepresentation();showTable=false;tableState.selection=e.atomicNumber;
    if(!model.beginAssembly()||!model.addUnit().ok)return false;const r=model.organize();if(!r.ok)return false;
    const m=X.models[crystalOf(e).structureType];logEvent('Montagem pronta: '+e.name+' · '+m.code+' ('+m.international+').');follow('structure');await ctx.activity.touch();contextChanged();return true;
  }
  /* Tema → laboratório: seleciona o metal representativo na Tabela Periódica (a investigação começa pelo gesto da pessoa). */
  async function themeInvestigate(z){tableState.selection=z;showTable=!model.state.investigation||selected()?.atomicNumber!==z;contextChanged();return true;}
  async function investigate(e){
    if(!canInvestigate()||e.silmEligibility.status!=='available')return false;
    const units=model.state.structure?.units.length||0,assembly=model.state.structure?' A '+(crystalline()?'estrutura cristalina atual':'montagem atual')+(units?' com '+units+' '+(units===1?'unidade':'unidades'):'')+' será removida; as unidades não são convertidas para o novo metal.':'';
    if(model.state.investigation&&!await U.confirm(ctx,'Iniciar uma nova investigação?','A investigação atual será encerrada. Seus dados científicos serão substituídos; os textos de relatório permanecem salvos.'+assembly,'Iniciar nova investigação'))return false;
    if(!model.begin(e.atomicNumber,ctx.activity.current?.type||'free'))return false;
    exploration=EX.sanitize(null);ctx.storage.set('exploration.view',exploration);applyLayers();resetMeasure();resetCalc();resetRepresentation();
    logEvent('Investigação iniciada com '+e.name+' ('+e.symbol+').');
    showTable=false;tableState.selection=e.atomicNumber;await ctx.activity.touch();contextChanged();await ctx.screens.navigate('laboratorio');
    ctx.viewport.host.scrollTop=0;host?.querySelector('h1')?.focus();SimCore.notifications.announce('Investigação iniciada com '+e.name+'.');return true;
  }
  async function resetInvestigation(){if(!model.state.investigation)return false;
    if(!await confirmDestructive('Resetar investigação?','O metal e a identidade da investigação serão mantidos. A estrutura, as observações e os dados construídos serão limpos.','Resetar investigação'))return false;
    model.resetInvestigation();resetMeasure();resetCalc();logEvent('Investigação resetada; metal mantido.');await ctx.activity.touch();contextChanged();ctx.notify('Investigação resetada. Metal e preferências preservados.',{type:'info'});SimCore.notifications.announce('Investigação resetada.');return true;
  }
  async function closeInvestigation(){if(!model.state.investigation)return false;
    if(!await confirmDestructive('Encerrar investigação?','O metal e a estrutura serão removidos e o Laboratório voltará à seleção. Os textos de relatório permanecem salvos.','Encerrar investigação'))return false;
    model.close();ctx.storage.remove('investigation.history');ctx.storage.remove('exploration.view');ctx.storage.remove('representation.view');representation=RP.defaults(null);exploration=EX.sanitize(null);applyLayers();resetMeasure();resetCalc();showTable=true;tableState.selection=null;tableState.query='';await ctx.activity.touch();contextChanged();ctx.viewport.host.scrollTop=0;ctx.notify('Investigação encerrada.',{type:'info'});SimCore.notifications.announce('Investigação encerrada. Selecione um metal.');return true;
  }
  /* ---------- Montagem livre (0.4.x) ---------- */
  function structureChanged(){view?.update();for(const fn of [...watchers])fn();}
  function say(text){if(view)view.say(text);else SimCore.notifications.announce(text);}
  async function startAssembly(){if(!model.beginAssembly())return false;follow('structure');logEvent('Montagem iniciada.');await ctx.activity.touch();contextChanged();view?.focusAdd?.();say('Montagem iniciada. Use Adicionar unidade para inserir unidades de '+lower(selected().name)+'.');return true;}
  function addUnit(){if(!editable())return {ok:false,reason:'MODULE'};const r=model.addUnit();
    if(!r.ok){say(r.reason==='UNITS_LIMIT'?'Limite de '+C.maxUnits+' unidades desta cena atingido.':r.reason==='CRYSTALLINE_MODE'?'Volte à montagem livre para adicionar unidades.':'Não há espaço livre na cena. Reorganize as unidades.');return r;}
    structureChanged();view?.select?.(r.unit.id,{announce:false});const n=model.state.structure.units.length;logEvent('Unidade '+n+' adicionada.');say(unitName().replace(/^u/,'U')+' '+n+' adicionada e selecionada. Toque no destino para posicioná-la.');return r;}
  /* Como no SIAB: cada ação desfazível tem descrição; o botão mostra “Desfazer: …” e o anúncio “Desfeito: …”. */
  function describeLast(){const last=model.lastAction;if(!last)return null;const k=(model.state.structure?.units.findIndex(u=>u.id===last.unitId)??-1)+1;return (last.type==='add'?'adição da unidade ':'movimento da unidade ')+k;}
  function undoAction(){if(!editable())return {ok:false,reason:'MODULE'};const description=describeLast(),r=model.undo();if(!r.ok){say('Nada para desfazer.');return r;}structureChanged();logEvent('Desfeito: '+description+'.'+(r.electronsCleared?' Modelo eletrônico desativado (menos de duas unidades).':''));say('Desfeito: '+description+'.'+(r.electronsCleared?' '+ELECTRONS_DROPPED:''));return r;}
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
    const freeCam=view?.renderer?.camera||representation.cameras.free,from=Object.fromEntries(model.state.structure.units.map(u=>[u.id,SILM.renderer2d.toView(freeCam,u.position)]));
    representation.cameras.crystal=RP.camera();saveRepresentation();
    const r=model.organize();if(!r.ok){say('Não foi possível organizar a estrutura.');return false;}
    pendingAnimation=from;follow('structure');logEvent('Estrutura organizada como '+m.code+' ('+m.international+'): '+r.reused+' unidades reaproveitadas'+(r.added?', '+r.added+' completadas pelo SILM.':'.'));
    await ctx.activity.touch();contextChanged();view?.title?.focus();
    say('Estrutura organizada: '+m.code+', '+m.name+'. '+(r.added?r.added+' unidades completadas pelo SILM. ':'')+'Célula unitária visível.');return true;
  }
  async function restoreFree(){if(!crystalline()||!editable())return false;const had=!!model.state.electrons;if(!model.restoreFree())return false;const dropped=had&&!model.state.electrons;follow('structure');logEvent('Retorno à montagem livre; posições anteriores restauradas.'+(dropped?' Modelo eletrônico desativado (menos de duas unidades).':''));await ctx.activity.touch();contextChanged();view?.title?.focus();say('Montagem livre restaurada com as posições anteriores. O metal e a investigação continuam.'+(dropped?' '+ELECTRONS_DROPPED:''));return true;}
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
    if(!represent({selectedUnitId:id},{announce:false}))return;if(id)follow('unit');
    if(!id){say('Seleção removida.');return;}
    const info=unitInfo(id),r=model.state.structure.crystallography.representation;
    if(r.neighbors)announceNeighbors();else say('Unidade '+info.index+' selecionada: '+info.label+'.');
  }
  function toggleNeighbors(){
    const r=model.state.structure?.crystallography?.representation;if(!r)return;
    if(!r.neighbors&&!r.selectedUnitId){const g=geometry(),central=model.state.structure.units.find(u=>X.key(u.site)===g.cell[0].key)||model.state.structure.units[0];represent({neighbors:true,selectedUnitId:central.id});follow('unit');}
    else represent({neighbors:!r.neighbors});
    if(model.state.structure.crystallography.representation.neighbors)logEvent('Vizinhos imediatos destacados.');else say('Destaque de vizinhos desligado.');
  }
  /* ---------- Modelo eletrônico (0.6.x): elétrons de valência deslocalizados, representação qualitativa ---------- */
  const ELECTRONS_DROPPED='Modelo eletrônico desativado: a distribuição coletiva precisa de ao menos duas unidades.';
  const ELECTRON_DESCRIPTION='Representação qualitativa de elétrons de valência deslocalizados distribuídos pela estrutura metálica.';
  function electronAvailability(){
    const s=model.state.structure;if(model.state.electrons)return {ok:true};
    if(!s||s.units.length<SILM.electronModel.minUnits)return {ok:false,reason:'Adicione ao menos duas unidades: a distribuição eletrônica é coletiva.'};
    if(!editable())return {ok:false,reason:'Ative os elétrons em Explorar.'};return {ok:true};
  }
  function showElectrons(){
    const able=electronAvailability();if(!able.ok){say(able.reason);return false;}
    const created=!model.state.electrons,r=model.activateElectrons();if(!r.ok){say(electronAvailability().reason||'Não foi possível ativar o modelo eletrônico.');return false;}
    follow('electrons');structureChanged();logEvent(created?'Modelo eletrônico ativado: elétrons de valência deslocalizados (representação qualitativa).':'Elétrons visíveis.');
    say('Elétrons visíveis. '+ELECTRON_DESCRIPTION+(reducedMotion()?' Movimento reduzido: representação estática.':''));return true;
  }
  function hideElectrons(){if(!model.setElectronRepresentation({visible:false}))return false;structureChanged();logEvent('Elétrons ocultos (o modelo eletrônico continua ativo).');say('Elétrons ocultos. O modelo eletrônico continua ativo.');return true;}
  function toggleElectronMotion(){
    const el=model.state.electrons;if(!el?.representation.visible){say('Mostre os elétrons para alterar o movimento.');return false;}
    if(reducedMotion()){say('Movimento reduzido ativo: a representação permanece estática, com a mesma informação.');return false;}
    const next=!el.representation.motion;if(!model.setElectronRepresentation({motion:next}))return false;structureChanged();logEvent(next?'Movimento eletrônico ativado.':'Movimento eletrônico pausado: representação estática.');
    say(next?'Movimento visual ativo: mobilidade qualitativa, sem direção predominante.':'Representação estática. A distribuição eletrônica continua visível.');return true;
  }
  const electronOptions=()=>({actions:{show:showElectrons,hide:hideElectrons,motion:toggleElectronMotion},canActivate:electronAvailability});
  /* ---------- Propriedades metálicas (0.7.x): estrutura → comportamento → propriedade observada ---------- */
  const PR=SILM.properties;
  const PROPERTY_CONTEXT={NO_STRUCTURE:'Monte uma estrutura para investigar propriedades.',NEEDS_CRYSTALLINE:'Organize a estrutura cristalina para esta experiência.',TOO_FEW_UNITS:'Adicione ao menos duas unidades.'};
  function propertyAvailability(id){const r=model.propertyAvailability(id);return {ok:r.ok,message:r.ok?'':PROPERTY_CONTEXT[r.reason]||PR.reasons[r.reason]||'Indisponível.'};}
  const propertyInfo=()=>({state:model.state,eligibility:PR.eligibility(selected()),editable:editable(),reduced:reducedMotion(),availability:propertyAvailability});
  const propertyTitle=()=>PR.catalog[model.state.properties.active]?.title||'';
  function propertyNarrative(){const pr=model.state.properties;return pr.active?PR.narrative(pr.active,pr[pr.active],{reduced:reducedMotion(),electronsVisible:!!model.state.electrons?.representation.visible}):null;}
  function startProperty(id){
    if(!editable()){say('As experiências de propriedades são operadas em Explorar.');return false;}
    const el=PR.eligibility(selected())[id];if(el.status==='unavailable'){say(PR.catalog[id].title+' indisponível: '+el.message);return false;}
    const r=model.startProperty(id);if(!r.ok){say(propertyAvailability(id).message);return false;}if(r.unchanged)return true;
    follow('property');structureChanged();logEvent('Experiência iniciada: '+PR.catalog[id].title+'.'+(r.electrons?' Elétrons visíveis (modelo eletrônico ativo).':''));
    say(PR.catalog[id].title+' em estudo.'+(r.switchedFrom?' A experiência anterior voltou ao estado-base.':'')+(r.electrons?' Elétrons visíveis.':'')+' '+propertyNarrative().observation);return true;
  }
  function propertyChange(patch,log){
    if(!editable()){say('As experiências de propriedades são operadas em Explorar.');return false;}
    if(!model.setPropertyParams(patch))return false;structureChanged();const n=propertyNarrative();if(log)logEvent(propertyTitle()+': '+n.action);say(n.action+' '+n.observation);return true;
  }
  const propertyActions={
    start:startProperty,
    field:()=>{const on=!model.state.properties.electrical.field;return propertyChange({field:on},true);},
    heat:()=>{const t=model.state.properties.thermal;return propertyChange(t.heating?{heating:false}:{heating:true},true);},
    advance:()=>{const t=model.state.properties.thermal;if(!t.heating||t.stage>=PR.limits.heatStages){say(t.heating?'A energia térmica já se distribuiu pela estrutura nesta representação (sem fusão).':'Aqueça a região para observar a propagação.');return false;}return propertyChange({stage:t.stage+1},false);},
    compress:()=>{const c=model.state.properties.malleability.compression;if(c>=PR.limits.compression){say('Limite desta representação didática. A deformação possível varia entre metais.');return false;}return propertyChange({compression:c+1},true);},
    stretch:()=>{const x=model.state.properties.ductility.elongation;if(x>=PR.limits.elongation){say('Limite desta representação didática. A ductilidade real varia entre metais e condições.');return false;}return propertyChange({elongation:x+1},true);},
    light:()=>{const on=!model.state.properties.luster.light;return propertyChange({light:on},true);},
    restore:()=>{const title=propertyTitle();if(!model.restoreProperty())return false;structureChanged();logEvent(title+': experiência restaurada ao estado-base.');say(title+': estado-base restaurado. A investigação e o metal continuam.');return true;},
    end:()=>{const title=propertyTitle();if(!model.endProperty())return false;if(exploration.focus==='property')follow(null);structureChanged();logEvent('Experiência encerrada: '+title+'.');say('Experiência de '+title.toLocaleLowerCase('pt-BR')+' encerrada. A estrutura continua a mesma.');return true;}
  };
  /* Propagação térmica automática (somente com movimento permitido); com movimento reduzido, Avançar propagação. */
  function advanceHeat(){const t=model.state.properties;if(t.active!=='thermal'||!t.thermal.heating||t.thermal.stage>=PR.limits.heatStages||!editable())return;
    model.setPropertyParams({stage:t.thermal.stage+1});structureChanged();if(model.state.properties.thermal.stage>=PR.limits.heatStages)say('Etapa '+PR.limits.heatStages+' de '+PR.limits.heatStages+': a energia térmica se espalhou pela estrutura. Sem fusão nesta representação.');}
  const propertyOptions=()=>({advanceHeat,controls:(host,scope)=>SILM.createPropertyControls(host,{scope,info:propertyInfo,actions:propertyActions,prefix:'silm-stage-prop',compact:true})});
  function openTable(){showTable=true;ctx.panels.close('left');ctx.panels.close('right');draw();ctx.viewport.host.scrollTop=0;host?.querySelector('.periodic-heading h1')?.focus();}
  function draw(){
    if(!ctx||!host)return;
    const table=(showTable||!selected())&&!ctx.experience.restricted,structure=model.state.structure;
    const key=!table&&selected()&&structure?'assembly:'+model.state.investigation.id+':'+model.state.module.active+':'+structure.mode:null;
    if(key&&key===viewKey&&view){view.update();return;}
    view=null;viewKey=key;viewScope?.destroy();viewScope=SimCore.createScope();host.replaceChildren();
    if(table){SILM.createPeriodicTable(host,{scope:viewScope,state:tableState,onInvestigate:investigate,onSources:openSources,canInvestigate});return;}
    const e=selected();
    if(key&&structure.mode==='crystalline'){const animateFrom=pendingAnimation;pendingAnimation=null;view=SILM.createCrystalView(host,{scope:viewScope,model,element:e,geometry:geometry(),moduleTitle:moduleName(),note:editable()?'':moduleMessage(model.state.module.active),animateFrom,reducedMotion,electrons:electronOptions(),properties:propertyOptions(),measure:measureOptions(),calc:calcOptions(),representation:representationApi,actions:{represent,select:selectCrystal,toggleNeighbors}});return;}
    if(key){view=SILM.createAssemblyView(host,{scope:viewScope,model,element:e,editable:editable(),note:moduleMessage(model.state.module.active),reference:referenceName(e),moduleTitle:moduleName(),describeLast,actions:{add:addUnit,undo:undoAction,move:moveUnit},canExplore:()=>ctx.modules.available('explorar'),onExplore:explore,organize:{run:organizeStructure,state:organizeState},reducedMotion,electrons:electronOptions(),properties:propertyOptions(),representation:representationApi});return;}
    const card=U.element('section',null,'silm-metal-card');
    card.append(U.element('p','LABORATÓRIO · '+moduleName().toUpperCase(),'eyebrow'));
    if(e)card.append(U.element('div',e.symbol,'metal-symbol'));
    const h=U.element('h1',e?e.name:'Atividade de interface');h.tabIndex=-1;card.append(h);
    if(e){const ref=D.structure(e),investigation=model.state.investigation,el=crystalOf(e);card.append(U.element('p','Metal da investigação: '+e.name+', '+e.symbol+', número atômico '+e.atomicNumber+'.'),U.element('p','Investigação '+(investigation?.status==='paused'?'pausada':'ativa'),'silm-investigation-status'),U.element('p','A estrutura metálica ainda não foi montada.'),U.element('p','Estrutura de referência: '+ref.label+' · '+ref.conditions.temperature.display+' · dado tabelado.'));
      const crystalNote=U.element('p',el.status==='available'?'Cristalografia disponível: depois de montar, use Organizar estrutura para ver a '+X.models[el.structureType].code+'.':'Cristalografia indisponível: '+el.message,'silm-crystal-availability');crystalNote.id='silm-card-crystal';card.append(crystalNote);
      if(!editable())card.append(U.element('p',moduleMessage(model.state.module.active)));
      const actions=U.element('div',null,'action-row');
      if(editable())actions.append(U.button('Iniciar montagem',startAssembly,viewScope,{id:'silm-start-assembly',primary:true}));else if(ctx.modules.available('explorar'))actions.append(U.button('Montar em Explorar',explore,viewScope,{id:'silm-card-explore',primary:true}));
      if(canInvestigate())actions.append(U.button('Selecionar outro metal',openTable,viewScope,{id:'silm-select-other'}),U.button('Resetar investigação',resetInvestigation,viewScope,{id:'silm-reset'}),U.button('Encerrar investigação',closeInvestigation,viewScope,{id:'silm-close'}));actions.append(U.button('Dados do metal',()=>ctx.panels.open('right','tabela'),viewScope,{id:'silm-info'}),U.button('Fontes',()=>openSources(e),viewScope,{id:'silm-sources'}));card.append(actions);
    }else card.append(U.element('p','Esta atividade percorre a interface do Laboratório sem um metal. Para investigar um metal, use Encerrar atividade no Menu da atividade.'));
    if(ctx.experience.restricted)card.append(U.button('Ajuda da atividade',()=>ctx.experience.details(),viewScope));host.append(card);
  }
  function contextChanged(){ctx.setContext({module:model.state.module.active,restricted:ctx.experience.restricted,metal:model.state.metal?.atomicNumber||null,mode:model.state.structure?.mode||null});draw();}
  /* ---------- Painel Montagem (paridade SIAB: Resumo, Metal, Estrutura, Módulo) ---------- */
  function structureLine(){const s=model.state.structure;if(!s)return 'Não montada';if(s.mode==='crystalline'){const m=X.models[s.crystallography.structureType];return m.code+' organizada · '+s.units.length+' unidades';}return 'Montagem livre · '+s.units.length+' '+(s.units.length===1?'unidade':'unidades')+' · '+{empty:'vazia',assembling:'em construção',assembled:'concluída pelo usuário'}[s.status];}
  function crystalLine(e){const el=crystalOf(e);return el.status==='available'?'Disponível · '+X.label(el.structureType):'Indisponível · '+el.message;}
  function summaryPanel(el,local){
    const e=selected(),box=U.element('section',null,'silm-panel');box.append(U.element('p','RESUMO DA INVESTIGAÇÃO','eyebrow'));
    if(!e){box.append(U.element('h3','Nenhum metal selecionado'),U.element('p',noMetal('Escolha um metal disponível na Tabela Periódica para iniciar uma investigação.')));if(canInvestigate())box.append(U.button('Selecionar metal',openTable,local.scope,{id:'silm-resumo-select',primary:true}));el.append(box);return;}
    const identity=U.element('div',null,'silm-panel-identity');identity.append(U.element('strong',e.symbol),U.element('span',e.name),U.element('span','Z = '+e.atomicNumber));
    const sr=U.element('p','Metal da investigação: '+e.name+', '+e.symbol+', número atômico '+e.atomicNumber+'.','sr-only');box.append(identity,sr);
    const facts=U.element('dl',null,'silm-facts');box.append(facts);
    const update=()=>{const add=(n,v)=>facts.append(U.element('dt',n),U.element('dd',v));facts.replaceChildren();add('Investigação',model.state.investigation?.status==='paused'?'Pausada':'Ativa');add('Módulo',moduleName());add('Estrutura',structureLine());add('Cristalografia',crystalLine(e));add('Propriedade',model.state.properties.active?propertyTitle()+' (em estudo)':'Nenhuma experiência ativa');};
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
  function electronPanelGroup(box,local){
    const group=U.element('div',null,'silm-assembly-controls');group.setAttribute('role','group');group.setAttribute('aria-label','Modelo eletrônico');
    const show=SILM.actionButton('Mostrar elétrons',()=>model.state.electrons?.representation.visible?hideElectrons():showElectrons(),local.scope,{id:'silm-panel-electrons'});
    const motion=SILM.actionButton('Movimento eletrônico',toggleElectronMotion,local.scope,{id:'silm-panel-motion'}),note=U.element('p','','silm-panel-note');note.id='silm-panel-electron-note';
    group.append(U.element('p','MODELO ELETRÔNICO','eyebrow'),show,motion,note);box.append(group);
    const update=()=>{const e=model.state.electrons,shown=!!e?.representation.visible,able=electronAvailability(),reduced=reducedMotion(),moving=shown&&e.representation.motion&&!reduced;
      show.textContent=shown?'Ocultar elétrons':'Mostrar elétrons';show.setAttribute('aria-pressed',String(shown));show.setAttribute('aria-disabled',String(!e&&!able.ok));
      motion.setAttribute('aria-pressed',String(moving));motion.setAttribute('aria-disabled',String(!shown||reduced));
      note.textContent=!e&&!able.ok?able.reason:!shown?(e?'Elétrons ocultos; o modelo continua ativo.':'Representação qualitativa de elétrons de valência deslocalizados.'):moving?'Elétrons visíveis · movimento visual ativo.':'Elétrons visíveis · representação estática'+(reduced?' (movimento reduzido).':'.');};
    watch(local.scope,update);update();
  }
  function propertiesPanel(el,local){
    const e=selected(),box=U.element('section',null,'silm-panel');box.append(U.element('p','PROPRIEDADES METÁLICAS','eyebrow'));
    if(!e){box.append(U.element('p',noMetal('Selecione um metal e monte sua estrutura.'),'silm-panel-note'));el.append(box);return;}
    const note=U.element('p','','silm-panel-note');note.id='silm-properties-note';box.append(note);
    const controls=SILM.createPropertyControls(box,{scope:local.scope,info:propertyInfo,actions:propertyActions,prefix:'silm-prop'});
    const update=()=>{const s=model.state.structure;controls.root.hidden=!s;note.textContent=!s?'Monte uma estrutura para investigar propriedades.':!editable()?'As experiências são operadas em Explorar; aqui você acompanha o estado.':'Estrutura → comportamento → propriedade observada. As experiências são qualitativas.';if(s)controls.update();};
    watch(local.scope,update);update();el.append(box);
  }
  function structurePanel(el,local){
    const e=selected(),s=model.state.structure,box=U.element('section',null,'silm-panel');box.append(U.element('p','ESTRUTURA','eyebrow'));
    if(!e){box.append(U.element('p',noMetal('Selecione um metal para montar sua estrutura.'),'silm-panel-note'));el.append(box);return;}
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
      watch(local.scope,update);update();electronPanelGroup(box,local);el.append(box);return;
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
    watch(local.scope,update);update();electronPanelGroup(box,local);el.append(box);
  }
  /* ---------- Ver: observar a estrutura (representação + resultados do modelo) ---------- */
  const LIMITS=['A representação cristalográfica é um modelo didático da organização periódica do sólido metálico.','A célula unitária representa a unidade repetitiva da rede, não uma molécula metálica independente.','Linhas de ligação localizadas não são utilizadas porque o modelo do SILM não representa a ligação metálica como pares isolados M—M.','Parâmetros cristalográficos dependem das condições de referência registradas no banco científico.'];
  const ELECTRON_LIMITS=['Os pontos exibidos pelo SILM são marcadores qualitativos da distribuição eletrônica e não representam a quantidade real de elétrons da amostra.','A trajetória visual das partículas não representa trajetórias quânticas individuais de elétrons.','O movimento visual não corresponde diretamente à velocidade física dos elétrons.','Na ausência de campo externo, o movimento não representa corrente elétrica orientada.','O modelo simplifica a descrição eletrônica do sólido metálico para fins didáticos.','Os elétrons não pertencem visualmente a pares específicos de centros metálicos.'];
  /* Átomo isolado → estrutura: esquema conceitual estático (não é ionização de um átomo em fase gasosa). */
  function transitionDiagram(){
    const NS='http://www.w3.org/2000/svg',svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 240 92');svg.setAttribute('class','silm-electron-diagram');svg.setAttribute('role','img');
    svg.setAttribute('aria-label','Esquema: à esquerda, átomo isolado com elétrons de valência associados a ele; à direita, na estrutura metálica, centros metálicos envolvidos por elétrons de valência deslocalizados por todo o conjunto.');
    const add=(tag,attrs,text)=>{const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,String(v));if(text)n.textContent=text;svg.append(n);return n;};
    add('circle',{cx:34,cy:38,r:13,class:'silm-diagram-center'});for(const a of [20,120,210,300])add('circle',{cx:34+21*Math.cos(a*Math.PI/180),cy:38+21*Math.sin(a*Math.PI/180),r:3,class:'silm-diagram-electron'});
    add('text',{x:34,y:84,'text-anchor':'middle',class:'silm-diagram-label'},'átomo isolado');
    add('path',{d:'M74 38 H108 M100 31 L108 38 L100 45',class:'silm-diagram-arrow'});
    const centres=[[138,24],[170,24],[202,24],[154,52],[186,52],[218,52]];for(const [x,y]of centres)add('circle',{cx:x,cy:y,r:9,class:'silm-diagram-center'});
    for(const [x,y]of [[124,40],[150,10],[156,38],[176,40],[190,12],[208,38],[226,32],[140,62],[170,66],[200,64],[230,66],[214,8]])add('circle',{cx:x,cy:y,r:3,class:'silm-diagram-electron'});
    add('text',{x:178,y:84,'text-anchor':'middle',class:'silm-diagram-label'},'na estrutura metálica');
    return svg;
  }
  function electronSection(box,local,e){
    const section=U.element('section',null,'silm-electron-summary');section.id='silm-electron-summary';section.setAttribute('aria-labelledby','silm-electron-heading');
    const h=U.element('h3','Modelo eletrônico');h.id='silm-electron-heading';
    const body=U.element('div'),limits=U.element('details'),list=U.element('ul');limits.append(U.element('summary','Limites da representação eletrônica'),list);for(const t of ELECTRON_LIMITS)list.append(U.element('li',t));
    const help=U.element('a','Elétrons deslocalizados no Manual','silm-inline-link');help.href='#/manual/eletrons-deslocalizados';help.id='silm-electron-manual';
    section.append(U.element('p','REPRESENTAÇÃO QUALITATIVA','silm-datum-kind'),h,body,transitionDiagram(),limits,help);box.append(section);
    const update=()=>{
      body.replaceChildren();const st=model.state,el=st.electrons,dl=U.element('dl',null,'silm-facts'),add=(n,v,kind)=>{const dd=U.element('dd',v);if(kind)dd.append(U.element('br'),tag(kind));dl.append(U.element('dt',n),dd);};
      if(!st.structure)return;
      body.append(U.element('p','Centros metálicos positivos envolvidos por elétrons de valência deslocalizados.','silm-electron-principle'));
      add('Modelo',el?'Elétrons de valência deslocalizados pela estrutura metálica':'Inativo · '+(electronAvailability().reason||'use Mostrar elétrons'),'Representação qualitativa');
      add('Origem conceitual',e.valenceModel.display+' · '+e.valenceModel.convention,'Convenção do banco (fonte: '+D.source(e.valenceModel.sourceId).title+')');
      add('Configuração do átomo neutro',e.electronConfiguration.display,'Dado tabelado');
      if(el){const reduced=reducedMotion(),moving=el.representation.visible&&el.representation.motion&&!reduced;add('Estado',(el.representation.visible?'Elétrons visíveis':'Elétrons ocultos')+' · '+(el.representation.visible?(moving?'movimento visual ativo':'representação estática'+(reduced?' (movimento reduzido)':'')):'modelo ativo'));
        add('Estrutura',st.structure.mode==='crystalline'?'Distribuição sobre a rede '+X.models[st.structure.crystallography.structureType].code+'; continua além da célula.':'Distribuição preliminar sobre a montagem livre (representação didática).');}
      body.append(dl,U.element('p','Os pontos representam qualitativamente a distribuição eletrônica e não correspondem ao número real de elétrons da amostra.','silm-limitation'));
    };
    watch(local.scope,update);update();
  }
  function propertySection(box,local,e){
    const section=U.element('section',null,'silm-property-summary');section.id='silm-property-summary';section.setAttribute('aria-labelledby','silm-property-heading');
    const h=U.element('h3','Propriedades');h.id='silm-property-heading';const body=U.element('div');section.append(U.element('p','PROPRIEDADES METÁLICAS','silm-datum-kind'),h,body);box.append(section);
    const update=()=>{
      body.replaceChildren();const st=model.state;section.hidden=!st.structure;if(!st.structure)return;
      const pr=st.properties,el=PR.eligibility(e),dl=U.element('dl',null,'silm-facts'),add=(n,v,kind)=>{const dd=U.element('dd',v);if(kind)dd.append(U.element('br'),tag(kind));dl.append(U.element('dt',n),dd);};
      if(!pr.active){h.textContent='Propriedades';for(const id of PR.ids){const x=el[id];add(x.title,x.status==='unavailable'?'Indisponível · '+x.message:x.status==='available'?'Experiência qualitativa e dado tabelado':'Experiência qualitativa',x.status==='unavailable'?null:'Representação qualitativa');}
        body.append(dl,U.element('p','Use Montagem → Propriedades para iniciar uma experiência. Uma por vez; a estrutura científica não é alterada.','silm-panel-note'));return;}
      const id=pr.active,x=el[id],n=propertyNarrative();h.textContent=PR.catalog[id].title;
      const blocks=U.element('div',null,'silm-property-blocks');for(const [t,v]of [['O que você alterou',n.action],['O que aconteceu',n.observation],['Como interpretar',n.interpretation||'Aplique a ação da experiência para observar o comportamento.']]){const b=U.element('div',null,'silm-property-block');b.append(U.element('h4',t),U.element('p',v));blocks.append(b);}
      add('Representação','Qualitativa','Representação qualitativa');
      if(x.data){add(x.data.label,x.data.value.toPrecision(4).replace('.',',')+' '+x.data.unit,x.data.kind==='CALCULATED'?'Calculado pelo SILM':'Dado tabelado');add('Fonte',D.source(x.data.sourceId).title);}
      else if(x.dataReason)add('Dado de referência','Não homologado no banco do SILM para este metal; nenhum valor típico é usado.','Dado tabelado indisponível');
      const ref=D.structure(e);add('Condição de referência da estrutura',ref.conditions.temperature.display+' · '+ref.conditions.pressure.display+' · fase '+lower(ref.conditions.phase.display),'Dado tabelado');
      if(x.note)add('Validação',x.note);
      body.append(blocks,dl,U.element('p',PR.catalog[id].limitation,'silm-limitation'));
    };
    watch(local.scope,update);update();
  }
  /* ---------- Medir (0.9.x): medidas do modelo; instrumento e pontos em escolha são estado transitório ---------- */
  const MS=SILM.measurement,UN=SILM.units,measure={tool:null,picks:[],review:null};let measureView={unit:'Å'};
  const MEASURE_REASON={NO_STRUCTURE:'Monte e organize uma estrutura para medir.',NO_SCALE:'A montagem livre não tem escala física: organize a estrutura cristalina para medir.',DEFORMED:'Restaure a experiência de deformação: as medidas usam a estrutura de referência.'};
  const MEASURE_FAIL={SAME_POINT:'Os pontos escolhidos são o mesmo centro: escolha outro ponto.',NOT_LATTICE_VECTOR:'Esses pontos não estão em uma aresta da célula: selecione dois vértices vizinhos ao longo de uma aresta.',NOT_CELL_EDGE:'Esses pontos não estão em uma aresta da célula: selecione dois vértices vizinhos ao longo de uma aresta.',MEASUREMENTS_LIMIT:'Limite de '+SILM.measurement.limit+' medições: remova registros em Dados → Medições.'};
  const TOOL_LABEL={distance:'Distância',angle:'Ângulo',latticeParameter:'Parâmetro de rede',coordination:'Vizinhança e coordenação'};
  function measureAvailability(){if(model.state.module.active!=='medir')return {ok:false,module:true,reason:'Os instrumentos funcionam no módulo Medir.'};const r=model.measurementAvailability();return r.ok?{ok:true}:{ok:false,reason:MEASURE_REASON[r.reason]||'Indisponível.'};}
  const pointLabel=(type,i)=>type==='angle'?['A','B','C'][i]:['A','B'][i];
  const promptFor=(type,n)=>type==='coordination'?'Selecione um centro metálico.':type==='angle'?['Selecione o ponto A.','Selecione o vértice B.','Selecione o ponto C.'][n]:['Selecione o ponto A.','Selecione o ponto B.'][n];
  const displayValue=(m,unit=measureView.unit)=>m.unit==='Å'?UN.format(m.value,unit):m.unit==='°'?UN.format(m.value,'°'):String(m.value);
  function resultText(m,unit=measureView.unit){const v=m.unit==='Å'?UN.spoken(m.value,unit):m.unit==='°'?UN.spoken(m.value,'°'):m.value;
    return {distance:'Distância medida: '+v+'.',angle:'Ângulo medido: '+v+'.',latticeParameter:'Parâmetro '+m.parameter+' medido: '+v+'.',coordination:'Coordenação medida: '+m.value+' vizinhos imediatos.'}[m.type];}
  function resetMeasure(){measure.tool=null;measure.picks=[];measure.review=null;}
  /* Troca de metal ou de investigação: a fórmula escolhida e as entradas digitadas pertencem à estrutura anterior. */
  function resetCalc(){calc.formula=null;calc.choice={};calc.user={};calc.errors={};calc.review=null;}
  function chooseTool(type){const able=measureAvailability();if(!able.ok){say(able.reason);return false;}
    measure.tool=type;measure.picks=[];measure.review=null;structureChanged();say(TOOL_LABEL[type]+': '+promptFor(type,0));return true;}   // escolher = selecionar (reinicia os pontos)
  function cancelMeasure(){if(!measure.picks.length&&!measure.tool)return;measure.picks=[];measure.tool=null;structureChanged();say('Instrumento desligado. A seleção comum de unidades volta a valer.');}
  function pickUnit(id){
    if(!measure.tool)return;const able=measureAvailability();if(!able.ok){say(able.reason);return;}
    const type=measure.tool,T=MS.types[type];measure.picks.push(id);const n=measure.picks.length;
    if(n<T.points){say((type==='angle'&&n===2?'Vértice B selecionado':'Ponto '+pointLabel(type,n-1)+' selecionado')+'. '+promptFor(type,n));structureChanged();return;}
    const picks=measure.picks;measure.picks=[];const r=model.addMeasurement(type,picks);
    if(!r.ok){structureChanged();say(MEASURE_FAIL[r.reason]||'Não foi possível medir: '+r.reason+'.');return;}
    measure.review=r.measurement.id;if(type==='coordination')represent({neighbors:true,selectedUnitId:picks[0]},{announce:false});
    /* Tom só para a coordenação: 8 (CCC) é o grave da faixa e 12 (CFC/HC) o agudo. As outras medidas só vibram. */
    if(type==='coordination')ctx.feedback.tone(Number(r.measurement.value),{min:8,max:12});ctx.feedback.vibrate([40]);
    logEvent('Medição registrada (medida do modelo): '+TOOL_LABEL[type]+(r.measurement.parameter?' '+r.measurement.parameter:'')+' = '+displayValue(r.measurement,'Å')+'.');
    structureChanged();say(resultText(r.measurement)+' Medida do modelo.');
  }
  function measureMarks(){
    if(measure.picks.length)return {points:measure.picks.map((id,i)=>({unitId:id,label:pointLabel(measure.tool,i)})),kind:null};
    const m=model.state.measurements.find(x=>x.id===measure.review);if(!m||!MS.current(m,model.state.structure))return null;
    return {points:m.points.map((p,i)=>({site:p.site,label:pointLabel(m.type,i)})),kind:m.type==='coordination'?null:m.type,text:m.type==='coordination'?'':displayValue(m),spoken:resultText(m)};
  }
  const measureOptions=()=>({pickActive:()=>!!measure.tool&&measureAvailability().ok,onPick:pickUnit,marks:measureMarks});
  function pointsText(m){const s=model.state.structure;return m.points.map((p,i)=>{const u=s?.units.find(x=>x.id===p.unitId),info=u&&s.mode==='crystalline'?unitInfo(u.id):null;return pointLabel(m.type,i)+': '+(info?'unidade '+info.index+' ('+info.label+')':'sítio '+SILM.crystal.key(p.site));}).join(' · ');}
  function setMeasureUnit(unit){if(!UN.length[unit])return;measureView={unit};ctx.storage.set('measure.view',measureView);for(const fn of [...watchers])fn();view?.update();}
  const MEASURE_LIMITS=['As medições são realizadas sobre o modelo científico representado pelo SILM e não constituem uma medição experimental de uma amostra física real.','O zoom e o tamanho visual da estrutura não alteram suas dimensões científicas internas.','Valores de referência provenientes do banco científico são dados tabelados e não resultados medidos pelo estudante.','A montagem livre não deve ser interpretada automaticamente como uma estrutura em escala física.'];
  function measurePanel(el,local){
    const box=U.element('section',null,'silm-panel'),e=selected();box.append(U.element('p','MEDIR','eyebrow'));
    if(!e){box.append(U.element('p',noMetal('Selecione um metal e monte sua estrutura.'),'silm-panel-note'));el.append(box);return;}
    const status=U.element('p','','silm-measure-status');status.id='silm-measure-status';status.setAttribute('aria-live','polite');
    const goMeasure=SILM.actionButton('Ativar o módulo Medir',()=>ctx.modules.select('medir'),local.scope,{id:'silm-measure-module'});
    const tools=U.element('div',null,'silm-layer-list');tools.setAttribute('role','group');tools.setAttribute('aria-label','Instrumentos');
    const toolButtons=Object.keys(MS.types).map(t=>{const b=SILM.actionButton(TOOL_LABEL[t],()=>chooseTool(t),local.scope,{id:'silm-tool-'+t});tools.append(b);return [t,b];});
    const units=U.element('div',null,'silm-segmented silm-measure-units');units.setAttribute('role','group');units.setAttribute('aria-label','Unidade de comprimento');
    const unitButtons=Object.keys(UN.length).map(u=>{const b=SILM.actionButton(u,()=>setMeasureUnit(u),local.scope,{id:'silm-unit-'+(u==='Å'?'A':u),label:'Unidade: '+UN.length[u].name});units.append(b);return [u,b];});
    const cancel=SILM.actionButton('Desligar instrumento',cancelMeasure,local.scope,{id:'silm-measure-cancel'});
    const result=U.element('div',null,'silm-measure-result');result.id='silm-measure-result';
    const limits=U.element('details'),list=U.element('ul');limits.append(U.element('summary','Limitações das medições'),list);for(const t of MEASURE_LIMITS)list.append(U.element('li',t));
    box.append(status,goMeasure,tools,U.element('p','Unidade','silm-measure-label'),units,cancel,result,limits);
    const update=()=>{
      const able=measureAvailability();goMeasure.hidden=!able.module;
      for(const [t,b]of toolButtons){b.setAttribute('aria-pressed',String(measure.tool===t));b.setAttribute('aria-disabled',String(!able.ok));b.title=able.ok?'':able.reason;}
      for(const [u,b]of unitButtons)b.setAttribute('aria-pressed',String(measureView.unit===u));
      cancel.hidden=!measure.tool;
      status.textContent=!able.ok?able.reason:measure.tool?TOOL_LABEL[measure.tool]+': '+(measure.picks.length?(measure.tool==='angle'&&measure.picks.length===2?'Vértice B selecionado. ':'Ponto '+pointLabel(measure.tool,measure.picks.length-1)+' selecionado. '):'')+promptFor(measure.tool,measure.picks.length):'Escolha um instrumento e selecione os centros metálicos na estrutura (clique, toque ou Enter).';
      result.replaceChildren();const m=model.state.measurements.find(x=>x.id===measure.review)||model.state.measurements.at(-1);if(!m)return;
      const dl=U.element('dl',null,'silm-facts'),add=(k,v,kind)=>{const dd=U.element('dd',v);if(kind)dd.append(U.element('br'),tag(kind));dl.append(U.element('dt',k),dd);};
      add(TOOL_LABEL[m.type]+(m.parameter?' ('+m.parameter+')':''),displayValue(m),'Medida do modelo');add('Pontos',pointsText(m));
      if(m.type==='latticeParameter'){const lp=D.structure(e).latticeParameters[m.parameter];add('Referência · Dado tabelado',m.parameter+' = '+String(lp.display).replace('.',',')+' Å (na condição de referência)','Dado tabelado');}
      add('Resolução do instrumento virtual',m.unit==='Å'?UN.format(m.resolution,measureView.unit,{decimals:measureView.unit==='pm'?1:measureView.unit==='nm'?4:3}):m.unit==='°'?'0,1°':'1 (contagem)');
      if(!MS.current(m,model.state.structure))add('Contexto','Medição realizada em estado anterior da estrutura.');
      result.append(U.element('p','ÚLTIMA MEDIÇÃO','silm-datum-kind'),dl);
    };
    watch(local.scope,update);update();el.append(box);
  }
  function measurementsPanel(el,local){
    const box=U.element('section',null,'silm-panel');box.append(U.element('p','MEDIÇÕES','eyebrow'),U.element('p','Medidas do modelo registradas nesta investigação. Não são dados tabelados nem medição de amostra real.','silm-panel-note'));
    const list=U.element('ol',null,'silm-history silm-measurements');list.id='silm-measurements';const empty=U.element('p','','panel-empty');
    const clear=SILM.actionButton('Limpar medições',async()=>{if(!model.state.measurements.length)return;if(!await confirmDestructive('Limpar medições?','As medições registradas serão removidas. A estrutura e a investigação continuam.','Limpar medições'))return;model.clearMeasurements();measure.review=null;logEvent('Medições removidas (estrutura mantida).');structureChanged();say('Medições removidas. A estrutura continua.');},local.scope,{id:'silm-measurements-clear',danger:true});
    box.append(empty,list,clear);
    const update=()=>{const ms=model.state.measurements;empty.textContent=ms.length?'':'Nenhuma medição registrada.';empty.hidden=!!ms.length;clear.hidden=!ms.length;
      list.replaceChildren(...ms.map(m=>{const li=U.element('li',null,'silm-measurement'),t=U.element('time',new Date(m.createdAt).toLocaleTimeString('pt-BR'));t.dateTime=m.createdAt;
        li.append(t,U.element('strong',TOOL_LABEL[m.type]+(m.parameter?' ('+m.parameter+')':'')+': '+displayValue(m)),U.element('span',' · Medida do modelo · '+pointsText(m)));
        if(!MS.current(m,model.state.structure))li.append(U.element('p','Medição realizada em estado anterior da estrutura.','silm-limitation'));
        const row=U.element('div',null,'action-row');
        row.append(SILM.actionButton('Rever',()=>{if(!MS.current(m,model.state.structure)){say('Medição realizada em estado anterior da estrutura: ela não pode ser mostrada na estrutura atual.');return;}measure.tool=null;measure.picks=[];measure.review=m.id;structureChanged();say('Revendo: '+resultText(m));},local.scope,{id:'silm-meas-review-'+m.id,label:'Rever '+TOOL_LABEL[m.type]+' '+displayValue(m)}),
          SILM.actionButton('Remover',()=>{model.removeMeasurement(m.id);if(measure.review===m.id)measure.review=null;structureChanged();say('Medição removida.');},local.scope,{id:'silm-meas-remove-'+m.id,label:'Remover '+TOOL_LABEL[m.type]+' '+displayValue(m)}));
        li.append(row);return li;}));};
    watch(local.scope,update);update();el.append(box);
  }
  /* ---------- Calcular (0.10.x): fórmulas do catálogo, entradas com origem e proveniência; a operação em curso é transitória ---------- */
  const CA=SILM.calculation,calc={formula:null,choice:{},user:{},errors:{},review:null};
  const CALC_REASON={NO_STRUCTURE:'Monte e organize uma estrutura para calcular.',NO_SCALE:'A montagem livre não tem escala física: organize a estrutura cristalina para calcular.',DEFORMED:'Restaure a experiência de deformação: os cálculos usam a estrutura de referência.'};
  const CALC_FAIL={PHYSICALLY_INVALID:'Valores fisicamente impossíveis: as esferas ocupariam mais que o volume da célula.',INPUT_INVALID:'Informe um número positivo e finito.',INPUT_MISSING:'Escolha a origem de cada entrada.',RESULT_INVALID:'O resultado não é um número finito e positivo.',FORMULA_NOT_APPLICABLE:'Esta fórmula não se aplica à estrutura atual.',CALCULATIONS_LIMIT:'Limite de '+CA.limit+' cálculos: remova registros em Dados → Cálculos.'};
  const CALC_LABEL={effectiveAtoms:'Número efetivo',cellVolume:'Volume da célula',radius:'Raio (a → r)',latticeParameter:'Parâmetro (r → a)',packingFactor:'Fator de empacotamento',density:'Densidade teórica',caRatio:'Razão c/a'};
  const CALC_LIMITS=['Os cálculos usam o modelo científico representado pelo SILM (célula ideal, sem defeitos, na condição de referência dos parâmetros); não são medidas de uma amostra real.','O fator de empacotamento usa esferas rígidas: não é a fração do volume ocupada pela densidade eletrônica real.','Dados tabelados, medidas do modelo, valores informados e resultados calculados são identificados separadamente; o SILM nunca troca uma medida por um valor tabelado sem mostrar.','A diferença entre um valor calculado e uma referência não é chamada de erro experimental: decorre do modelo, do arredondamento e das condições.'];
  const SUP={'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
  const sci=v=>{if(!Number.isFinite(v))return '—';const exp=Math.floor(Math.log10(Math.abs(v))),mant=v/10**exp;return CA.sig(mant)+' × 10'+String(exp).split('').map(c=>SUP[c]).join('');};
  function calcAvailability(){if(model.state.module.active!=='calcular')return {ok:false,module:true,reason:'Os cálculos funcionam no módulo Calcular.'};const r=model.calculationAvailability();return r.ok?{ok:true}:{ok:false,reason:CALC_REASON[r.reason]||'Indisponível.'};}
  const structureType=()=>model.state.structure?.mode==='crystalline'?model.state.structure.crystallography.structureType:null;
  const calcFormulas=()=>{const t=structureType();return t?CA.applicable(t):[];};
  const calcTime=at=>new Date(at).toLocaleTimeString('pt-BR');
  /* Opções de origem para cada entrada (modo assistido: o SILM preenche o que conhece e mostra de onde veio). */
  function inputOptions(spec){
    const e=selected(),s=model.state,out=[];
    if(spec.origins.includes('TABULATED')){const t=CA.tabulated(e,spec.key);if(t)out.push({id:'tab',origin:'TABULATED',value:t.value,ref:t.ref,label:'Dado tabelado',detail:spec.symbol+' = '+t.display,note:t.note||''});}
    if(spec.origins.includes('MODEL_MEASUREMENT'))for(const m of s.measurements.filter(m=>m.type==='latticeParameter'&&m.parameter===spec.key&&MS.current(m,s.structure)).slice(-3))
     out.push({id:'meas-'+m.id,origin:'MODEL_MEASUREMENT',value:m.value,ref:{measurementId:m.id},label:'Medida do modelo',detail:spec.symbol+' = '+UN.format(m.value,'Å')+' · medição das '+calcTime(m.createdAt)});
    if(spec.origins.includes('CALCULATED')){
     if(spec.key==='n'){const t=structureType(),n=CA.effective(t);out.push({id:'calc-n',origin:'CALCULATED',value:n,ref:{formulaId:'effective-atoms-'+t.toLowerCase()},label:'Calculado pelo SILM',detail:'n = '+n+' (contagem geométrica da célula)'});}
     else for(const c of s.calculations.filter(c=>c.type===spec.quantity&&c.result.value!==null&&CA.current(c,s.structure)).slice(-3))
      out.push({id:'calc-'+c.id,origin:'CALCULATED',value:c.result.value,ref:{calculationId:c.id},label:'Calculado pelo SILM',detail:spec.symbol+' = '+CA.format(c.result,c.unit)+' · cálculo das '+calcTime(c.createdAt)});
    }
    if(spec.origins.includes('USER'))out.push({id:'user',origin:'USER',value:null,ref:null,label:'Valor informado',detail:'em '+spec.unit});
    return out;
  }
  const parseUser=text=>{const t=String(text||'').trim().replace(/\s/g,'').replace(',','.');if(!/^[+]?\d*\.?\d+(e[+-]?\d+)?$/i.test(t))return NaN;return Number(t);};
  function chooseCalc(id){const able=calcAvailability();if(!able.ok){say(able.reason);return false;}const f=SILM.formulas[id];if(!f||!calcFormulas().includes(f))return false;
    calc.formula=id;calc.choice={};calc.user={};calc.errors={};structureChanged();say(f.name+': '+f.expression+'. Escolha a origem de cada entrada e use Calcular.');return true;}
  function cancelCalc(){if(!calc.formula)return;calc.formula=null;calc.choice={};calc.user={};calc.errors={};structureChanged();say('Cálculo desligado.');}
  function calcInputs(f){
    calc.errors={};const inputs=[];
    for(const spec of f.requiredInputs){const options=inputOptions(spec),chosen=options.find(o=>o.id===calc.choice[spec.key])||options[0];
     if(!chosen){calc.errors[spec.key]='Sem valor disponível: escolha Valor informado ou calcule esta grandeza antes.';continue;}
     let value=chosen.value;if(chosen.origin==='USER'){value=parseUser(calc.user[spec.key]);if(!(Number.isFinite(value)&&value>0)){calc.errors[spec.key]='Informe um número positivo e finito, em '+spec.unit+'.';continue;}}
     inputs.push({key:spec.key,symbol:spec.symbol,name:spec.name,value,unit:spec.unit,origin:chosen.origin,ref:chosen.ref});}
    return Object.keys(calc.errors).length?null:inputs;
  }
  const spokenUnit={'Å':' ångströms','Å³':' ångströms cúbicos','g/cm³':' gramas por centímetro cúbico','1':''};
  function calcResultText(c){const f=SILM.formulas[c.formulaId],v=CA.format(c.result,c.unit);return f.name+': '+f.outputSymbol+' = '+(c.unit==='1'?v:v.replace(' '+c.unit,spokenUnit[c.unit]||' '+c.unit))+(c.type==='packingFactor'?' ('+CA.percent(c.result.value)+')':'')+'.';}
  function runCalc(){
    const able=calcAvailability();if(!able.ok){say(able.reason);return;}const f=SILM.formulas[calc.formula];if(!f)return;
    const inputs=calcInputs(f);if(!inputs){structureChanged();say('Verifique as entradas: '+Object.values(calc.errors).join(' '));return;}
    const r=model.addCalculation(f.id,inputs);if(!r.ok){structureChanged();say(CALC_FAIL[r.reason]||'Não foi possível calcular: '+r.reason+'.');return;}
    calc.review=r.calculation.id;logEvent('Cálculo registrado (calculado pelo SILM): '+f.name+' = '+CA.format(r.calculation.result,r.calculation.unit)+'.');
    structureChanged();say(calcResultText(r.calculation)+' Calculado pelo SILM.');
  }
  /* Destaque geométrico na cena, enquanto um cálculo está escolhido. */
  const CALC_MARK={effectiveAtoms:'fractions',packingFactor:'contact',radius:'contact',latticeParameter:'contact',cellVolume:'edges',density:'edges',caRatio:'edges'};
  const calcOptions=()=>({marks:()=>{const f=calc.formula&&SILM.formulas[calc.formula];if(!f||model.state.module.active!=='calcular'||measure.tool)return null;return {mode:CALC_MARK[f.quantity]};}});
  /* Valor de cada entrada como foi usado: tabelado e informado sem arredondar; calculado com 4 algarismos; constante pela sua definição. */
  function inputValue(x){const unit=x.unit==='1'?'':' '+x.unit;
   if(x.origin==='CONSTANT')return Object.values(SILM.constants).find(k=>k.key===x.key)?.display||String(x.value);
   if(Array.isArray(x.value))return '['+x.value.map(v=>String(v).replace('.',',')).join('; ')+']'+unit;
   if(Number.isInteger(x.value))return x.value+unit;
   return (x.origin==='CALCULATED'?CA.sig(x.value):String(x.value).replace('.',','))+unit;}
  function calcRecord(c,{detailed=true}={}){
    const f=SILM.formulas[c.formulaId],dl=U.element('dl',null,'silm-facts'),add=(k,v,kind)=>{const dd=U.element('dd',v);if(kind)dd.append(U.element('br'),kind);dl.append(U.element('dt',k),dd);};
    add(f.name,f.outputSymbol+' = '+CA.format(c.result,c.unit)+(c.type==='packingFactor'?' ('+CA.percent(c.result.value)+')':''),tag('Calculado pelo SILM'));
    if(c.type==='cellVolume'&&c.result.value){const v=c.result.value;add('Conversões',CA.sig(CA.convert('volume',v,'nm³'))+' nm³ · '+sci(CA.convert('volume',v,'cm³'))+' cm³ · '+sci(CA.convert('volume',v,'m³'))+' m³');}
    if(c.type==='density'){const vals=c.result.interval||[c.result.value];add('Conversões',vals.map(v=>CA.sig(CA.convert('density',v,'kg/m³'))).filter((v,i,a)=>a.indexOf(v)===i).join(' a ')+' kg/m³');}
    if(['radius','latticeParameter'].includes(c.type))add('Conversões',CA.sig(CA.convert('length',c.result.value,'pm'))+' pm · '+CA.sig(CA.convert('length',c.result.value,'nm'))+' nm');
    const formula=U.element('dd',null,'silm-formula-dd'),fx=U.element('span',f.expression,'silm-formula');fx.setAttribute('aria-hidden','true');formula.append(fx,U.element('span',f.spoken,'sr-only'));dl.append(U.element('dt','Fórmula'),formula);
    if(detailed){
     add('Entradas',c.inputs.map(x=>x.symbol+' = '+inputValue(x)+' · '+(CA.origins[x.origin]||x.origin)).join('; '));
     const r=CA.compute(c.formulaId,c.inputs);   // intermediários: mesma fórmula e mesmas entradas do registro (não é recálculo com dados novos)
     if(r.ok&&r.intermediates.length)add('Intermediários',r.intermediates.map(x=>x.symbol+' = '+(x.interval?x.interval.map(v=>sci(v)).join(' a '):x.unit==='g'||x.unit==='cm³'?sci(x.value):CA.sig(x.value))+(x.unit==='1'?'':' '+x.unit)+' ('+x.name+')').join('; '));
     add('Modelo',f.model);add('Nota',f.notes);
     /* §12: referência lado a lado quando há dado tabelado válido; a diferença não é chamada de erro experimental. */
     if(c.type==='latticeParameter'){const t=CA.tabulated(D.get(c.metalAtomicNumber),'a');if(t)add('Referência',t.display.startsWith('a')?t.display:'a = '+t.display,tag('Dado tabelado'));if(t)add('Comparação','O valor calculado e o tabelado aparecem lado a lado. A diferença vem do modelo de esferas rígidas, do arredondamento e das condições de referência; não é erro experimental.');}
     if(c.type==='caRatio'){const k=SILM.constants.idealHcpRatio;add('Referência geométrica',k.symbol+' = '+k.display+' · não é dado do metal');}
     const sources=c.provenance.references.map(id=>D.source(id)).filter(Boolean).map(x=>x.institution+' · '+x.title);if(sources.length)add('Fontes',sources.join('; '));
     if(!CA.current(c,model.state.structure))add('Contexto','Cálculo realizado em estado anterior da estrutura.');
    }
    return dl;
  }
  function calcPanel(el,local){
    const box=U.element('section',null,'silm-panel'),e=selected();box.append(U.element('p','CALCULAR','eyebrow'));
    if(!e){box.append(U.element('p',noMetal('Selecione um metal e monte sua estrutura.'),'silm-panel-note'));el.append(box);return;}
    const status=U.element('p','','silm-calc-status');status.id='silm-calc-status';status.setAttribute('aria-live','polite');
    const goCalc=SILM.actionButton('Ativar o módulo Calcular',()=>ctx.modules.select('calcular'),local.scope,{id:'silm-calc-module'});
    const list=U.element('div',null,'silm-layer-list');list.setAttribute('role','group');list.setAttribute('aria-label','Cálculos compatíveis com a estrutura');
    const form=U.element('section',null,'silm-calc-form');form.id='silm-calc-form';
    const result=U.element('div',null,'silm-calc-result');result.id='silm-calc-result';
    const limits=U.element('details'),ul=U.element('ul');limits.append(U.element('summary','Limitações dos cálculos'),ul);for(const t of CALC_LIMITS)ul.append(U.element('li',t));
    box.append(status,goCalc,list,form,result,limits);
    let rendered='';
    const renderList=()=>{const fs=calcFormulas(),key=fs.map(f=>f.id).join();if(list.dataset.key===key)return;list.dataset.key=key;
      list.replaceChildren(...fs.map(f=>SILM.actionButton(f.requiredInputs.some(x=>x.key==='c')&&f.quantity==='radius'?'Raio (a, c → r)':CALC_LABEL[f.quantity],()=>chooseCalc(f.id),local.scope,{id:'silm-calc-'+f.id,label:f.name})));};
    const renderForm=()=>{
      const f=calc.formula&&SILM.formulas[calc.formula],sig=f?f.id+'|'+model.state.calculations.length+'|'+model.state.measurements.length+'|'+(model.state.structure?.crystallography?.organizedAt||''):'';
      if(sig===rendered){for(const spec of f?.requiredInputs||[]){const err=form.querySelector('#silm-calc-error-'+spec.key);if(err)err.textContent=calc.errors[spec.key]||'';const field=form.querySelector('#silm-calc-'+spec.key+'-value');if(field)field.setAttribute('aria-invalid',String(!!calc.errors[spec.key]));}return;}
      rendered=sig;form.replaceChildren();form.hidden=!f;if(!f)return;
      const fx=U.element('p',null,'silm-formula-line'),expr=U.element('span',f.expression,'silm-formula');expr.setAttribute('aria-hidden','true');fx.append(expr,U.element('span',f.spoken,'sr-only'));
      form.append(U.element('h3',f.name),fx,U.element('p','Modelo: '+f.model+'.','silm-panel-note'));
      for(const spec of f.requiredInputs){
       const options=inputOptions(spec),fs=U.element('fieldset',null,'silm-calc-input');fs.id='silm-calc-in-'+spec.key;fs.append(U.element('legend',spec.symbol+' — '+spec.name+(spec.unit==='1'?'':' ('+spec.unit+')')));
       if(!calc.choice[spec.key]||!options.some(o=>o.id===calc.choice[spec.key]))calc.choice[spec.key]=options[0]?.id;
       const err=U.element('p','','silm-field-error');err.id='silm-calc-error-'+spec.key;
       for(const o of options){const label=U.element('label',null,'check-row silm-calc-option'),radio=U.element('input');radio.type='radio';radio.name='silm-calc-'+spec.key;radio.id='silm-calc-'+spec.key+'-'+o.id.replace(/[^a-zA-Z0-9-]/g,'');radio.checked=calc.choice[spec.key]===o.id;
        local.scope.listen(radio,'change',()=>{calc.choice[spec.key]=o.id;calc.errors[spec.key]='';user.disabled=o.origin!=='USER';if(o.origin==='USER')user.focus();});
        const text=U.element('span');text.append(U.element('strong',o.label),document.createTextNode(o.detail?' · '+o.detail:''));if(o.note)text.append(U.element('small',' '+o.note));label.append(radio,text);fs.append(label);}
       const user=U.element('input');user.type='text';user.inputMode='decimal';user.id='silm-calc-'+spec.key+'-value';user.autocomplete='off';user.value=calc.user[spec.key]||'';user.disabled=options.find(o=>o.id===calc.choice[spec.key])?.origin!=='USER';
       user.setAttribute('aria-label','Valor informado de '+spec.symbol+(spec.unit==='1'?'':' em '+spec.unit));user.setAttribute('aria-describedby',err.id);
       if(options.some(o=>o.origin==='USER')){local.scope.listen(user,'input',()=>{calc.user[spec.key]=user.value;});const row=U.element('div',null,'silm-calc-user');row.append(user,U.element('span',spec.unit==='1'?'':spec.unit,'silm-calc-unit'));fs.append(row);}
       if(!options.some(o=>o.origin!=='USER')&&spec.quantity){const pre=CA.applicable(structureType()).find(x=>x.quantity===spec.quantity);if(pre)fs.append(SILM.actionButton('Calcular '+spec.symbol+' antes',()=>chooseCalc(pre.id),local.scope,{id:'silm-calc-before-'+spec.key}));}
       fs.append(err);form.append(fs);}
      for(const k of f.constants||[]){const c=SILM.constants[k];form.append(U.element('p',c.symbol+' = '+c.display+' · Constante definida'+(c.sourceId?' ('+(D.source(c.sourceId)?.institution||c.sourceId)+')':''),'silm-panel-note'));}
      const row=U.element('div',null,'action-row');row.append(SILM.actionButton('Calcular',runCalc,local.scope,{id:'silm-calc-run',primary:true}),SILM.actionButton('Desligar cálculo',cancelCalc,local.scope,{id:'silm-calc-cancel'}));form.append(row);
    };
    const update=()=>{
      const able=calcAvailability();goCalc.hidden=!able.module;list.hidden=!able.ok;renderList();
      for(const b of list.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.id==='silm-calc-'+calc.formula));
      if(!able.ok&&calc.formula){calc.formula=null;}
      renderForm();
      const t=structureType();status.textContent=!able.ok?able.reason:calc.formula?SILM.formulas[calc.formula].name+': escolha a origem de cada entrada e use Calcular.':'Escolha um cálculo compatível com a estrutura '+(t?X.models[t].code:'')+'. Os cálculos ficam em Dados → Cálculos.';
      result.replaceChildren();const c=model.state.calculations.find(x=>x.id===calc.review)||model.state.calculations.at(-1);if(!c)return;
      result.append(U.element('p','ÚLTIMO CÁLCULO','silm-datum-kind'),calcRecord(c));
    };
    watch(local.scope,update);update();el.append(box);
  }
  function calculationsPanel(el,local){
    const box=U.element('section',null,'silm-panel');box.append(U.element('p','CÁLCULOS','eyebrow'),U.element('p','Grandezas calculadas pelo SILM nesta investigação, com fórmula, entradas e origem de cada valor. Registros antigos não são recalculados.','silm-panel-note'));
    const list=U.element('ol',null,'silm-history silm-calculations');list.id='silm-calculations';const empty=U.element('p','','panel-empty');
    const clear=SILM.actionButton('Limpar cálculos',async()=>{if(!model.state.calculations.length)return;if(!await confirmDestructive('Limpar cálculos?','Os cálculos registrados serão removidos. A estrutura, as medições e a investigação continuam.','Limpar cálculos'))return;model.clearCalculations();calc.review=null;logEvent('Cálculos removidos (estrutura e medições mantidas).');structureChanged();say('Cálculos removidos. A estrutura continua.');},local.scope,{id:'silm-calculations-clear',danger:true});
    box.append(empty,list,clear);
    const update=()=>{const cs=model.state.calculations;empty.textContent=cs.length?'':'Nenhum cálculo registrado.';empty.hidden=!!cs.length;clear.hidden=!cs.length;
      list.replaceChildren(...cs.map(c=>{const f=SILM.formulas[c.formulaId],li=U.element('li',null,'silm-calculation'),t=U.element('time',calcTime(c.createdAt));t.dateTime=c.createdAt;
        const origins=[...new Set(c.inputs.filter(x=>x.origin!=='CONSTANT').map(x=>x.symbol+': '+(CA.origins[x.origin]||x.origin)))].join('; ');
        li.append(t,U.element('strong',f.name+': '+f.outputSymbol+' = '+CA.format(c.result,c.unit)),U.element('span',' · Calculado pelo SILM'+(origins?' · '+origins:'')));
        if(!CA.current(c,model.state.structure))li.append(U.element('p','Cálculo realizado em estado anterior da estrutura.','silm-limitation'));
        const more=U.element('details',null,'silm-calc-record');more.id='silm-calc-record-'+c.id;more.append(U.element('summary','Reabrir: fórmula, entradas e origens'),calcRecord(c));
        const row=U.element('div',null,'action-row');row.append(SILM.actionButton('Remover',()=>{model.removeCalculation(c.id);if(calc.review===c.id)calc.review=null;structureChanged();say('Cálculo removido.');},local.scope,{id:'silm-calc-remove-'+c.id,label:'Remover '+f.name+' '+CA.format(c.result,c.unit)}));
        li.append(more,row);return li;}));};
    watch(local.scope,update);update();el.append(box);
  }
  /* ---------- Explorar (0.8.x): foco contextual, camadas e comparação — representação fora do estado científico ---------- */
  const EX=SILM.exploration;let exploration=EX.sanitize(null);
  function applyLayers(){if(!host)return;host.dataset.centers=exploration.layers.centers?'on':'dim';host.dataset.hints=exploration.layers.propertyHints?'on':'off';}
  function setExploration(patch){exploration=EX.sanitize({...exploration,...patch,layers:{...exploration.layers,...(patch.layers||{})}});if(ctx&&model.state.investigation)ctx.storage.set('exploration.view',exploration);applyLayers();for(const fn of [...watchers])fn();}
  const follow=focus=>setExploration({focus});   // o painel acompanha o último objeto com que o estudante interagiu
  /* ---------- Representação 2D (0.11.x): projeção e câmera — fora do estado científico, do Desfazer e do Histórico ---------- */
  const RP=SILM.representation;let representation=RP.defaults(null),representationTimer=0;
  function saveRepresentation(){if(representationTimer)clearTimeout(representationTimer);representationTimer=setTimeout(()=>{representationTimer=0;if(ctx&&model.state.investigation)ctx.storage.set('representation.view',representation);},250);}
  function resetRepresentation(){representation=RP.defaults(model.state.investigation?.id||null);if(model.state.investigation)ctx.storage.set('representation.view',representation);else ctx.storage.remove('representation.view');}
  const representationApi=Object.freeze({
    projection:()=>representation.projection,
    camera:mode=>({...representation.cameras[mode]}),
    saveCamera(mode,cam){representation.cameras[mode]=RP.sanitizeCamera(cam);saveRepresentation();},
    setProjection(p){if(!RP.PROJECTIONS.includes(p)||p===representation.projection)return;representation.projection=p;saveRepresentation();view?.update();for(const fn of [...watchers])fn();
      say('Projeção '+RP.LABELS[p].toLocaleLowerCase('pt-BR')+'. Muda só a apresentação: a estrutura e as medidas não mudam.');}
  });
  /* Fachada de leitura (testes e depuração): compõe a representação herdada do schema 8 com a da 0.11.x. */
  function representationState(){
    const s=model.state,st=s.structure,cr=st?.mode==='crystalline'?st.crystallography.representation:null,mode=cr?'crystal':'free',cam=view?.renderer?.camera||representation.cameras[mode],marks=calcOptions().marks();
    return Object.freeze({version:RP.VERSION,view:st?(cr?cr.view:'free'):null,zoom:cam.zoom,pan:{x:cam.x,y:cam.y},camera:cam.mode,projection:cr?representation.projection:null,
      layers:{unitCell:cr?.unitCell??null,neighbors:cr?.neighbors??null,labels:cr?.labels??null,centers:exploration.layers.centers,propertyHints:exploration.layers.propertyHints,electrons:!!s.electrons?.representation.visible},
      selection:cr?cr.selectedUnitId:(view?.selected??null),overlays:{measure:measure.tool||(measure.review?'review':null),calculation:marks?.mode||null}});
  }
  function structureBlock(container,scope,e){
    const body=U.element('div'),limits=U.element('details'),list=U.element('ul');limits.append(U.element('summary','Limitações do modelo'),list);for(const t of LIMITS)list.append(U.element('li',t));
    const sources=U.button('Fontes destes dados',()=>openSources(e),scope,{id:'silm-observe-sources'});container.append(body,sources,limits);
    const update=()=>{
      body.replaceChildren();const s=model.state.structure,dl=U.element('dl',null,'silm-facts silm-crystal-facts'),add=(n,v,kind)=>{const dd=U.element('dd',v);if(kind)dd.append(U.element('br'),tag(kind));dl.append(U.element('dt',n),dd);};
      sources.hidden=limits.hidden=!s||s.mode!=='crystalline';
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
      body.append(dl);
    };
    watch(scope,update);update();
  }
  /* Centro metálico selecionado: elemento, posição na célula e vizinhança. */
  function unitBlock(container,scope,e){
    const body=U.element('div');container.append(body);
    const update=()=>{
      body.replaceChildren();const s=model.state.structure;if(s?.mode!=='crystalline'||!s.crystallography.representation.selectedUnitId){body.append(U.element('p','Selecione uma unidade na estrutura cristalina.','silm-panel-note'));return;}
      const r=s.crystallography.representation,u=s.units.find(x=>x.id===r.selectedUnitId),g=geometry(),info=unitInfo(u.id),n=g.neighbors(u.site),dl=U.element('dl',null,'silm-facts'),add=(k,v,kind)=>{const dd=U.element('dd',v);if(kind)dd.append(U.element('br'),tag(kind));dl.append(U.element('dt',k),dd);};
      body.append(U.element('p','CENTRO METÁLICO','silm-datum-kind'),U.element('h3','Unidade '+info.index+' · '+e.symbol));
      add('Posição na célula',info.label+(u.placement==='crystallographic'?' (completada pelo SILM)':' (unidade do estudante)'),'Resultado do modelo cristalográfico');
      add('Elemento',e.name+' · Z = '+e.atomicNumber+' · '+e.electronConfiguration.display,'Dado tabelado');
      add('Número de coordenação',String(s.crystallography.coordination),'Resultado do modelo cristalográfico');
      add('Vizinhos imediatos',n.list.length+' à distância de '+n.distances[0].toFixed(3).replace('.',',')+' Å'+(n.distances.length>1?' (e '+n.distances.slice(1).map(d=>d.toFixed(3).replace('.',',')).join(', ')+' Å)':''),'Calculado pelo SILM a partir dos parâmetros de rede tabelados');
      add('Destaque',r.neighbors?'Vizinhos destacados na cena (halo pontilhado)':'Use Vizinhos para destacá-los na cena');
      body.append(dl,U.element('p','O centro metálico representa o núcleo com os elétrons internos; não há pares M—M: a coesão é coletiva.','silm-limitation'));
    };
    watch(scope,update);update();
  }
  function synthesisBlock(container,scope,e){
    const body=U.element('div');container.append(body);
    const update=()=>{const st=model.state,s=st.structure,dl=U.element('dl',null,'silm-facts'),add=(k,v)=>dl.append(U.element('dt',k),U.element('dd',v));body.replaceChildren();
      body.append(U.element('p','SÍNTESE DA INVESTIGAÇÃO','silm-datum-kind'),U.element('h3',e.symbol+' · '+e.name));
      add('Módulo',moduleName());add('Estrutura',structureLine());add('Elétrons',st.electrons?(st.electrons.representation.visible?'Visíveis (representação qualitativa)':'Ocultos; modelo ativo'):'Modelo não ativado');
      add('Propriedade',st.properties.active?propertyTitle()+' em estudo':'Nenhuma experiência ativa');add('Cristalografia',crystalLine(e));
      body.append(dl,U.element('p',s?'Escolha um foco para observar um objeto científico: centro, '+(s.mode==='crystalline'?'célula':'montagem')+', elétrons ou propriedade.':'Monte uma estrutura para começar a observar.','silm-panel-note'));};
    watch(scope,update);update();
  }
  function observePanel(el,local){
    const box=U.element('section',null,'silm-panel'),e=selected();box.id='silm-structure-summary';
    if(!e){box.append(U.element('h3','Nada para observar'),U.element('p',noMetal('Selecione um metal e monte sua estrutura.')));el.append(box);return;}
    const bar=U.element('div',null,'silm-focus');bar.id='silm-focus';bar.setAttribute('role','group');bar.setAttribute('aria-label','Foco da observação');
    const body=U.element('div',null,'silm-observe-body');body.id='silm-observe-body';box.append(bar,body);
    const buttons=new Map();let bodyScope=null,shown=null;local.scope.cleanup(()=>{bodyScope?.destroy();bodyScope=null;});
    for(const o of EX.focusOptions(model.state)){const b=SILM.actionButton(o.label,()=>{const opt=EX.focusOptions(model.state).find(x=>x.id===o.id);if(opt.available)setExploration({focus:o.id});else SimCore.notifications.announce(opt.reason);},local.scope,{id:'silm-focus-'+o.id});b.dataset.focus=o.id;buttons.set(o.id,b);bar.append(b);}
    const render=focus=>{bodyScope?.destroy();bodyScope=SimCore.createScope();body.replaceChildren();const scope=bodyScope;
      if(focus==='synthesis')synthesisBlock(body,scope,e);else if(focus==='unit')unitBlock(body,scope,e);
      else if(focus==='structure'){structureBlock(body,scope,e);propertySection(body,{scope},e);}
      else if(focus==='electrons')electronSection(body,{scope},e);else if(focus==='property')propertySection(body,{scope},e);};
    const update=()=>{const opts=EX.focusOptions(model.state),focus=EX.resolveFocus(exploration,model.state),mode=model.state.structure?.mode||'none';
      for(const o of opts){const b=buttons.get(o.id);b.textContent=o.label;b.setAttribute('aria-pressed',String(o.id===focus));b.setAttribute('aria-disabled',String(!o.available));b.title=o.available?'':o.reason;}
      if(focus+':'+mode!==shown){shown=focus+':'+mode;render(focus);}};
    watch(local.scope,update);update();el.append(box);
  }
  /* Camadas: reutilizam os estados existentes (0.5.x, 0.6.x); só centros e indicações são da exploração. */
  function layersPanel(el,local){
    const box=U.element('section',null,'silm-panel'),e=selected();box.append(U.element('p','CAMADAS','eyebrow'));
    if(!e||!model.state.structure){box.append(U.element('p','Monte uma estrutura para escolher camadas.','silm-panel-note'));el.append(box);return;}
    const status=U.element('p','','silm-panel-note');status.id='silm-layers-status';status.setAttribute('aria-live','polite');
    const list=U.element('div',null,'silm-layer-list');list.setAttribute('role','group');list.setAttribute('aria-label','Camadas da cena');box.append(list,status);
    const rep=()=>model.state.structure?.crystallography?.representation;
    const defs=[
      {id:'centers',label:'Centros metálicos',on:()=>exploration.layers.centers,run:()=>{setExploration({layers:{centers:!exploration.layers.centers}});say(exploration.layers.centers?'Centros metálicos em destaque.':'Centros metálicos esmaecidos; continuam selecionáveis.');}},
      {id:'cell',label:'Célula unitária',when:crystalline,on:()=>rep().unitCell,run:()=>represent({unitCell:!rep().unitCell})},
      {id:'lattice',label:'Rede extensa',when:crystalline,on:()=>rep().view==='lattice',run:()=>represent({view:rep().view==='lattice'?'cell':'lattice'})},
      {id:'neighbors',label:'Vizinhos',when:crystalline,on:()=>rep().neighbors,run:()=>toggleNeighbors()},
      {id:'electrons',label:'Elétrons',on:()=>!!model.state.electrons?.representation.visible,run:()=>model.state.electrons?.representation.visible?hideElectrons():showElectrons(),able:()=>electronAvailability()},
      {id:'labels',label:'Rótulos das posições',when:crystalline,on:()=>rep().labels,run:()=>represent({labels:!rep().labels})},
      {id:'hints',label:'Indicações da propriedade',when:()=>!!model.state.properties.active,on:()=>exploration.layers.propertyHints,run:()=>{setExploration({layers:{propertyHints:!exploration.layers.propertyHints}});say(exploration.layers.propertyHints?'Indicações da propriedade visíveis.':'Indicações da propriedade ocultas; o estado da experiência continua no texto.');}}
    ];
    const buttons=defs.map(d=>{const b=SILM.actionButton(d.label,d.run,local.scope,{id:'silm-layer-'+d.id});list.append(b);return [d,b];});
    // 0.11.x: projeção da estrutura cristalina (representação; a mesma escolha do seletor da cena).
    const projLabel=U.element('p','Projeção','silm-measure-label'),projList=U.element('div',null,'silm-segmented silm-projection-list');projList.setAttribute('role','group');projList.setAttribute('aria-label','Projeção da estrutura');
    const projNote=U.element('p','Muda só a apresentação: a estrutura, as medidas e os cálculos não mudam.','silm-panel-note');
    const projButtons=RP.PROJECTIONS.map(id=>{const b=SILM.actionButton(RP.LABELS[id],()=>representationApi.setProjection(id),local.scope,{id:'silm-projection-'+id});projList.append(b);return [id,b];});
    box.append(projLabel,projList,projNote);
    const update=()=>{const visible=[];const cr=crystalline();projLabel.hidden=projList.hidden=projNote.hidden=!cr;for(const [id,b]of projButtons)b.setAttribute('aria-pressed',String(representation.projection===id));for(const [d,b]of buttons){const show=!d.when||d.when();b.hidden=!show;if(!show)continue;const on=!!d.on(),able=d.able?d.able():{ok:true};b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-disabled',String(!on&&!able.ok));b.title=!on&&!able.ok?able.reason:'';if(on)visible.push(d.label.toLocaleLowerCase('pt-BR'));}
      status.textContent='Camadas visíveis: '+(visible.length?visible.join(', '):'nenhuma')+'.';};
    watch(local.scope,update);update();el.append(box);
  }
  /* Comparação qualitativa: variantes somente leitura do snapshot, desenhadas pelo renderizador derivado. */
  function openComparison(){
    const mode=EX.compareModes(model.state).find(m=>m.id===exploration.compare);if(!mode?.available){say(mode?mode.reason:'Escolha um modo de comparação.');return;}
    const e=selected(),{a,b}=EX.variants(mode.id,model.snapshot()),scope=SimCore.createScope(),content=U.element('div',null,'silm-compare'),narrow=window.innerWidth<720;
    content.dataset.layout=narrow?'ab':'side';content.append(U.element('p','Comparação qualitativa · cenas derivadas, somente leitura. O estado da investigação não muda.','silm-panel-note'));
    const panes=U.element('div',null,'silm-compare-panes');
    let toggle=null;if(narrow){toggle=U.element('div',null,'silm-segmented');toggle.setAttribute('role','group');toggle.setAttribute('aria-label','Mostrar cena');content.append(toggle);}
    content.append(panes);
    const projection=representation.projection,A=SILM.renderSnapshot(panes,{scope,state:a,element:e,label:'A: '+mode.a,projection}).root,B=SILM.renderSnapshot(panes,{scope,state:b,element:e,label:'B: '+mode.b,projection}).root;
    if(narrow){const show=side=>{A.hidden=side!=='a';B.hidden=side!=='b';ba.setAttribute('aria-pressed',String(side==='a'));bb.setAttribute('aria-pressed',String(side==='b'));};
      const ba=SILM.actionButton('A: '+mode.a,()=>show('a'),scope,{id:'silm-compare-show-a'}),bb=SILM.actionButton('B: '+mode.b,()=>show('b'),scope,{id:'silm-compare-show-b'});toggle.append(ba,bb);show('a');}
    const handle=ctx.modal.open({title:'Comparar: '+mode.label,content,size:'wide',actions:[{id:'close',label:'Fechar'}]});
    (handle?.result||Promise.resolve()).then(()=>scope.destroy(),()=>scope.destroy());
  }
  function comparePanel(el,local){
    const box=U.element('section',null,'silm-panel'),e=selected();box.append(U.element('p','COMPARAR','eyebrow'));
    if(!e||!model.state.structure){box.append(U.element('p','Monte uma estrutura para comparar representações.','silm-panel-note'));el.append(box);return;}
    box.append(U.element('p','Compare duas representações do mesmo metal, sem alterar a investigação. Não é comparação entre metais.','silm-panel-note'));
    const list=U.element('div',null,'silm-compare-list');list.setAttribute('role','group');list.setAttribute('aria-label','Modo de comparação');box.append(list);
    const items=EX.compareModes(model.state).map(m=>{const b=SILM.actionButton(m.label,()=>{const cur=EX.compareModes(model.state).find(x=>x.id===m.id);if(cur.available)setExploration({compare:m.id});else say(cur.reason);},local.scope,{id:'silm-compare-'+m.id});
      const r=U.element('span','','silm-property-reason');r.id='silm-compare-reason-'+m.id;b.setAttribute('aria-describedby',r.id);const item=U.element('div',null,'silm-property-item');item.append(b,r);list.append(item);return [m.id,b,r];});
    const open=SILM.actionButton('Abrir comparação',openComparison,local.scope,{id:'silm-compare-open',primary:true});box.append(open);
    const update=()=>{const modes=EX.compareModes(model.state);for(const [id,b,r]of items){const m=modes.find(x=>x.id===id);b.setAttribute('aria-pressed',String(exploration.compare===id));b.setAttribute('aria-disabled',String(!m.available));r.textContent=m.available?'A: '+m.a+' · B: '+m.b:m.reason;}
      const cur=modes.find(x=>x.id===exploration.compare);open.setAttribute('aria-disabled',String(!cur?.available));};
    watch(local.scope,update);update();el.append(box);
  }
  /* ---------- Dados: tabela, histórico e relatório ---------- */
  function tablePanel(el,local){
    const box=U.element('section',null,'silm-panel'),e=selected();
    if(!e){box.append(U.element('h3','Nenhum metal selecionado'),U.element('p','Explore a Tabela Periódica e escolha um metal disponível. Os dados possuem referências locais e fontes rastreáveis.'));el.append(box);return;}
    const ref=D.structure(e),facts=U.element('dl',null,'silm-facts');box.append(U.element('p','DADO TABELADO','silm-datum-kind'),U.element('h3',e.name+' · '+e.symbol));
    const add=(name,value)=>facts.append(U.element('dt',name),U.element('dd',value));
    add('Número atômico',String(e.atomicNumber));add(e.atomicWeight.form==='massNumber'?'Número de massa (convenção IUPAC)':'Peso atômico padrão (adimensional)',e.atomicWeight.display);add('Posição periódica','Grupo '+(e.group??'não atribuído à série')+' · período '+e.period+' · bloco '+e.block);add('Configuração eletrônica · átomo neutro',e.electronConfiguration.display);add('Estrutura de referência',ref.label+' · '+ref.phaseLabel);add('Temperatura de referência',ref.conditions.temperature.display);add('Cristalografia no SILM',crystalLine(e));add('Propriedades (dados tabelados)','Condutividade elétrica e térmica não homologadas no banco nesta versão; nenhum valor típico é exibido.');box.append(facts);
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
  function teacherResources(el,local){const box=U.element('section',null,'silm-teacher-resource');box.id='teacher-periodic-resource';const text=U.element('div');text.append(U.element('p','RECURSO PEDAGÓGICO','eyebrow'),U.element('h2','Tabela Periódica'),U.element('p','Visualize e explore os 118 elementos em formato ampliado para apresentação à turma.'));const open=U.button('Abrir Tabela Periódica',()=>presentation.open({opener:open}),local.scope,{id:'teacher-periodic-open',primary:true});box.append(text,open);el.append(box);}
  function reportText(){
    const state=model.snapshot(),e=selected(),i=state.investigation;if(!(e&&i))return 'SILM '+VERSION+' · Nenhuma investigação científica ativa; não há medidas ou cálculos científicos.';
    const s=state.structure;let structure='Estrutura ainda não montada.';
    if(s?.mode==='free')structure='Montagem livre (representação didática): '+s.units.length+' '+(s.units.length===1?'unidade':'unidades')+'; ainda não representa a geometria cristalográfica nem distâncias reais.';
    if(s?.mode==='crystalline'){const m=X.models[s.crystallography.structureType],added=s.units.filter(u=>u.placement==='crystallographic').length;structure='Estrutura organizada segundo a referência: '+X.label(m.id)+'; '+s.units.length+' unidades ('+(s.units.length-added)+' do estudante, '+added+' completadas pelo SILM). Número de coordenação do modelo: '+s.crystallography.coordination+'. Representação didática com esferas reduzidas, sem escala física absoluta.';}
    const el=state.electrons,electrons=el?' Modelo eletrônico ativo (representação qualitativa): elétrons de valência deslocalizados pela estrutura metálica, '+(el.representation.visible?'visíveis':'ocultos')+'; os marcadores não indicam o número real de elétrons e o movimento visual não representa corrente.':' Modelo eletrônico não ativado.';
    const pr=state.properties,pn=pr.active?PR.narrative(pr.active,pr[pr.active],{reduced:reducedMotion(),electronsVisible:!!el?.representation.visible}):null,properties=pr.active?' Experiência de propriedade em estudo: '+PR.catalog[pr.active].title+' (representação qualitativa). '+pn.action+' '+pn.observation+' Dados tabelados de propriedades não homologados nesta versão.':' Nenhuma experiência de propriedade ativa.';
    const cs=state.calculations,calculations=cs.length?' Cálculos (calculados pelo SILM): '+cs.map(c=>SILM.formulas[c.formulaId].name+' '+SILM.formulas[c.formulaId].outputSymbol+' = '+CA.format(c.result,c.unit)+' ['+[...new Set(c.inputs.filter(x=>x.origin!=='CONSTANT').map(x=>x.symbol+': '+(CA.origins[x.origin]||x.origin)))].join('; ')+']').join('; ')+'.':' Nenhum cálculo registrado.';
    const ms=state.measurements,measurements=ms.length?' Medições (medidas do modelo, não de amostra real): '+ms.map(m=>TOOL_LABEL[m.type]+(m.parameter?' '+m.parameter:'')+' = '+displayValue(m,'Å')).join('; ')+'.':' Nenhuma medição registrada.';
    return 'SILM '+VERSION+' · ID: '+i.id+' · '+e.name+' ('+e.symbol+'), Z = '+e.atomicNumber+' · Início: '+i.createdAt+' · Módulo ativo: '+(ctx.modules.get(state.module.active)?.title||state.module.active)+'. Dado tabelado: '+D.structure(e).label+'; '+D.structure(e).conditions.temperature.display+'. Fonte: '+D.source(D.structure(e).sourceId).title+'. '+structure+electrons+properties+measurements+calculations;
  }
  return {
    manifest:{id:'silm',nome:'SILM',nomeCurto:'SILM',versao:VERSION,titulo:'SILM — A Arquitetura dos Metais',subtitulo:'Simulador Interativo de Ligações Metálicas',icone:icon,
      tema:{
        dark:{background:'#16181c',surface:'#1f2329',primary:'#c7a54a',onPrimary:'#16181c',secondary:'#b6bdc7',text:'#f2f1ec',border:'#59616d',accent:'#dcc074',scientificAccent:'#4fc3f7',textAccent:'#dcc074'},
        light:{background:'#f5f3ee',surface:'#fffefa',primary:'#725416',onPrimary:'#fffefa',secondary:'#505762',text:'#20252c',border:'#8d8980',accent:'#725416',scientificAccent:'#006a91',textAccent:'#725416'}
      },
      manual:SILM.manual,viewport:{label:'Área de investigação da estrutura metálica'},
      // Paridade com o SIAB 1.0.0 (correção de origem 0.1.x): Montagem / Ver / Dados.
      painelEsquerdo:{title:'Montagem',icon:'setup',tabsLabel:'Preparação da investigação',help:{topic:'interface',label:'Ajuda: Montagem'},
        summary:{title:'Resumo',render:summaryPanel},
        groups:[{id:'metal',title:'Metal',heading:'Escolha do metal',icon:'grid',visible:context=>!context?.restricted,render:metalPanel},{id:'estrutura',title:'Estrutura',heading:'Montagem da estrutura',icon:'objects',editable:true,render:structurePanel},{id:'propriedades',title:'Propriedades',heading:'Experiências de propriedades',icon:'meter',render:propertiesPanel},{id:'modulo',title:'Módulo',heading:'Módulos de investigação',icon:'module',render:(el,local)=>local.modules.render(el,local)}],defaultGroup:'estrutura'},
      painelDireito:{title:'Ver',heading:'Investigar',icon:'view',help:{topic:'interface',label:'Ajuda: painel Ver'},families:[
        {id:'observar',title:'Observar',icon:'observe',items:[{id:'observar',title:'Síntese',presentation:'standard',render:observePanel},{id:'camadas',title:'Camadas',presentation:'compact',render:layersPanel}]},
        {id:'medir',title:'Medir',icon:'measure',items:[{id:'medir',title:'Instrumentos',presentation:'standard',render:measurePanel}]},
        {id:'analisar',title:'Analisar',icon:'analyze',items:[{id:'comparar',title:'Comparar',presentation:'wide',render:comparePanel},{id:'calcular',title:'Calcular',presentation:'standard',render:calcPanel}]}],
        data:{title:'Dados',heading:'Dados da investigação',icon:'data',intro:'Consulte medições, cálculos, o histórico e os dados de referência do metal.',tools:[{id:'medicoes',title:'Medições',presentation:'wide',render:measurementsPanel},{id:'calculos',title:'Cálculos',presentation:'wide',render:calculationsPanel},{id:'historico',title:'Histórico',presentation:'wide',render:historyPanel},{id:'tabela',title:'Dados do metal',presentation:'wide',render:tablePanel}],
          report:{title:'Relatório',text:'Estado da investigação, dados tabelados e seus textos.',action:{label:'Abrir relatório',run:()=>ctx.screens.navigate('relatorios')}}}},
      recursos:['domain/entry.js','domain/silm/prelude.js','domain/silm/data/bundle.js','domain/silm/data-api.js','domain/silm/periodic-table.js','domain/silm/presentation.js','domain/silm/periodic-table.css','domain/silm/assembly.js','domain/silm/crystal.js','domain/silm/state.js','domain/silm/representation.js','domain/silm/renderer-2d.js','domain/silm/assembly-view.js','domain/silm/crystal-view.js','domain/silm/electron-view.js','domain/silm/properties.js','domain/silm/property-view.js','domain/silm/exploration.js','domain/silm/measurements.js','domain/silm/calculations.js','domain/silm/measure-view.js','domain/silm/assembly.css','domain/silm/bootstrap.js','domain/silm/manual.js','domain/silm/styles.css','domain/silm/identidade.css','domain/silm/abertura.js','domain/silm/abertura.css','domain/silm/abertura/silm-opening.js','domain/silm/abertura/silm-opening.css','assets/silm-icone.svg','assets/silm-logo-vertical.svg',icon]
    },
    init(context) {
      ctx=context;model.connect({storage:ctx.storage,emit:(name,detail)=>ctx.events.emit(name,detail)});
      let restoration=model.load();
      if(restoration.empty){const session=ctx.storage.get('experience.session',null),legacy=session?.sessionId&&ctx.storage.get('scientific.session.'+session.sessionId,null);if(legacy)restoration=model.restore(legacy);}
      if(!restoration.ok)ctx.notify('A investigação anterior não pôde ser restaurada. Selecione um metal para iniciar outra.',{type:'warning'});
      exploration=EX.sanitize(model.state.investigation?ctx.storage.get('exploration.view',null):null);
      representation=RP.sanitize(model.state.investigation?ctx.storage.get('representation.view',null):null,model.state.investigation?.id||null);
      {const u=ctx.storage.get('measure.view',null)?.unit;measureView={unit:UN.length[u]?u:'Å'};}
      showTable=!selected();restoringModule=!!selected()&&model.state.module.active!=='explorar';
      presentation=SILM.createPresentation(ctx,{onInvestigate:investigate,onSources:renderSources,canInvestigate:canTeacherInvestigate});SILM.presentationSelection=presentation.state;ctx.scope.cleanup(()=>{viewScope?.destroy();viewScope=null;delete SILM.presentationSelection;});
      Object.defineProperty(SILM,'scientificState',{configurable:true,get:()=>model.snapshot()});
      Object.defineProperty(SILM,'representationState',{configurable:true,get:()=>representationState()});ctx.scope.cleanup(()=>{delete SILM.representationState;if(representationTimer){clearTimeout(representationTimer);representationTimer=0;if(model.state.investigation)ctx.storage.set('representation.view',representation);}});
      ctx.scope.cleanup(()=>{delete SILM.scientificState;});
      ctx.experience.configure({
        home:{title:'A Arquitetura',titleAccent:'dos Metais',motto:'Observe. Monte. Meça. Interprete.',featured:'laboratorio',primary:[
          {id:'laboratorio',title:'Laboratório',tag:'Investigação livre',invite:'Explore na prática',cta:'Entrar no laboratório',description:'Monte a estrutura metálica e observe sua organização cristalina em Explorar, Medir e Calcular.',icon:'lab',destination:'laboratorio',decoration:node=>{for(const c of ['#b87333','#c7a54a','#a8a9ad','#8c7853','#dcc074'])node.append(Object.assign(document.createElement('i'),{style:'background:'+c}));}},
          {id:'aprender',title:'Aprender',description:'Conheça os temas da ligação metálica e investigue cada um no laboratório.',icon:'learn',destination:'aprender'},
          {id:'missoes',title:'Missões',description:'Experimente o fluxo de evidências e conclusão em uma demonstração.',icon:'mission',destination:'missoes'},
          {id:'roteiros',title:'Roteiros Experimentais',description:'Percorra a interface com um roteiro demonstrativo.',icon:'routes',destination:'roteiros'}
        ],support:[{id:'manual',title:'Manual de uso',destination:'manual'},{id:'professor',title:'Área do Professor',destination:'professor'}]},
        accessibility:{colorNote:'Camadas, estados e medidas também são descritos em texto.'},
        feedback:{sound:{label:'Som das medições',hint:'Coordenação: tom grave para 8 (CCC), agudo para 12 (CFC e HC)',preview:.5},haptics:{label:'Vibrar ao registrar medição',hint:'Em celulares compatíveis'}},
        tour:{title:'Tour do laboratório',welcome:{title:'Primeira vez no laboratório?',text:'O tour mostra a Tabela Periódica, a Montagem, o painel Ver e os Dados. Consulte também o Manual.',manualTopic:'interface'},steps:[
          {target:'#scientific-viewport',title:'Escolha um metal',text:'Na Tabela Periódica, toque num metal disponível (borda dourada) e use Iniciar investigação.'},
          {target:'#controls',mobileTarget:'#workspace-left',open:{side:'left',option:'estrutura'},title:'Monte a estrutura',text:'Em Montagem → Estrutura, inicie a montagem, adicione unidades e organize a estrutura cristalina de referência.'},
          {target:'#controls',mobileTarget:'#workspace-left',open:{side:'left',option:'modulo'},title:'Escolha um módulo',text:'Explorar, Medir e Calcular: cada módulo é uma forma de investigar a mesma estrutura.'},
          {target:'#context-panel',mobileTarget:'#workspace-right',open:{side:'right'},title:'Observe, meça e analise',text:'Em Ver, use Observar, Medir e Analisar. As medidas são do modelo, não de uma amostra real.'},
          {target:'#workspace-right-alt',title:'Consulte os dados',text:'Em Dados ficam Medições, Cálculos, Histórico, Dados do metal e o Relatório.'}]},
        presets:[['cobre-cfc','Cobre · CFC',29,'Comece pela estrutura cúbica de face centrada do cobre.',['Observe a célula unitária e a vizinhança de um centro.','Meça a distância entre vizinhos mais próximos.']],['ferro-ccc','Ferro · CCC',26,'Comece pela estrutura cúbica de corpo centrado do ferro α.',['Compare a coordenação com a do cobre.','Calcule o fator de empacotamento.']],['magnesio-hc','Magnésio · HC',12,'Comece pela estrutura hexagonal compacta do magnésio.',['Meça os parâmetros a e c.','Calcule a razão c/a e compare com o valor ideal.']]].map(([id,title,z,objective,steps])=>({id,title,objective,module:'explorar',meta:'Estrutura cristalina',facts:['Dados de referência do banco do SILM','Célula unitária completa'],steps,apply:()=>preset(z),notice:'Montagem pronta: '+title+'.',confirm:()=>model.state.investigation?{title:'Iniciar uma nova investigação?',text:'A investigação atual será encerrada. Seus dados científicos (estrutura, medições e cálculos) serão substituídos por esta montagem; os textos de relatório permanecem salvos.',label:'Iniciar nova investigação'}:null})),
        notebook:{enabled:false},modulePanel:false,
        // Os grupos do SILM continuam na Montagem durante atividades (em atividade restrita, sem Metal); a atividade fica no Menu.
        activityPanel:false,
        navigation:{desktop:[{id:'inicio',label:'Início',icon:'home'},{id:'aprender',label:'Aprender',icon:'learn'},{id:'missoes',label:'Missões',icon:'mission'},{id:'roteiros',label:'Roteiros Experimentais',icon:'routes'},{id:'laboratorio',label:'Laboratório',icon:'lab'},{id:'manual',label:'Manual',icon:'manual'}],mobile:[{id:'inicio',label:'Início',icon:'home'},{id:'aprender',label:'Aprender',icon:'learn'},{id:'laboratorio',label:'Laboratório',icon:'lab'},{id:'missoes',label:'Missões',icon:'mission'}]},
        shell:{startup:{tagline:'A Arquitetura dos Metais',destinations:[{id:'inicio',label:'Página inicial',description:'Explore temas, missões e roteiros.',icon:'home'},{id:'aprender',label:'Aprender',description:'Comece pelos temas da ligação metálica.',icon:'learn'},{id:'laboratorio',label:'Laboratório',description:'Vá direto para a investigação livre.',icon:'lab'}]},
          now:(route,{activity}={})=>route.id==='laboratorio'?{detail:[activity?.title,selected()?.name||(activity?null:'Investigação livre'),moduleName()].filter(Boolean).join(' · ')}:null},
        themes:{items:[['ligacao-metalica','Ligação metálica',29,'investiga o cobre'],['estrutura','Estrutura',26,'investiga o ferro (CCC)'],['eletrons','Elétrons',11,'investiga o sódio'],['propriedades','Propriedades',29,'investiga o cobre']].map(([id,title,z,hint])=>({id,title,subtitle:'Ponto de entrada · '+hint,description:'Este tema apresenta um ponto de entrada. O conteúdo científico será incorporado nas etapas próprias do SILM.',icon:'learn',investigate:{label:'Investigar no Laboratório',run:()=>themeInvestigate(z)},related:{content:[{title:'Sobre o SILM',destination:'manual',parameter:'sobre-silm'}],investigations:[],routes:['percurso-interface'],missions:[]}}))},
        modules:modules.map(m=>({...m,controls(el){el.append(U.element('p',moduleMessage(m.id),'panel-empty'));}})),
        resources:[],
        routes:[{id:'percurso-interface',title:'Um percurso pelo SILM',subtitle:'Demonstração interna de interface · sem experimento científico',module:'explorar',description:'Conheça a navegação e os painéis.',objective:'Reconhecer os controles do Laboratório e o acesso ao relatório.',procedure:['Abra Montagem e consulte o Resumo.','Em Montagem → Módulo, consulte Explorar.','Abra Ver e depois Dados → Relatório.','Retorne ao Laboratório pelo botão Voltar.'],requirements:['Mouse, toque ou teclado.'],help:{instructions:'Este roteiro demonstra somente o funcionamento da interface.',tips:['Use Fechar ou Escape para recolher os painéis.'],explanations:'Nenhum metal, instrumento ou resultado científico está ativo.',manualTopic:'interface'},navigation:'free',initialState:{schemaVersion:1}}],
        missions:[{id:'revisar-registro',title:'Revisar um registro',subtitle:'Demonstração interna de interface · sem conteúdo científico',module:'medir',objective:'Experimentar o registro e a conclusão de uma atividade restrita.',problem:'Como distinguir concluir uma atividade de encerrar seu contexto?',conditions:['Preencha evidência e conclusão com uma observação sobre a interface.'],evidence:['Um registro textual da navegação.'],help:{instructions:'Use Concluir missão no Menu da atividade para preencher Evidências registradas e Conclusão e concluir.',tips:['O relatório continua acessível depois de concluir.'],explanations:'Concluir preserva a atividade. Encerrar atividade libera a navegação e retoma o Laboratório Livre.',manualTopic:'atividades'},navigation:'restricted',restrictions:{resources:[]},initialState:{schemaVersion:1},validate({fields}){return String(fields.evidence||'').trim()&&String(fields.conclusion||'').trim()?{ok:true}:{ok:false,message:'Preencha evidência e conclusão para concluir esta demonstração.'};}}],
        teacher:true,teacherResources,
        about:{description:'A Arquitetura dos Metais · SILM '+VERSION+'. Banco científico, investigação persistente, montagem da estrutura metálica, estruturas cristalinas CCC, CFC e HC modelo eletrônico qualitativo e propriedades metálicas investigáveis.',modelTitle:'Modelo científico',model:'O banco apresenta 118 elementos e dados documentados. A investigação tem estado científico único. A montagem livre é uma representação didática de construção coletiva. A organização cristalográfica reorganiza a montagem segundo a estrutura de referência registrada no banco (CCC, CFC ou HC); a representação cristalográfica é um modelo didático da organização periódica do sólido metálico, a célula unitária é a unidade repetitiva da rede e não uma molécula, e não há linhas de ligação M—M. O modelo eletrônico representa, de forma qualitativa, centros metálicos positivos envolvidos por elétrons de valência deslocalizados pela estrutura inteira: os pontos não são contagem de elétrons e o movimento sem campo não é corrente elétrica. As propriedades (condutividade elétrica e térmica, maleabilidade, ductilidade e brilho) são experiências qualitativas sobre a mesma estrutura, com elegibilidade por metal; valores tabelados só com fonte. O módulo Medir produz medidas do modelo (distância, ângulo, parâmetro de rede e coordenação) a partir das coordenadas científicas, nunca da tela. O módulo Calcular relaciona estrutura e dados (número efetivo, volume da célula, raio e parâmetro de rede (r ↔ a), fator de empacotamento, densidade teórica e c/a), com fórmula, entradas e a origem de cada valor. O símbolo e a abertura representam organização coletiva e fluxo deslocalizado de forma qualitativa; não representam trajetórias ou quantidades literais de elétrons.',manualTopic:'sobre-silm',licenses:['SILM: GNU GPL v3. Veja LICENSE na distribuição.','dialog-polyfill: licença BSD preservada em vendor/dialog-polyfill/LICENSE.']},
        references:[{id:'contrato-silm',type:'tecnica',title:'Contrato de desenvolvimento do SILM',authors:['Documentação do projeto SILM'],year:'2026',source:'docs/CONTRATO-VERSIONAMENTO.md',notes:'Referência técnica local. Contrato de escopo e versionamento do projeto.'},{id:'identidade-silm',type:'tecnica',title:'Identidade visual SILM preservada da versão de origem',source:'Símbolo e abertura preservados da versão anterior.',notes:'Créditos e hashes dos artefatos constam em BUILD-INFO.json.'},...D.sources],
        report:{collect(){return {sections:[{title:'Estado da investigação',text:reportText()},{title:'Limites do registro',text:'As observações e conclusões abaixo são textos do usuário. As atividades demonstrativas verificam apenas o fluxo de uso da interface. O Histórico da investigação fica em Dados → Histórico e não é copiado para o relatório.'}]};}},
        // Correção de origem 0.3.x: investigação válida do Laboratório Livre é retomada diretamente (0.3.0 §52–53).
        session:{resumeFree:'direct',hasChanges(){return !!model.state.investigation;},capture(){/* scientific.state é persistido pelo serviço único no namespace SILM */},restore(){showTable=!selected();contextChanged();}},
        onStart(){/* Atividade pedagógica muda o contexto, não cria outro estado científico. */contextChanged();}
      });
      ctx.scope.on('module:changed',event=>{const id=event.detail?.id;if(restoringModule&&id==='explorar')return;restoringModule=false;const before=model.state.module.active;model.setModule(id);if(id!=='medir'){measure.tool=null;measure.picks=[];measure.review=null;}if(before!==id&&model.state.investigation)logEvent('Módulo: '+(ctx.modules.get(id)?.title||id)+'.');contextChanged();});
      ctx.scope.on('activity:changed',()=>{if(restoringModule){const target=model.state.module.active;restoringModule=false;ctx.modules.select(target).catch(error=>console.error('Falha ao retomar módulo',error));}contextChanged();});
      // Preferência interna de movimento: controles e camada eletrônica refletem a mudança sem recarregar.
      ctx.scope.on('a11y:changed',()=>{view?.update();for(const fn of [...watchers])fn();});
      contextChanged();
    },
    mount(){host=U.element('section',null,'silm-laboratory');host.id='silm-view';applyLayers();ctx.viewport.host.append(host);ctx.scope.cleanup(()=>{host?.remove();host=null;});draw();},
    activate() {
      const favicon=document.querySelector('link[rel=icon]');delete favicon.dataset.domainIcon;A11Y.atualizarFavicon(ctx.accessibility.state.theme);
      draw();
    },
    resize(size){if(host)host.dataset.viewportWidth=String(Math.round(size.width));},
    async reset(){if(model.resetInvestigation()){resetMeasure();resetCalc();logEvent('Investigação resetada; metal mantido.');await ctx.activity.touch();contextChanged();ctx.notify('Investigação resetada. Metal e preferências preservados.',{type:'info'});}else ctx.notify('Não há investigação científica para resetar.',{type:'info'});},
    deactivate(){},
    destroy(){host=null;ctx=null;}
  };
};
