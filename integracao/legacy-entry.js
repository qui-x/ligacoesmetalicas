'use strict';
const previous=location.hash;let target=previous.replace('#/laboratorio','#/ambiente');if(target.startsWith('#/manual/'))target='#/manual?topico='+encodeURIComponent(target.slice(9));if(target.startsWith('#/tema/'))target='#/aprender?tema='+encodeURIComponent(target.slice(7));location.replace('index.html'+(target||'#/inicio'));
