(function(global){
  "use strict";

  const TEMPLATE = `<div class="silm-opening" data-silm-opening>
  <div class="silm-opening__center">
    <div class="silm-opening__stage">
      <div class="silm-opening__visual">
        <svg viewBox="0 0 256 240" role="img" aria-labelledby="silmOpeningTitle silmOpeningDesc">
  <title id="silmOpeningTitle">Símbolo SILM</title>
  <desc id="silmOpeningDesc">Abertura do SILM com condutividade elétrica, condutividade térmica, deslizamento estrutural e brilho metálico.</desc>
  <defs>
    <radialGradient id="silmGold" cx="30%" cy="24%" r="78%">
      <stop offset="0" stop-color="#fff5cf"/>
      <stop offset=".14" stop-color="#efcb70"/>
      <stop offset=".42" stop-color="#db9f31"/>
      <stop offset=".72" stop-color="#b2770d"/>
      <stop offset="1" stop-color="#6f4704"/>
    </radialGradient>
    <linearGradient id="silmCyan" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#9fe9ff"/>
      <stop offset=".52" stop-color="#4fc3f7"/>
      <stop offset="1" stop-color="#86e3ff"/>
    </linearGradient>
    <filter id="silmGoldShadow" x="-70%" y="-70%" width="240%" height="240%">
      <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#7f560a" flood-opacity=".22"/>
    </filter>
    <filter id="silmBlueGlow" x="-80%" y="-80%" width="260%" height="260%">
      <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#4fc3f7" flood-opacity=".72"/>
    </filter>
    <filter id="silmDotGlow" x="-140%" y="-140%" width="380%" height="380%">
      <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#4fc3f7" flood-opacity=".9"/>
    </filter>
    <filter id="silmThermalGlow" x="-140%" y="-140%" width="380%" height="380%">
      <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#efcb70" flood-opacity=".9"/>
    </filter>
  </defs>

  <g class="master">
    <g fill="#f5d47d" filter="url(#silmThermalGlow)">
      <circle class="thermal-aura ta1" cx="108" cy="50" r="10"/>
      <circle class="thermal-aura ta2" cx="68" cy="86" r="11"/>
      <circle class="thermal-aura ta3" cx="130" cy="110" r="11"/>
      <circle class="thermal-aura ta4" cx="160" cy="86" r="11"/>
      <circle class="thermal-aura ta5" cx="108" cy="142" r="9"/>
      <circle class="thermal-aura ta6" cx="200" cy="50" r="10"/>
      <circle class="thermal-aura ta7" cx="68" cy="178" r="11"/>
      <circle class="thermal-aura ta8" cx="200" cy="142" r="9"/>
      <circle class="thermal-aura ta9" cx="160" cy="178" r="11"/>
    </g>
    <g fill="none" stroke="#f6de97" stroke-width="2">
      <circle class="thermal-ring tr1" cx="108" cy="50" r="14"/>
      <circle class="thermal-ring tr2" cx="68" cy="86" r="15"/>
      <circle class="thermal-ring tr3" cx="130" cy="110" r="15"/>
      <circle class="thermal-ring tr4" cx="160" cy="86" r="15"/>
      <circle class="thermal-ring tr5" cx="108" cy="142" r="12"/>
      <circle class="thermal-ring tr6" cx="200" cy="50" r="14"/>
      <circle class="thermal-ring tr7" cx="68" cy="178" r="15"/>
      <circle class="thermal-ring tr8" cx="200" cy="142" r="12"/>
      <circle class="thermal-ring tr9" cx="160" cy="178" r="15"/>
    </g>

    <g class="back">
      <g class="edge-shadow" fill="none" stroke="#8b5d0b" stroke-opacity=".22" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round">
        <rect x="108" y="50" width="92" height="92"/>
      </g>
      <g fill="none" stroke="#d8ab4c" stroke-width="2.45" stroke-linecap="round" stroke-linejoin="round">
        <path class="edge" d="M108 50 H200 V142 H108 Z" opacity=".74"/>
      </g>
    </g>

    <g class="connectors">
      <g class="edge-shadow" fill="none" stroke="#8b5d0b" stroke-opacity=".22" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M68 86 L108 50 M160 86 L200 50 M160 178 L200 142 M68 178 L108 142"/>
      </g>
      <g fill="none" stroke="#d8ab4c" stroke-width="2.45" stroke-linecap="round" stroke-linejoin="round">
        <path class="edge" d="M68 86 L108 50 M160 86 L200 50 M160 178 L200 142 M68 178 L108 142" opacity=".9"/>
      </g>
    </g>

    <g class="front">
      <g class="edge-shadow" fill="none" stroke="#8b5d0b" stroke-opacity=".22" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round">
        <rect x="68" y="86" width="92" height="92"/>
      </g>
      <g fill="none" stroke="#d8ab4c" stroke-width="2.45" stroke-linecap="round" stroke-linejoin="round">
        <path class="edge" d="M68 86 H160 V178 H68 Z"/>
      </g>
    </g>

    <g class="electron-field">
      <path class="ribbon-glow"
        d="M82 133 C98 132 109 112 126 110 C143 108 151 127 167 127 C181 127 190 118 202 109"
        fill="none" stroke="#4fc3f7" stroke-opacity=".20" stroke-width="18" stroke-linecap="round"/>
      <path class="ribbon"
        d="M82 133 C98 132 109 112 126 110 C143 108 151 127 167 127 C181 127 190 118 202 109"
        fill="none" stroke="url(#silmCyan)" stroke-width="5.2" stroke-linecap="round" filter="url(#silmBlueGlow)"/>
      <circle class="electron-dot d1" cx="100" cy="125" r="4.5" fill="#9eeafd" filter="url(#silmDotGlow)"/>
      <circle class="electron-dot d2" cx="148" cy="118" r="4.5" fill="#9eeafd" filter="url(#silmDotGlow)"/>
      <circle class="electron-dot d3" cx="182" cy="123" r="4.5" fill="#9eeafd" filter="url(#silmDotGlow)"/>
    </g>

    <g fill="url(#silmGold)" filter="url(#silmGoldShadow)">
      <circle class="node" cx="68" cy="86" r="12.8" style="--dx:-28px;--dy:-26px"/>
      <circle class="node" cx="160" cy="86" r="12.8" style="--dx:30px;--dy:-22px"/>
      <circle class="node" cx="160" cy="178" r="12.8" style="--dx:28px;--dy:28px"/>
      <circle class="node" cx="68" cy="178" r="12.8" style="--dx:-30px;--dy:28px"/>
      <circle class="node" cx="108" cy="50" r="11" style="--dx:-12px;--dy:-34px"/>
      <circle class="node" cx="200" cy="50" r="11" style="--dx:32px;--dy:-30px"/>
      <circle class="node" cx="200" cy="142" r="10.2" style="--dx:28px;--dy:12px"/>
      <circle class="node" cx="108" cy="142" r="10.2" style="--dx:-12px;--dy:12px"/>
      <circle class="node" cx="130" cy="110" r="13.2" style="--dx:6px;--dy:-8px"/>
    </g>
  </g>
</svg>
        <div class="silm-opening__sheen"></div>
      </div>
      <div class="silm-opening__brand">
        <strong class="silm-opening__brand-mark">SILM</strong>
        <span class="silm-opening__brand-name">Simulador Interativo de Ligações Metálicas</span>
        <em class="silm-opening__brand-theme">A Arquitetura dos Metais</em>
      </div>
      <button type="button" class="silm-opening__skip" data-silm-skip>Pular abertura</button>
    </div>
  </div>
  <div class="silm-opening__hint">Condutividade elétrica · condutividade térmica · deslizamento estrutural · brilho metálico</div>
</div>`;

  function mount(target, options){
    const opts = Object.assign({
      autoStart:true,
      duration:6100,
      hideAfterFinish:true,
      removeAfterFinish:false
    }, options || {});

    const host = typeof target === "string" ? document.querySelector(target) : target;
    if(!host) throw new Error("SILMOpening: elemento alvo não encontrado.");

    const wrapper = document.createElement("div");
    wrapper.innerHTML = TEMPLATE;
    const root = wrapper.firstElementChild;
    host.appendChild(root);

    let timer = null;

    function clearTimer(){
      if(timer){
        clearTimeout(timer);
        timer = null;
      }
    }

    const api = {
      root,
      play(){
        clearTimer();
        root.classList.remove("is-hidden","is-static","is-running");
        void root.offsetWidth;
        root.classList.add("is-running");

        timer = setTimeout(function(){
          root.classList.remove("is-running");
          if(opts.hideAfterFinish){
            api.hide();
          }else{
            api.showStatic();
          }
        }, opts.duration);
      },
      hide(){
        clearTimer();
        root.classList.remove("is-running");
        root.classList.add("is-hidden");
        if(opts.removeAfterFinish){
          setTimeout(function(){
            if(root.isConnected) root.remove();
          }, 380);
        }
      },
      showStatic(){
        clearTimer();
        root.classList.remove("is-hidden","is-running");
        root.classList.add("is-static");
      },
      destroy(){
        clearTimer();
        if(root.isConnected) root.remove();
      }
    };

    const skip = root.querySelector("[data-silm-skip]");
    if(skip) skip.addEventListener("click", api.hide);

    if(opts.autoStart) api.play();

    return api;
  }

  global.SILMOpening = { mount };
})(window);

