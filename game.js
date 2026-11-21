'use strict';

const $ = id => document.getElementById(id);
const map = $('map');
const worldView = [0, 0, 360, 175];
const colors = {'Norteamérica':'#a8d6bc','Sudamérica':'#ecc489','Europa':'#edaca0','África':'#e4c46f','Asia':'#bcb9e1','Oceanía':'#81c9c1'};
const continentalViews = {'Norteamérica':[0,0,142,82],'Sudamérica':[92,69,58,76],'Europa':[146,10,84,47],'África':[155,43,86,82],'Asia':[200,5,160,94],'Oceanía':[285,79,105,65]};
const regions = ['Mundo', ...Object.keys(colors), 'Continentes', 'Océanos'];
const oceans = [
  {id:'arctic',name:'Océano Ártico',d:'M0 0H360V19H0Z',anchor:[165,12]},
  {id:'pacific',name:'Océano Pacífico',d:'M0 19H56L100 64L112 92L106 145H0ZM280 19H360V145H325L322 92L289 75Z',anchor:[36,91]},
  {id:'atlantic',name:'Océano Atlántico',d:'M56 19H202L200 55L183 85L201 145H106L112 92L100 64Z',anchor:[151,75]},
  {id:'indian',name:'Océano Índico',d:'M202 19H280L289 75L322 92L325 145H201L183 85L200 55Z',anchor:[258,111]},
  {id:'southern',name:'Océano Austral',d:'M0 145H360V175H0Z',anchor:[193,147]}
];
const continents = [...Object.entries(continentalViews).map(([id,box])=>({id,name:id,box:[box[0],box[1],box[0]+box[2],box[1]+box[3]]})), {id:'Antártida',name:'Antártida',box:[0,140,360,175]}];
const playable = countries.filter(country => country.play);
const speechAvailable = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
let region = 'Mundo';
let study = false;
let southPhysical = false;
const physicalActive = () => region === 'Sudamérica' && southPhysical;
let audio = false;
let queue = [];
let current = 0;
let correct = 0;
let errors = 0;
let streak = 0;
let completed = new Set();
let view = worldView.slice();
let homeView = worldView;
let timer;
let locked = false;
let drag;
let ignoreClick = false;

function svgElement(tag, attributes) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  return element;
}

function interactive(element, item) {
  element.classList.add('interactive');
  element.dataset.answer = item.id;
  element.setAttribute('role','button');
  element.setAttribute('tabindex','0');
  element.setAttribute('aria-label',item.name);
}

function updateView(next) {
  view = next.slice();
  map.setAttribute('viewBox', view.join(' '));
  const scale = map.getScreenCTM()?.a;
  for (const dot of $('markers').children) {
    dot.setAttribute('r', physicalActive() && scale ? 7 / scale : Math.min(1.25, view[2] / 230));
  }
}

function zoom(scale) {
  const [x,y,w,h] = view;
  if (w*scale < (physicalActive() ? .04 : 2) || w*scale > 540) return;
  updateView([x + w*(1-scale)/2, y + h*(1-scale)/2, w*scale, h*scale]);
}

function setupMap() {
  $('lands').replaceChildren();
  $('waters').replaceChildren();
  $('markers').replaceChildren();
  const oceanMode = region === 'Océanos';
  const continentMode = region === 'Continentes';
  const available = new Set(queue.map(item=>item.id));
  const groups = new Map();

  if (oceanMode) {
    for (const ocean of oceans) {
      const path = svgElement('path',{d:ocean.d,class:'water'});
      interactive(path,ocean);
      $('waters').append(path);
    }
  }
  for (const country of countries) {
    const belongs = available.has(country.id);
    const continent = country.id === 'ATA' ? 'Antártida' : country.region;
    const colored = !oceanMode && (belongs || continentMode || region === 'Mundo');
    const path = svgElement('path',{d:country.d,fill:colored ? colors[continent] || '#e8efea' : '#e4eae5',class:'land'});
    if (continentMode && available.has(continent)) {
      if (!groups.has(continent)) {
        const group = svgElement('g',{});
        interactive(group,continents.find(item=>item.id===continent));
        groups.set(continent,group);
        $('lands').append(group);
      }
      groups.get(continent).append(path);
      continue;
    }
    if (region === 'Oceanía' && country.anchor[0] < 35) path.setAttribute('transform','translate(360 0)');
    if (belongs) interactive(path,country);
    $('lands').append(path);
    const [x1,y1,x2,y2] = country.box;
    if (belongs && Math.max(x2-x1,y2-y1) < 2.5 && country.anchor.every(Number.isFinite)) {
      const dot = svgElement('circle',{cx:country.anchor[0] + (region === 'Oceanía' && country.anchor[0] < 35 ? 360 : 0),cy:country.anchor[1],class:'dot','aria-hidden':'true'});
      dot.dataset.answer = country.id;
      dot.classList.add('interactive');
      $('markers').append(dot);
    }
  }
  if (physicalActive()) {
    for (const item of queue) {
      const [cx, cy] = item.anchor;
      const dot = svgElement('circle',{cx,cy,class:'physical-dot'});
      interactive(dot,item);
      $('markers').append(dot);
    }
    homeView = [77, 67, 73, 78];
  } else {
    homeView = continentalViews[region] || (oceanMode || continentMode ? [0,0,360,175] : worldView);
  }
  updateView(homeView);
}

