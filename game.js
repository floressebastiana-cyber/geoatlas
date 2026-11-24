'use strict';

const $ = id => document.getElementById(id);
const map = $('map');
const worldView = [0, 0, 360, 175];
const colors = {'Norteamérica':'#a8d6bc','Sudamérica':'#ecc489','Europa':'#edaca0','África':'#e4c46f','Asia':'#bcb9e1','Oceanía':'#81c9c1'};
const continentalViews = {'Norteamérica':[0,0,142,82],'Sudamérica':[92,69,58,76],'Europa':[146,10,84,47],'África':[155,43,86,82],'Asia':[200,5,160,94],'Oceanía':[285,79,105,65]};
const regions = ['Mundo', ...Object.keys(colors), 'Continentes', 'Océanos', 'Chile'];
const countryPalettes = {
  'Norteamérica':['#7ac7a0','#a0cf72','#69bcad','#b4d98a','#8ac7d3'],
  'Sudamérica':['#f0b971','#ea9c75','#ebcc64','#d6c67e','#efafaa'],
  'Europa':['#edaaa7','#eebbd6','#eaa584','#cd9cbb','#f3c28b'],
  'África':['#e9c55e','#dfab65','#ecd982','#c9c979','#e6aa87'],
  'Asia':['#afabdc','#a8bde7','#c4acd9','#a2b6d3','#d3bee8'],
  'Oceanía':['#67c2be','#83d0cf','#90c9e0','#9acfaf','#80b8d6']
};
const waterColors = ['#aed6e8','#84c7db','#a4bcdf','#95d1cb','#bed7ee'];
const chileColors = ['#e9a66d','#f2d26c','#b0c879','#f0ad92','#70c9bb','#97addf','#cbb0d7','#e7bd72','#8bc8da','#d4d17a','#eca59d','#9dc78c','#82ada9','#d2b98c','#ada5d9','#91c3e1'];
const chileColor = new Map(chileDirectory.map(([code],index)=>[code,chileColors[index]]));
const countryColor = new Map(countries.map((country,index)=>[
  country.id, countryPalettes[country.region]?.[index % 5] || '#e3e8e4'
]));
const chileView = [98,101,23,42];
const rapaNuiView = [70.28,111.88,.58,.55];
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
const VoiceContext = window.AudioContext || window.webkitAudioContext;
const voiceSupported = !!VoiceContext || speechAvailable;
let voiceContext;
let voiceBuffer;
let voiceSource;
let voiceRequest = 0;
const applause = new Audio('applause.wav?v=celebracion');
applause.volume = .52;
let effects = true;
const chileActive = () => region === 'Chile';
const chileTheme = () => $('chile-category').value;
const provincialMode = () => ['Provincias','Capitales provinciales'].includes(chileTheme());
const capitalsMode = () => chileTheme().startsWith('Capitales');
const pointMode = () => physicalActive() || (chileActive() && capitalsMode());
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
    dot.setAttribute('r', pointMode() && scale ? 7 / scale : Math.min(1.25, view[2] / 230));
  }
}

function zoom(scale) {
  const [x,y,w,h] = view;
  if (w*scale < (pointMode() ? .04 : 2) || w*scale > 540) return;
  updateView([x + w*(1-scale)/2, y + h*(1-scale)/2, w*scale, h*scale]);
}

