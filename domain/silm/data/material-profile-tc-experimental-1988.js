'use strict';
window.SILM=window.SILM||{};
/**
 * Tecnecio 99 metalico, Tc(0001): constantes opticas n,k EXPERIMENTAIS.
 * Antonov, Kirillova, Krasovskii & Ponosov, Sov Phys JETP 67 (1988)
 * 1842-1845, Tabela I, p. 1843: 500-600 nm.
 * https://jetp.ras.ru/cgi-bin/dn/e_067_09_1842.pdf
 *
 * n,k medidos na pelicula de 120 nm; R(lambda,theta) calculado a partir de
 * Fresnel por motor optico preexistente (Cu), NAO medido diretamente em 550 nm.
 * Temperatura da medicao NAO declarada; temperatura de DEPOSICAO em substrato
 * resfriado NAO corresponde a temperatura de MEDICAO do espectro.
 * PRESSAO da medicao NAO corresponde a 101325 Pa por falta de dados.
 * APENAS perfil condicional, NAO homologado para a CNTP (273.15 K, 101325 Pa).
 * Nenhuma cor, imagem ou superficie do SILM passa a ser prevista por esta ficha.
 */
(()=>{
 const points=[[500,3.24,4.11],[510,3.26,4.13],[520,3.3,4.14],
  [530,3.32,4.17],[540,3.34,4.18],[550,3.36,4.21],
  [560,3.39,4.23],[570,3.42,4.25],[580,3.44,4.26],
  [590,3.46,4.28],[600,3.47,4.29]];
 SILM.materialProfiles.register({
  atomicNumber:43,element:'Tc',
  optical:{
   evidence:'TABULATED_NK',
   sample:'99Tc elementar · pelicula de 120 nm sobre vidro polido; orientacao Tc(0001), HC',
   conditions:{
    basis:'SOURCE_REPORTED',temperatureK:null,pressurePa:null,
    description:'Medicao optica: temperatura nao reportada; polarimetria de Beattie em camara de vacuo, sem pressao numerica. Resfriamento do substrato na deposicao NAO e temperatura da medicao. Nao CNTP.',
    surface:'Filme de 120 nm, textura (0001), interface ideal ar–metal no calculo; nao equivale a metal macico, objeto real, rugosidade, oxidacao ou cor aparente'
   },
   source:{
    title:'Electron structure and optical properties of technetium',
    authors:'V. N. Antonov; M. M. Kirillova; E. E. Krasovskii; Yu. S. Ponosov',
    year:1988,
    journal:'Soviet Physics JETP 67(9), 1842–1845',
    url:'https://jetp.ras.ru/cgi-bin/dn/e_067_09_1842.pdf',
    table:'Table I, p. 1843',
    spectralRangeNm:[500,600],
    dataType:'experimental-n-k',
    sample:'99Tc(0001), 120 nm',
    note:'R550 de Fresnel e calculado, nao medido diretamente; precisao de n,k relatada como 2–3%, sem intervalo estatistico de R.'
   },
   points
  }
 });
})();