function shuffle(items) {
  const shuffled = items.slice();
  for (let i = shuffled.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [shuffled[i],shuffled[j]] = [shuffled[j],shuffled[i]];
  }
  return shuffled;
}

function say(name) {
  if (!speechAvailable || !name) return;
  window.speechSynthesis.cancel();
  const sentence = new SpeechSynthesisUtterance(name);
  sentence.lang = 'es';
  window.speechSynthesis.speak(sentence);
}

function updatePanel() {
  const target = queue[current];
  const done = !study && !target;
  $('step').textContent = study ? '' : (done ? current : current+1) + ' / ' + queue.length;
  $('bar').style.width = (study ? 0 : current / queue.length * 100) + '%';
  $('mode-label').textContent = study ? 'ESTUDIO' : 'DESAFÍO';
  $('instruction').textContent = study ? 'Toca cualquier lugar activo' : done ? 'Partida completada' : 'Encuentra en el mapa';
  $('target').textContent = study ? 'Explora el mapa' : done ? '¡Bien hecho!' : target.name;
  $('feedback').textContent = study ? 'Selecciona un lugar para conocer su nombre.' : done ? correct + ' aciertos de ' + queue.length + ' lugares.' : 'Selecciona el lugar indicado.';
  $('speak').hidden = !speechAvailable || study || done;
  $('hint').hidden = study || done;
  $('skip').hidden = study || done;
  $('restart').hidden = !done;
  $('new-round').hidden = study;
  $('scope').textContent = queue.length + (physicalActive() ? ' lugares' : region === 'Océanos' ? ' océanos' : region === 'Continentes' ? ' continentes' : ' países');
  $('map-title').textContent = physicalActive() ? 'Sudamérica · ' + $('physical-category').value : region==='Mundo' ? 'Mapa mundial' : region;
  updateScores();
  if (!study && audio && target) say(target.name);
}

function start() {
  clearTimeout(timer);
  if (speechAvailable) window.speechSynthesis.cancel();
  locked = false;
  current = correct = errors = streak = 0;
  completed = new Set();
  $('south-menu').hidden = region !== 'Sudamérica';
  $('physical-picker').hidden = !physicalActive();
  $('south-countries').setAttribute('aria-pressed',String(!southPhysical));
  $('south-physical').setAttribute('aria-pressed',String(southPhysical));
  const items = physicalActive() ? southAmericaPlaces[$('physical-category').value] : region === 'Océanos' ? oceans : region === 'Continentes' ? continents : playable.filter(c=>region==='Mundo' || c.region===region);
  queue = shuffle(items);
  for (const button of $('regions').children) button.setAttribute('aria-pressed',String(button.textContent===region));
  $('quiz').setAttribute('aria-pressed',String(!study));
  $('study').setAttribute('aria-pressed',String(study));
  setupMap();
  updatePanel();
}

function updateScores() {
  $('correct').textContent = correct;
  $('errors').textContent = errors;
  $('streak').textContent = streak;
}

function paint(id, style) {
  for (const element of map.querySelectorAll('[data-answer]')) {
    if (element.dataset.answer !== id) continue;
    element.classList.remove('wrong','revealed','correct');
    if (style) element.classList.add(style);
  }
}

function focusItem(item) {
  if (physicalActive()) {
    const [x,y] = item.anchor;
    const neighbors = queue.filter(other=>other !== item);
    const distance = Math.min(...neighbors.map(({anchor:[ox,oy]})=>Math.hypot(x-ox,y-oy)));
    const width = Math.max(.06, Math.min(14,distance*7));
    updateView([x-width/2,y-width*.35,width,width*.7]);
    return;
  }
  if (!item.box) return;
  const [x1,y1,x2,y2] = item.box;
  const width = Math.min(360, Math.max(6, (x2-x1)*1.65, (y2-y1)*2.7));
  const offset = region === 'Oceanía' && item.anchor?.[0] < 35 ? 360 : 0;
  updateView([(x1+x2-width)/2 + offset,(y1+y2-width*.65)/2,width,width*.65]);
}