function setupMap() {
  $('lands').replaceChildren();
  $('waters').replaceChildren();
  $('markers').replaceChildren();
  $('chile-shapes').replaceChildren();
  map.classList.toggle('chile-map',chileActive());
  const oceanMode = region === 'Océanos';
  const continentMode = region === 'Continentes';
  const available = new Set(queue.map(item=>item.id));
  const groups = new Map();

  if (oceanMode) {
    for (const [index,ocean] of oceans.entries()) {
      const path = svgElement('path',{d:ocean.d,class:'water',style:'--water-fill:'+waterColors[index]});
      interactive(path,ocean);
      $('waters').append(path);
    }
  }
  for (const country of countries) {
    const belongs = available.has(country.id);
    const continent = country.id === 'ATA' ? 'Antártida' : country.region;
    if (chileActive() && country.id === 'CHL') continue;
    const colored = belongs || region === 'Mundo' || (physicalActive() && continent === 'Sudamérica');
    const fill = continentMode ? colors[continent] || '#d1e2ec' : colored ? countryColor.get(country.id) : '#e3e9e2';
    const path = svgElement('path',{d:country.d,fill,class:'land'});
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
  if (chileActive()) {
    drawChile(available);
    homeView = chileViewForFilter();
  } else if (physicalActive()) {
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

function chileViewForFilter() {
  const code = provincialMode() && $('chile-filter').value;
  if (!code) return chileView;
  const mainland = chileItems.Provincias.filter(item=>item.regionCode===code && item.provinceCode!=='052');
  const xs = mainland.map(item=>item.anchor[0]);
  const ys = mainland.map(item=>item.anchor[1]);
  const width = Math.max(4, Math.max(...xs)-Math.min(...xs)+2);
  const height = Math.max(4, Math.max(...ys)-Math.min(...ys)+2.4);
  return [(Math.min(...xs)+Math.max(...xs)-width)/2,(Math.min(...ys)+Math.max(...ys)-height)/2,width,height];
}

function drawChile(available) {
  const shapes = $('chile-shapes');
  for (const item of chileItems.Regiones) {
    const group = svgElement('g',{});
    if (available.has(item.id)) interactive(group,item);
    let provinceIndex = 0;
    for (const province of chileItems.Provincias.filter(entry=>entry.regionCode===item.regionCode)) {
      const active = available.has(province.id);
      const fill = provincialMode()
        ? ['#eab876','#89c8be','#a1a8dd','#edab9f','#b9ce7e','#92bfdd','#d6afd7','#e3ce75'][provinceIndex++]
        : chileColor.get(item.regionCode);
      const path = svgElement('path',{d:chilePaths[province.provinceCode],fill,class:'land chile-shape'});
      if (provincialMode() && $('chile-filter').value && item.regionCode!==$('chile-filter').value) path.setAttribute('opacity','.52');
      if (active) interactive(path,province);
      group.append(path);
    }
    shapes.append(group);
  }
  if (!capitalsMode()) return;
  for (const item of queue) {
    const [cx,cy] = item.anchor;
    const dot = svgElement('circle',{cx,cy,class:'physical-dot'});
    interactive(dot,item);
    $('markers').append(dot);
  }
}

function shuffle(items) {
  const shuffled = items.slice();
  for (let i = shuffled.length-1; i>0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [shuffled[i],shuffled[j]] = [shuffled[j],shuffled[i]];
  }
  return shuffled;
}

function preferredVoice(voice) {
  const lang = voice.lang.toLowerCase().replace('_','-');
  const knownFemale = /paulina|monica|mónica|angelica|angélica|maria|maría|sabina|dalia|beatriz|salom[eé]|catalina|camila|valentina|elena|laura|carla|paloma|karla|jimena|renata|isabella|female/i.test(voice.name);
  const latin = /^es-(?!es$)/.test(lang);
  const natural = /natural|neural|online|premium|enhanced/i.test(voice.name);
  return (latin ? 40 : 0) + (lang==='es-cl' ? 10 : 0) + (knownFemale ? 60 : 0)
    + (knownFemale && latin ? 40 : 0) + (natural ? 20 : 0);
}

function spanishVoices() {
  return window.speechSynthesis.getVoices().filter(voice=>/^es(?:[-_]|$)/i.test(voice.lang))
    .sort((a,b)=>preferredVoice(b)-preferredVoice(a));
}

function refreshVoices() {
  const select = $('voice');
  const previous = select.value;
  select.options.length = 1;
  for (const voice of spanishVoices()) {
    const option = document.createElement('option');
    option.value = voice.voiceURI;
    option.textContent = voice.name + ' (' + voice.lang + ')';
    select.append(option);
  }
  if ([...select.options].some(option=>option.value===previous)) select.value = previous;
  select.disabled = select.options.length === 1 && !VoiceContext;
}

function stopVoice() {
  voiceRequest++;
  if (voiceSource) {
    voiceSource.stop();
    voiceSource = null;
  }
  if (speechAvailable) window.speechSynthesis.cancel();
}

async function say(name) {
  if (!voiceSupported || !name) return;
  stopVoice();
  const request = voiceRequest;
  const clip = Object.hasOwn(recordedPrompts,name) && recordedPrompts[name];
  if (!$('voice').value && VoiceContext && clip) {
    try {
      voiceContext ||= new VoiceContext();
      const resumed = voiceContext.resume();
      voiceBuffer ||= fetch('voice-daniela.mp3')
        .then(response=>{
          if (!response.ok) throw Error('No se pudo cargar la voz');
          return response.arrayBuffer();
        })
        .then(bytes=>voiceContext.decodeAudioData(bytes));
      const [, buffer] = await Promise.all([resumed,voiceBuffer]);
      if (voiceRequest !== request) return;
      const source = voiceContext.createBufferSource();
      source.buffer = buffer;
      source.connect(voiceContext.destination);
      source.onended = () => { if (voiceSource === source) voiceSource = null; };
      source.start(0,clip[0],clip[1]);
      voiceSource = source;
      return;
    } catch {
      voiceBuffer = null;
      if (voiceRequest !== request) return;
    }
  }
  if (!speechAvailable) return;
  const sentence = new SpeechSynthesisUtterance(name);
  const voices = spanishVoices();
  const selected = voices.find(voice=>voice.voiceURI===$('voice').value) || voices[0];
  if (selected) sentence.voice = selected;
  sentence.lang = selected?.lang || 'es-CL';
  sentence.rate = .94;
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
  $('speak').hidden = !voiceSupported || study || done;
  $('hint').hidden = study || done;
  $('skip').hidden = study || done;
  $('restart').hidden = !done;
  $('new-round').hidden = study;
  $('scope').textContent = queue.length + (chileActive() || physicalActive() ? ' lugares' : region === 'Océanos' ? ' océanos' : region === 'Continentes' ? ' continentes' : ' países');
  $('map-title').textContent = chileActive() ? 'Chile · ' + chileTheme() : physicalActive() ? 'Sudamérica · ' + $('physical-category').value : region==='Mundo' ? 'Mapa mundial' : region;
  updateScores();
  if (!study && audio && target) say(target.name);
}

function start() {
  clearTimeout(timer);
  stopVoice();
  locked = false;
  current = correct = errors = streak = 0;
  completed = new Set();
  $('south-menu').hidden = region !== 'Sudamérica';
  $('physical-picker').hidden = !physicalActive();
  $('south-countries').setAttribute('aria-pressed',String(!southPhysical));
  $('south-physical').setAttribute('aria-pressed',String(southPhysical));
  $('chile-menu').hidden = !chileActive();
  $('chile-attribution').hidden = !chileActive();
  $('chile-filter-label').hidden = !provincialMode();
  const chileanOptions = chileActive()
    ? chileItems[chileTheme()].filter(item=>!provincialMode() || !$('chile-filter').value || item.regionCode===$('chile-filter').value)
    : null;
  const items = chileanOptions || (physicalActive() ? southAmericaPlaces[$('physical-category').value] : region === 'Océanos' ? oceans : region === 'Continentes' ? continents : playable.filter(c=>region==='Mundo' || c.region===region));
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
  if (chileActive() && !capitalsMode()) {
    if (item.provinceCode==='052') updateView(rapaNuiView);
    else {
      const [x,y] = item.anchor;
      updateView([x-2,y-2,4,4]);
    }
    return;
  }
  if (pointMode()) {
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
    $('feedback').textContent = item.detail || (item.elevation ? item.elevation.toLocaleString('es-CL') + ' m según la lámina' : item.region || region);
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
    if (effects) {
      applause.currentTime = 0;
      applause.play().catch(()=>{});
    }
    advance('¡Correcto! ' + target.name + '.',effects ? 1080 : 650);
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

for (const category of Object.keys(chileItems)) {
  const option = document.createElement('option');
  option.value = option.textContent = category;
  $('chile-category').append(option);
}
for (const [code,name] of chileDirectory) {
  const option = document.createElement('option');
  option.value = code;
  option.textContent = name;
  $('chile-filter').append(option);
}
$('chile-category').onchange = $('chile-filter').onchange = start;
$('rapa-nui').onclick = () => updateView(rapaNuiView);
$('open-chile').onclick = () => {region = 'Chile'; start();};

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
$('audio').disabled = !voiceSupported;
$('voice').closest('label').hidden = !voiceSupported;
if (speechAvailable) {
  refreshVoices();
  window.speechSynthesis.addEventListener('voiceschanged',refreshVoices);
  $('voice').onchange = () => {
    if (audio && !study) say(queue[current]?.name);
  };
}
$('effects').onclick = () => {
  effects = !effects;
  if (!effects) applause.pause();
  $('effects').setAttribute('aria-pressed',String(effects));
  $('effects').textContent = effects ? 'Aplausos activados' : 'Aplausos desactivados';
};
$('audio').querySelector('span').textContent = voiceSupported ? 'Voz desactivada' : 'Voz no disponible';
$('audio').onclick = () => {
  audio = !audio;
  $('audio').setAttribute('aria-pressed',String(audio));
  $('audio').querySelector('span').textContent = audio ? 'Voz activada' : 'Voz desactivada';
  if (audio && !study) say(queue[current]?.name);
  if (!audio) stopVoice();
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

