'use strict';
window.SILM = window.SILM || {};
SILM.create = () => {
  const U = SimCore.ExperienceUI, model = SILM.createScientificState();
  let ctx = null, host = null, stopOpening = null;
  const icon = 'assets/silm-icone.svg';
  const modules = [
    {id:'explorar',title:'Explorar',description:'Monte a estrutura metálica: adicione, selecione, mova e organize unidades do metal da investigação.',icon:'grid'},
    {id:'medir',title:'Medir',description:'Consulte medidas da representação. Os instrumentos de medição ainda não estão disponíveis.',icon:'lab'},
    {id:'calcular',title:'Calcular',description:'Investigue relações quantitativas. As fórmulas e os cálculos serão incorporados após validação.',icon:'report'}
  ];
  const C=SILM.assembly.contract;
  const moduleMessage=id=>({explorar:model.state.structure?'Adicione, selecione e mova unidades na área central.':model.state.metal?'A estrutura ainda não foi montada. Use Iniciar montagem.':'A estrutura ainda não foi montada.',medir:'As ferramentas de medição serão habilitadas quando a estrutura cristalina estiver definida.',calcular:'Os cálculos serão habilitados quando a estrutura cristalina estiver definida.'})[id];
  const moduleName = () => ctx?.modules.get(ctx.modules.current)?.title || 'Explorar';
  const openManual = id => ctx.screens.navigate('manual',id);
  const D=SILM.data,tableState={query:'',selection:null};
  let viewScope=null,showTable=true,presentation=null,restoringModule=false,view=null,viewKey=null;
  const watchers=new Set(),watch=(scope,fn)=>{watchers.add(fn);scope.cleanup(()=>watchers.delete(fn));};
  const editable=()=>model.state.module.active==='explorar';
  const unitName=()=>'unidade de '+(selected()?.name||'').toLocaleLowerCase('pt-BR');
  const referenceName=e=>{const ref=D.structure(e);return ['CFC','CCC','HC'].includes(ref.type)?ref.type:'de referência ('+ref.label+')';};
  const selected=()=>D.get(model.state.metal?.atomicNumber);
  const canInvestigate=()=>!ctx.experience.restricted;
  const canTeacherInvestigate=()=>!ctx.activity.current||ctx.activity.current.type==='free';
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
    const units=model.state.structure?.units.length||0,assembly=model.state.structure?' A montagem atual'+(units?' com '+units+' '+(units===1?'unidade':'unidades'):'')+' será removida; as unidades não são convertidas para o novo metal.':'';
    if(model.state.investigation&&!await U.confirm(ctx,'Iniciar uma nova investigação?','A investigação atual será encerrada. Seus dados científicos serão substituídos; os textos de relatório permanecem salvos.'+assembly,'Iniciar nova investigação'))return false;
    if(!model.begin(e.atomicNumber,ctx.activity.current?.type||'free'))return false;
    showTable=false;tableState.selection=e.atomicNumber;await ctx.activity.touch();contextChanged();await ctx.screens.navigate('laboratorio');
    ctx.viewport.host.scrollTop=0;host?.querySelector('h1')?.focus();SimCore.notifications.announce('Investigação iniciada com '+e.name+'.');return true;
  }
  async function resetInvestigation(){if(!model.state.investigation)return false;
    if(!await confirmDestructive('Resetar investigação?','O metal e a identidade da investigação serão mantidos. A montagem, as observações e os dados construídos serão limpos.','Resetar investigação'))return false;
    model.resetInvestigation();await ctx.activity.touch();contextChanged();ctx.notify('Investigação resetada. Metal e preferências preservados.',{type:'info'});SimCore.notifications.announce('Investigação resetada.');return true;
  }
  async function closeInvestigation(){if(!model.state.investigation)return false;
    if(!await confirmDestructive('Encerrar investigação?','O metal e a montagem serão removidos e o Laboratório voltará à seleção. Os textos de relatório permanecem salvos.','Encerrar investigação'))return false;
    model.close();showTable=true;tableState.selection=null;tableState.query='';await ctx.activity.touch();contextChanged();ctx.viewport.host.scrollTop=0;ctx.notify('Investigação encerrada.',{type:'info'});SimCore.notifications.announce('Investigação encerrada. Selecione um metal.');return true;
  }
  /* Montagem metálica (0.4.x): toda escrita passa pelo serviço único do estado científico. */
  function structureChanged(){view?.update();for(const fn of [...watchers])fn();}
  function say(text){if(view)view.say(text);else SimCore.notifications.announce(text);}
  async function startAssembly(){if(!model.beginAssembly())return false;await ctx.activity.touch();contextChanged();view?.focusAdd();say('Montagem iniciada. Use Adicionar unidade para inserir unidades de '+selected().name.toLocaleLowerCase('pt-BR')+'.');return true;}
  function addUnit(){if(!editable())return {ok:false,reason:'MODULE'};const r=model.addUnit();
    if(!r.ok){say(r.reason==='UNITS_LIMIT'?'Limite de '+C.maxUnits+' unidades desta cena atingido.':'Não há espaço livre na cena. Reorganize as unidades.');return r;}
    structureChanged();view?.select(r.unit.id,{announce:false});const n=model.state.structure.units.length;say(unitName().replace(/^u/,'U')+' '+n+' adicionada e selecionada. Toque no destino para posicioná-la.');return r;}
  /* Como no SIAB: cada ação desfazível tem descrição; o botão mostra “Desfazer: …” e o anúncio “Desfeito: …”. */
  function describeLast(){const last=model.lastAction;if(!last)return null;const k=(model.state.structure?.units.findIndex(u=>u.id===last.unitId)??-1)+1;return (last.type==='add'?'adição da unidade ':'movimento da unidade ')+k;}
  function undoAction(){if(!editable())return {ok:false,reason:'MODULE'};const description=describeLast(),r=model.undo();if(!r.ok){say('Nada para desfazer.');return r;}structureChanged();say('Desfeito: '+description+'.');return r;}
  function moveUnit(id,position,options){if(!editable())return {ok:false,reason:'MODULE'};const r=model.moveUnit(id,position,options);if(r.ok&&!r.unchanged)structureChanged();return r;}
  async function clearStructure(){const s=model.state.structure;if(!s)return false;
    if(s.units.length&&!await confirmDestructive('Remover estrutura atual?','O metal selecionado será mantido. '+s.units.length+' '+(s.units.length===1?'unidade será removida':'unidades serão removidas')+'; esta ação não pode ser desfeita.','Limpar estrutura'))return false;
    model.clearStructure();await ctx.activity.touch();contextChanged();host?.querySelector('h1')?.focus();ctx.notify('Estrutura removida. '+selected().name+' continua selecionado.',{type:'info'});return true;}
  function setAssistance(enabled){if(!model.setAssistance(enabled))return;structureChanged();say(enabled?'Posicionamento assistido ativado.':'Posicionamento assistido desativado. Destinos ocupados serão recusados.');}
  function toggleAssembled(){const s=model.state.structure;if(!s)return;const next=s.status==='assembled'?'assembling':'assembled';if(!model.setAssemblyStatus(next))return;structureChanged();say(next==='assembled'?'Montagem marcada como concluída. Ela continua editável.':'Montagem retomada.');}
  function explore(){return ctx.modules.select('explorar');}
  function openTable(){showTable=true;ctx.panels.close('left');ctx.panels.close('right');draw();ctx.viewport.host.scrollTop=0;host?.querySelector('.periodic-heading h1')?.focus();}
  function draw(){
    if(!ctx||!host)return;
    const table=(showTable||!selected())&&!ctx.experience.restricted,structure=model.state.structure;
    const key=!table&&selected()&&structure?'assembly:'+model.state.investigation.id+':'+model.state.module.active:null;
    if(key&&key===viewKey&&view){view.update();return;}
    view=null;viewKey=key;viewScope?.destroy();viewScope=SimCore.createScope();host.replaceChildren();
    if(table){SILM.createPeriodicTable(host,{scope:viewScope,state:tableState,onInvestigate:investigate,onSources:openSources,canInvestigate});return;}
    if(key){const e=selected();view=SILM.createAssemblyView(host,{scope:viewScope,model,element:e,editable:editable(),note:moduleMessage(model.state.module.active),reference:referenceName(e),moduleTitle:ctx.modules.get(model.state.module.active)?.title||'Explorar',describeLast,actions:{add:addUnit,undo:undoAction,move:moveUnit},canExplore:()=>ctx.modules.available('explorar'),onExplore:explore});return;}
    const e=selected(),card=U.element('section',null,'silm-metal-card');
    card.append(U.element('p','LABORATÓRIO · '+moduleName().toUpperCase(),'eyebrow'));
    if(e)card.append(U.element('div',e.symbol,'metal-symbol'));
    const h=U.element('h1',e?e.name:'Atividade de interface');h.tabIndex=-1;card.append(h);
    if(e){const ref=D.structure(e),investigation=model.state.investigation;card.append(U.element('p','Metal da investigação: '+e.name+', '+e.symbol+', número atômico '+e.atomicNumber+'.'),U.element('p','Investigação '+(investigation?.status==='paused'?'pausada':'ativa'),'silm-investigation-status'),U.element('p','A estrutura metálica ainda não foi montada.'),U.element('p','Estrutura de referência: '+ref.label+' · '+ref.conditions.temperature.display+' · dado tabelado.'));
      if(!editable())card.append(U.element('p',moduleMessage(model.state.module.active)));
      const actions=U.element('div',null,'action-row');
      if(editable())actions.append(U.button('Iniciar montagem',startAssembly,viewScope,{id:'silm-start-assembly',primary:true}));else if(ctx.modules.available('explorar'))actions.append(U.button('Montar em Explorar',explore,viewScope,{id:'silm-card-explore',primary:true}));
      if(canInvestigate())actions.append(U.button('Selecionar outro metal',openTable,viewScope,{id:'silm-select-other'}),U.button('Resetar investigação',resetInvestigation,viewScope,{id:'silm-reset'}),U.button('Encerrar investigação',closeInvestigation,viewScope,{id:'silm-close'}));actions.append(U.button('Informações do metal',()=>ctx.panels.open('right'),viewScope,{id:'silm-info'}),U.button('Fontes',()=>openSources(e),viewScope,{id:'silm-sources'}));card.append(actions);
    }else card.append(U.element('p','Esta atividade preserva o percurso de interface definido pelo professor.'));
    if(ctx.experience.restricted)card.append(U.button('Ajuda da atividade',()=>ctx.experience.details(),viewScope));host.append(card);
  }
  function contextChanged(){ctx.setContext({module:model.state.module.active,restricted:ctx.experience.restricted,metal:model.state.metal?.atomicNumber||null});draw();}
  function elementsPanel(el,local){
    const e=selected(),s=model.state.structure,box=U.element('section',null,'silm-panel');box.append(U.element('p','ELEMENTO DA INVESTIGAÇÃO','eyebrow'),U.element('h3',e?e.symbol+' · '+e.name:'Nenhum metal selecionado'));
    if(!e){box.append(U.button('Selecionar metal',openTable,local.scope,{id:'silm-select-metal',primary:true}));el.append(box);return;}
    box.append(U.element('p','Z = '+e.atomicNumber+' · um metal por investigação.'));
    const controls=U.element('div',null,'silm-assembly-controls');controls.setAttribute('role','group');controls.setAttribute('aria-label','Controles de montagem');box.append(controls);
    const exploreNote=()=>{if(editable())return;controls.append(U.element('p','A edição da montagem está disponível em Explorar.','silm-panel-note'));if(ctx.modules.available('explorar'))controls.append(SILM.actionButton('Montar em Explorar',explore,local.scope,{id:'silm-panel-explore'}));};
    if(!s){
      if(editable())controls.append(SILM.actionButton('Iniciar montagem',startAssembly,local.scope,{id:'silm-panel-start-assembly',primary:true}));else exploreNote();
      controls.append(SILM.actionButton('Selecionar outro metal',openTable,local.scope,{id:'silm-select-metal'}));
    }else{
      const count=U.element('p','','silm-panel-note');count.id='silm-panel-count';
      const add=SILM.actionButton('Adicionar unidade',addUnit,local.scope,{id:'silm-panel-add',primary:true,glyph:'+'}),undo=SILM.actionButton('Desfazer',undoAction,local.scope,{id:'silm-panel-undo',glyph:'↶',label:'Desfazer última ação'});
      const clear=SILM.actionButton('Limpar estrutura',clearStructure,local.scope,{id:'silm-panel-clear',danger:true}),finish=SILM.actionButton('Concluir montagem',toggleAssembled,local.scope,{id:'silm-panel-finish'});
      const assistLabel=U.element('label',null,'check-row'),assist=U.element('input');assist.type='checkbox';assist.id='silm-panel-assist';assistLabel.append(assist,U.element('span','Posicionamento assistido'));
      local.scope.listen(assist,'change',()=>setAssistance(assist.checked));
      controls.append(count,add,undo,clear,assistLabel,U.element('p','Mecanismo de interface que evita sobreposição; não representa forças entre átomos.','silm-panel-note'),finish);exploreNote();
      const update=()=>{const st=model.state.structure;if(!st)return;const n=st.units.length;
        count.textContent='Montagem: '+n+' '+(n===1?'unidade':'unidades')+' de '+C.maxUnits+'.';
        add.setAttribute('aria-disabled',String(!editable()||n>=C.maxUnits));undo.setAttribute('aria-disabled',String(!editable()||!model.canUndo));const last=describeLast();undo.title=last?'Desfazer: '+last:'Nada para desfazer';
        assist.checked=st.assistance.enabled;finish.hidden=n<2;finish.textContent=st.status==='assembled'?'Retomar construção':'Concluir montagem';};
      watch(local.scope,update);update();
      if(canInvestigate()){const details=U.element('details'),row=U.element('div',null,'action-row');details.append(U.element('summary','Investigação'),row);
        row.append(SILM.actionButton('Selecionar outro metal',openTable,local.scope,{id:'silm-select-metal'}),U.button('Resetar investigação',resetInvestigation,local.scope,{id:'silm-panel-reset'}),U.button('Encerrar investigação',closeInvestigation,local.scope,{id:'silm-panel-close'}));box.append(details);}
    }
    el.append(box);
  }
  function informationPanel(el,local){
    const box=U.element('section',null,'silm-panel'),e=selected();
    if(!e){box.append(U.element('h3','Nenhum metal selecionado'),U.element('p','Explore a Tabela Periódica e escolha um metal disponível. Os dados possuem referências locais e fontes rastreáveis.'));}
    else{
      if(model.state.structure){const summary=U.element('section',null,'silm-structure-summary');summary.id='silm-structure-summary';summary.setAttribute('aria-labelledby','silm-structure-heading');box.append(summary);
        const update=()=>{const st=model.state.structure;if(!st)return;const dl=U.element('dl',null,'silm-facts'),add=(name,value)=>dl.append(U.element('dt',name),U.element('dd',value)),n=st.units.length;
          const h=U.element('h3','Montagem');h.id='silm-structure-heading';
          add('Metal',e.name+' · '+e.symbol);add('Unidades',String(n));add('Estado',{empty:'Vazia',assembling:'Em construção',assembled:'Concluída pelo usuário'}[st.status]);add('Posicionamento',st.assistance.enabled?'Assistido (mecanismo de interface)':'Livre, com prevenção de sobreposição');add('Escala','Sem escala física: posições normalizadas da cena');
          summary.replaceChildren(U.element('p','REPRESENTAÇÃO DIDÁTICA','silm-datum-kind'),h,dl,U.element('p','A montagem atual ainda não representa a geometria cristalográfica '+referenceName(e)+'. As distâncias visuais não correspondem a distâncias interatômicas reais.','silm-limitation'));};
        watch(local.scope,update);update();}
      const ref=D.structure(e),facts=U.element('dl',null,'silm-facts');box.append(U.element('p','DADO TABELADO','silm-datum-kind'),U.element('h3',e.name+' · '+e.symbol));
      const add=(name,value)=>facts.append(U.element('dt',name),U.element('dd',value));
      add('Número atômico',String(e.atomicNumber));add(e.atomicWeight.form==='massNumber'?'Número de massa (convenção IUPAC)':'Peso atômico padrão (adimensional)',e.atomicWeight.display);add('Posição periódica','Grupo '+(e.group??'não atribuído à série')+' · período '+e.period+' · bloco '+e.block);add('Configuração eletrônica · átomo neutro',e.electronConfiguration.display);add('Estrutura de referência',ref.label+' · '+ref.phaseLabel);add('Temperatura de referência',ref.conditions.temperature.display);box.append(facts);
      const details=U.element('details');details.append(U.element('summary','Valência e condições dos dados'),U.element('p',e.valenceModel.display+' — '+e.valenceModel.convention),U.element('p',e.valenceModel.explanation),U.element('p','Representação qualitativa: convenção de valência; não é uma contagem de elétrons livres.'),U.element('p','Pressão: '+ref.conditions.pressure.display+'. Fase: '+ref.conditions.phase.display+'.'),U.element('p',ref.conditions.notes),U.element('p',e.atomicWeight.convention));
      if(e.group===null)details.append(U.element('p',e.notes));
      const parameters=U.element('p',Object.entries(ref.latticeParameters).map(([k,v])=>k+' = '+v.display+' '+v.unit).join(' · '));details.append(parameters);box.append(details,U.button('Referências destes dados',()=>openSources(e),local.scope,{id:'silm-info-sources'}));
    }
    box.append(U.button('Abrir relatório',()=>ctx.screens.navigate('relatorios'),local.scope,{id:'silm-report'}));el.append(box);
  }
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
  return {
    manifest:{id:'silm',nome:'SILM',nomeCurto:'SILM',versao:'0.4.0',titulo:'SILM — A Arquitetura dos Metais',subtitulo:'Simulador Interativo de Ligações Metálicas',icone:icon,
      tema:{
        dark:{background:'#16181c',surface:'#1f2329',primary:'#c7a54a',onPrimary:'#16181c',secondary:'#b6bdc7',text:'#f2f1ec',border:'#59616d',accent:'#dcc074',scientificAccent:'#4fc3f7',textAccent:'#dcc074'},
        light:{background:'#f5f3ee',surface:'#fffefa',primary:'#725416',onPrimary:'#fffefa',secondary:'#505762',text:'#20252c',border:'#8d8980',accent:'#725416',scientificAccent:'#006a91',textAccent:'#725416'}
      },
      manual:SILM.manual,viewport:{label:'Área de investigação da estrutura metálica'},
      painelEsquerdo:{title:'Elementos',sections:[{id:'elementos',title:'Elementos',visible:context=>!context?.restricted,render:elementsPanel},{id:'modulos',title:'Módulos',render:(el,local)=>local.modules.render(el,local)}]},
      painelDireito:{title:'Informações',render:informationPanel},
      recursos:['domain/entry.js','domain/silm/prelude.js','domain/silm/data/bundle.js','domain/silm/data-api.js','domain/silm/periodic-table.js','domain/silm/presentation.js','domain/silm/periodic-table.css','domain/silm/assembly.js','domain/silm/state.js','domain/silm/assembly-view.js','domain/silm/assembly.css','domain/silm/bootstrap.js','domain/silm/manual.js','domain/silm/styles.css','domain/silm/identidade.css','domain/silm/abertura.js','domain/silm/abertura.css',icon]
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
          {id:'laboratorio',title:'Laboratório',description:'Alterne entre Explorar, Medir e Calcular no espaço de investigação.',icon:'lab',destination:'laboratorio',order:'01'},
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
        routes:[{id:'percurso-interface',title:'Um percurso pelo SILM',subtitle:'Demonstração interna de interface · sem experimento científico',module:'explorar',description:'Conheça a navegação e os painéis.',objective:'Reconhecer os controles do Laboratório e o acesso ao relatório.',procedure:['Abra Elementos e consulte o estado inicial.','Na seção Módulos, consulte Explorar.','Abra Informações e depois o relatório.','Retorne ao Laboratório pelo botão Voltar.'],requirements:['Mouse, toque ou teclado.'],help:{instructions:'Este roteiro demonstra somente o funcionamento da interface.',tips:['Use Fechar ou Escape para recolher os painéis.'],explanations:'Nenhum metal, instrumento ou resultado científico está ativo.',manualTopic:'interface'},navigation:'free',initialState:{schemaVersion:1}}],
        missions:[{id:'revisar-registro',title:'Revisar um registro',subtitle:'Demonstração interna de interface · sem conteúdo científico',module:'medir',objective:'Experimentar o registro e a conclusão de uma atividade restrita.',problem:'Como distinguir concluir uma atividade de encerrar seu contexto?',conditions:['Preencha evidência e conclusão com uma observação sobre a interface.'],evidence:['Um registro textual da navegação.'],help:{instructions:'Use Finalizar missão no Menu para preencher os dois campos e concluir.',tips:['O relatório continua acessível depois de concluir.'],explanations:'Concluir preserva a atividade. Encerrar atividade libera a navegação e retoma o Laboratório Livre.',manualTopic:'atividades'},navigation:'restricted',restrictions:{resources:[]},initialState:{schemaVersion:1},validate({fields}){return fields.evidence.trim()&&fields.conclusion.trim()?{ok:true}:{ok:false,message:'Preencha evidência e conclusão para finalizar esta demonstração.'};}}],
        teacher:true,teacherResources,
        about:{description:'A Arquitetura dos Metais · SILM 0.4.0. Banco científico, investigação persistente e montagem manual da estrutura metálica de um metal.',modelTitle:'Modelo científico',model:'O banco apresenta 118 elementos e dados documentados. A investigação tem estado científico único. A montagem livre da série 0.4.x é uma representação didática de construção coletiva e não representa ainda a geometria cristalográfica real do metal; as distâncias visuais não correspondem a distâncias interatômicas reais, e a assistência de posicionamento é um mecanismo de interface, não uma simulação de forças interatômicas. Não há elétrons, medidas ou cálculos. O símbolo e a abertura representam organização coletiva e fluxo deslocalizado de forma qualitativa; não representam trajetórias ou quantidades literais de elétrons.',manualTopic:'sobre-silm',licenses:['SILM: GNU GPL v3. Veja LICENSE na distribuição.','dialog-polyfill: licença BSD preservada em vendor/dialog-polyfill/LICENSE.']},
        references:[{id:'contrato-silm',type:'tecnica',title:'Contrato de desenvolvimento do SILM',authors:['Documentação do projeto SILM'],year:'2026',source:'docs/CONTRATO-VERSIONAMENTO.md',notes:'Referência técnica local. Contrato de escopo e versionamento do projeto.'},{id:'identidade-silm',type:'tecnica',title:'Identidade visual SILM preservada da versão de origem',source:'Símbolo e abertura preservados da versão anterior.',notes:'Créditos e hashes dos artefatos constam em BUILD-INFO.json.'},...D.sources],
        report:{collect(){const state=model.snapshot(),e=selected(),i=state.investigation;return {sections:[{title:'Estado da investigação',text:e&&i?'SILM 0.4.0 · ID: '+i.id+' · '+e.name+' ('+e.symbol+'), Z = '+e.atomicNumber+' · Início: '+i.createdAt+' · Módulo ativo: '+(ctx.modules.get(state.module.active)?.title||state.module.active)+'. Dado tabelado: '+D.structure(e).label+'; '+D.structure(e).conditions.temperature.display+'. Fonte: '+D.source(D.structure(e).sourceId).title+'. '+(state.structure?'Montagem (representação didática): '+state.structure.units.length+' '+(state.structure.units.length===1?'unidade':'unidades')+'; ainda não representa a geometria cristalográfica nem distâncias reais.':'Estrutura ainda não montada.')+' Sem medidas ou cálculos científicos.':'SILM 0.4.0 · Nenhuma investigação científica ativa; não há medidas ou cálculos científicos.'},{title:'Limites do registro',text:'As observações e conclusões abaixo são textos do usuário. As atividades demonstrativas verificam apenas o fluxo de uso da interface.'}]};}},
        // Correção de origem 0.3.x: investigação válida do Laboratório Livre é retomada diretamente (0.3.0 §52–53).
        session:{resumeFree:'direct',hasChanges(){return !!model.state.investigation;},capture(){/* scientific.state é persistido pelo serviço único no namespace SILM */},restore(){showTable=!selected();contextChanged();}},
        onStart(){/* Atividade pedagógica muda o contexto, não cria outro estado científico. */contextChanged();}
      });
      ctx.scope.on('module:changed',event=>{const id=event.detail?.id;if(restoringModule&&id==='explorar')return;restoringModule=false;model.setModule(id);contextChanged();});
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
    async reset(){if(model.resetInvestigation()){await ctx.activity.touch();contextChanged();ctx.notify('Investigação resetada. Metal e preferências preservados.',{type:'info'});}else ctx.notify('Não há investigação científica para resetar.',{type:'info'});},
    deactivate(){stopOpening?.();stopOpening=null;},
    destroy(){host=null;ctx=null;}
  };
};
