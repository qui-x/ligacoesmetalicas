'use strict';
window.SILM=window.SILM||{};
/* Controles transitórios das experiências (0.17.x), nunca gravados (o estado guarda só ligado/desligado):
   - intensidade do campo elétrico (P3): 5 % a 100 %; a deriva média dos elétrons é proporcional a ela (v ∝ E, lei de Ohm
     qualitativa, sem unidade);
   - ângulo da lanterna (P4): 5° a 80° em relação à normal da superfície; a reflexão especular tem θr = θi (lei da
     reflexão, física geral, sem dado do metal);
   - campo elétrico na deformação (deformação + corrente): os deslizamentos geram defeitos (discordâncias, não
     desenhados) que espalham um pouco mais os elétrons — contribuição da deformação na regra de Matthiessen. */
(()=>{
 const controllers=new WeakMap();
 const reflect=theta=>{const t=Math.max(0,Math.min(89,Number(theta)||0));return Object.freeze({incidence:t,reflection:t});};
 function controller(model){
  if(controllers.has(model))return controllers.get(model);
  const listeners=new Set();let intensity=.6,angle=35,observerAngle=35,finish='polished',rays=false,deformField=false,key='';
  const notify=()=>{for(const f of listeners)try{f();}catch(error){console.error(error);}};
  const api={
   subscribe(f){listeners.add(f);return ()=>listeners.delete(f);},
   /* Experiência nova: o campo da deformação volta a desligado (intensidade e ângulo continuam como o aluno deixou). */
   sync(){const st=model.state,p=st.properties,k=(st.investigation?.id||'')+'|'+(p?.active||'')+'|'+(p?.startedAt||'');if(k!==key){key=k;deformField=false;}},
   get intensity(){return intensity;},
   setIntensity(v){const x=Math.round(Math.max(.05,Math.min(1,Number(v)||0))*100)/100;if(x===intensity)return false;intensity=x;notify();return true;},
   get angle(){return angle;},
   setAngle(v){const a=Math.round(Math.max(5,Math.min(80,Number(v)||0)));if(a===angle)return false;angle=a;notify();return true;},
   get observerAngle(){return observerAngle;},
   setObserverAngle(value){
    if(!Number.isFinite(value))return false;
    const next=Math.min(80,Math.max(0,Math.round(value)));
    if(next===observerAngle)return false;observerAngle=next;notify();return true;
   },
   get finish(){return finish;},
   setFinish(value){
    if(value!=='polished'&&value!=='matte')return false;
    if(value===finish)return false;finish=value;notify();return true;
   },
   get rays(){return rays;},
   setRays(value){const next=!!value;if(next===rays)return false;rays=next;notify();return true;},
   get deformField(){return deformField;},
   setDeformField(v){deformField=!!v;notify();return deformField;},
   reading(){return {intensity,angle,observerAngle,finish,rays,deformField};}
  };
  controllers.set(model,api);return api;
 }
 SILM.drive=Object.freeze({controller,reflect,MIN_INTENSITY:.05,MIN_ANGLE:5,MAX_ANGLE:80});
})();