function answer(id) {
  const item = queue.find(candidate=>candidate.id===id);
  if (!item || locked) return;
  if (study) {
    if (completed.size) paint([...completed][0]);
    completed = new Set([id]);
    paint(id,'correct');
    $('target').textContent = item.name;
    $('feedback').textContent = item.elevation ? item.elevation.toLocaleString('es-CL') + ' m según la lámina' : item.region || region;
    if (audio) say(item.name);
    return;
  }
  const target = queue[current];
  if (!target) return;
  if (item.id === target.id) {
    correct++;
    streak++;
    completed.add(id);
    paint(id,'correct');
    advance('¡Correcto! ' + target.name + '.',650);
  } else {
    errors++;
    streak = 0;
    paint(id,'wrong');
    setTimeout(()=> {
      if (queue.includes(item)) {
        const markedWrong = [...map.querySelectorAll('.wrong')].some(node=>node.dataset.answer===id);
        if (markedWrong) paint(id,completed.has(id)?'correct':'');
      }
    },600);
    $('feedback').textContent = 'Seleccionaste ' + item.name + '. Intenta otra vez.';
  }
  updateScores();
}

function advance(message, delay) {
  locked = true;
  $('feedback').textContent = message;
  timer = setTimeout(()=>{
    paint(queue[current].id,completed.has(queue[current].id)?'correct':'');
    current++;
    locked = false;
    updatePanel();
  },delay);
}

for (const category of Object.keys(southAmericaPlaces)) {
  const option = document.createElement('option');
  option.value = option.textContent = category;
  $('physical-category').append(option);
}
$('south-countries').onclick = () => { if (southPhysical) {southPhysical=false;start();} };
$('south-physical').onclick = () => { if (!southPhysical) {southPhysical=true;start();} };
$('physical-category').onchange = start;
window.addEventListener('resize',()=>updateView(view));

for (const scope of regions) {
  const button = document.createElement('button');
  button.textContent = scope;
  button.onclick = () => {region=scope;start();};
  $('regions').append(button);
}
$('quiz').onclick = () => { if (study) {study=false;start();} };
$('study').onclick = () => { if (!study) {study=true;start();} };
$('restart').onclick = $('new-round').onclick = start;
$('speak').onclick = () => say(queue[current]?.name);
$('audio').disabled = !speechAvailable;
$('audio').querySelector('span').textContent = speechAvailable ? 'Voz desactivada' : 'Voz no disponible';
$('audio').onclick = () => {
  audio = !audio;
  $('audio').setAttribute('aria-pressed',String(audio));
  $('audio').querySelector('span').textContent = audio ? 'Voz activada' : 'Voz desactivada';
  if (audio && !study) say(queue[current]?.name);
  if (!audio) window.speechSynthesis.cancel();
};
$('hint').onclick = () => {
  const item = queue[current];
  if (!item || locked) return;
  paint(item.id,'revealed');
  focusItem(item);
  $('feedback').textContent = 'Busca la zona resaltada en el mapa.';
};
$('skip').onclick = () => {
  const item = queue[current];
  if (!item || locked) return;
  streak = 0;
  updateScores();
  paint(item.id,'revealed');
  advance('Aquí está ' + item.name + '.',1150);
};
$('zoom-in').onclick = () => zoom(.72);
$('zoom-out').onclick = () => zoom(1/.72);
$('reset').onclick = () => updateView(homeView);

map.addEventListener('click',event=>{
  if (ignoreClick) {ignoreClick=false;return;}
  const element = event.target.closest('[data-answer]');
  if (element) answer(element.dataset.answer);
});
map.addEventListener('keydown',event=>{
  const element = event.target.closest('[data-answer]');
  if (element && ['Enter',' '].includes(event.key)) {
    event.preventDefault();
    answer(element.dataset.answer);
  }
});
map.addEventListener('pointerdown',event=>{
  if (!event.isPrimary || event.button!==0) return;
  ignoreClick = false;
  drag = {id:event.pointerId,x:event.clientX,y:event.clientY,view:view.slice(),scale:map.getScreenCTM().a,moved:false};
});
map.addEventListener('pointermove',event=>{
  if (!drag || drag.id!==event.pointerId) return;
  const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
  if (!drag.moved && Math.hypot(dx,dy)<5) return;
  if (!drag.moved) map.setPointerCapture(event.pointerId);
  drag.moved=true;
  map.classList.add('dragging');
  const [x,y,w,h]=drag.view;
  const nx=Math.max(-w*.72,Math.min((region === 'Oceanía' ? 405 : 360)-w*.28,x-dx/drag.scale));
  const ny=Math.max(-h*.72,Math.min(175-h*.28,y-dy/drag.scale));
  updateView([nx,ny,w,h]);
});
function stopDrag(event) {
  if (!drag || drag.id!==event.pointerId) return;
  ignoreClick=drag.moved;
  drag=undefined;
  map.classList.remove('dragging');
}
map.addEventListener('pointerup',stopDrag);
map.addEventListener('pointercancel',stopDrag);
map.addEventListener('pointerleave',event=>{if (!drag?.moved) stopDrag(event);});
start();

