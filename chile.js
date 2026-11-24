'use strict';

const chileDirectory = [
  ['15','Arica y Parinacota','Arica',[
    ['151','Arica','Arica',-18.48,-70.31], ['152','Parinacota','Putre',-18.20,-69.56],
  ]],
  ['01','Tarapacá','Iquique',[
    ['011','Iquique','Iquique',-20.22,-70.14], ['014','Tamarugal','Pozo Almonte',-20.26,-69.79],
  ]],
  ['02','Antofagasta','Antofagasta',[
    ['021','Antofagasta','Antofagasta',-23.65,-70.40], ['022','El Loa','Calama',-22.46,-68.93],
    ['023','Tocopilla','Tocopilla',-22.09,-70.20],
  ]],
  ['03','Atacama','Copiapó',[
    ['031','Copiapó','Copiapó',-27.37,-70.33], ['032','Chañaral','Chañaral',-26.35,-70.62],
    ['033','Huasco','Vallenar',-28.58,-70.76],
  ]],
  ['04','Coquimbo','La Serena',[
    ['041','Elqui','La Serena',-29.90,-71.25], ['042','Choapa','Illapel',-31.63,-71.17],
    ['043','Limarí','Ovalle',-30.60,-71.20],
  ]],
  ['05','Valparaíso','Valparaíso',[
    ['051','Valparaíso','Valparaíso',-33.05,-71.62], ['052','Isla de Pascua','Hanga Roa',-27.15,-109.43],
    ['053','Los Andes','Los Andes',-32.83,-70.60], ['054','Petorca','La Ligua',-32.45,-71.23],
    ['055','Quillota','Quillota',-32.88,-71.25], ['056','San Antonio','San Antonio',-33.59,-71.61],
    ['057','San Felipe de Aconcagua','San Felipe',-32.75,-70.73], ['058','Marga Marga','Quilpué',-33.05,-71.44],
  ]],
  ['13','Metropolitana de Santiago','Santiago',[
    ['131','Santiago','Santiago',-33.44,-70.65], ['132','Cordillera','Puente Alto',-33.61,-70.58],
    ['133','Chacabuco','Colina',-33.20,-70.67], ['134','Maipo','San Bernardo',-33.59,-70.70],
    ['135','Melipilla','Melipilla',-33.69,-71.22], ['136','Talagante','Talagante',-33.66,-70.93],
  ]],
  ['06','Libertador General Bernardo O’Higgins','Rancagua',[
    ['061','Cachapoal','Rancagua',-34.17,-70.74], ['062','Cardenal Caro','Pichilemu',-34.39,-72.01],
    ['063','Colchagua','San Fernando',-34.58,-70.99],
  ]],
  ['07','Maule','Talca',[
    ['071','Talca','Talca',-35.43,-71.66], ['072','Cauquenes','Cauquenes',-35.96,-72.32],
    ['073','Curicó','Curicó',-34.98,-71.24], ['074','Linares','Linares',-35.85,-71.59],
  ]],
  ['16','Ñuble','Chillán',[
    ['161','Diguillín','Bulnes',-36.74,-72.30], ['162','Itata','Quirihue',-36.28,-72.54],
    ['163','Punilla','San Carlos',-36.42,-71.96],
  ]],
  ['08','Biobío','Concepción',[
    ['081','Concepción','Concepción',-36.83,-73.05], ['082','Arauco','Lebu',-37.61,-73.65],
    ['083','Biobío','Los Ángeles',-37.47,-72.35],
  ]],
  ['09','La Araucanía','Temuco',[
    ['091','Cautín','Temuco',-38.74,-72.60], ['092','Malleco','Angol',-37.80,-72.71],
  ]],
  ['14','Los Ríos','Valdivia',[
    ['141','Valdivia','Valdivia',-39.82,-73.24], ['142','Ranco','La Unión',-40.29,-73.08],
  ]],
  ['10','Los Lagos','Puerto Montt',[
    ['101','Llanquihue','Puerto Montt',-41.47,-72.94], ['102','Chiloé','Castro',-42.48,-73.76],
    ['103','Osorno','Osorno',-40.57,-73.13], ['104','Palena','Chaitén',-42.92,-72.71],
  ]],
  ['11','Aysén del General Carlos Ibáñez del Campo','Coyhaique',[
    ['111','Coyhaique','Coyhaique',-45.57,-72.07], ['112','Aysén','Puerto Aysén',-45.40,-72.70],
    ['113','Capitán Prat','Cochrane',-47.25,-72.57], ['114','General Carrera','Chile Chico',-46.54,-71.72],
  ]],
  ['12','Magallanes y de la Antártica Chilena','Punta Arenas',[
    ['121','Magallanes','Punta Arenas',-53.16,-70.91], ['122','Antártica Chilena','Puerto Williams',-54.93,-67.62],
    ['123','Tierra del Fuego','Porvenir',-53.30,-70.37], ['124','Última Esperanza','Puerto Natales',-51.73,-72.50],
  ]],
];

// Chillán es capital regional, aunque la capital provincial de Diguillín es Bulnes.
const chileCapitalCoordinates = {'16':[-36.61,-72.10]};
const chileItems = {'Regiones':[], 'Capitales regionales':[], 'Provincias':[], 'Capitales provinciales':[]};

for (const [code, name, capital, provinces] of chileDirectory) {
  const provincialCapital = provinces.find(entry => entry[2] === capital);
  const [lat, lon] = chileCapitalCoordinates[code] || provincialCapital.slice(3);
  const regionItem = {id:'region-'+code, name, regionCode:code, detail:'Capital regional: '+capital, anchor:[lon+180,85-lat]};
  chileItems.Regiones.push(regionItem);
  chileItems['Capitales regionales'].push({...regionItem, id:'regional-capital-'+code, name:capital, detail:'Región de '+name});
  for (const [provinceCode, province, city, cityLat, cityLon] of provinces) {
    const item = {id:'province-'+provinceCode, name:province, regionCode:code, provinceCode,
      detail:'Capital provincial: '+city+' · '+name, anchor:[cityLon+180,85-cityLat]};
    chileItems.Provincias.push(item);
    chileItems['Capitales provinciales'].push({...item, id:'provincial-capital-'+provinceCode, name:city, detail:'Provincia de '+province+' · '+name});
  }
}
