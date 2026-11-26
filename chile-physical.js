'use strict';

// Latitud y longitud de referencia. Para sistemas amplios, el punto
// indica un sector de referencia y no delimita toda la cuenca.
const chilePhysical = {
  'Volcanes': [
    ['15','Parinacota',-18.166,-69.142,1],['15','Pomerape',-18.128,-69.125],['15','Guallatiri',-18.42,-69.09],['15','Tacora',-17.72,-69.77],
    ['01','Isluga',-19.15,-68.83,1],['01','Irruputuncu',-20.73,-68.56],
    ['02','Pular',-24.19,-68.05,1],['02','Aucanquilcha',-21.22,-68.47],['02','San Pedro (Antofagasta)',-21.89,-68.40],['02','San Pablo',-21.88,-68.33],
    ['03','Nevado Ojos del Salado',-27.11,-68.54,1],
    ['13','San José',-33.79,-69.89,1],['13','Tupungatito (Bravard)',-33.40,-69.80],['13','Maipo',-34.16,-69.83],
    ['06','El Palomo',-34.61,-70.29,1],['06','Tinguiririca',-34.81,-70.35],
    ['07','Peteroa',-35.24,-70.57,1],['07','Descabezado Grande',-35.58,-70.75],['07','San Pedro (Maule)',-35.99,-70.85],['07','Nevado de Longaví',-36.19,-71.16],
    ['16','Nevados de Chillán',-36.86,-71.38,1,'También figura en Biobío en la lámina.','08'],
    ['08','Callaqui',-37.92,-71.45,1],['08','Copahue',-37.86,-71.18],['08','Antuco',-37.41,-71.35],
    ['09','Lanín',-39.64,-71.50,1],['09','Llaima',-38.69,-71.73],['09','Tolhuaca',-38.31,-71.65],['09','Lonquimay',-38.38,-71.58],
    ['14','Mocho',-39.93,-72.03,1],['14','Choshuenco',-39.91,-72.04],['14','Puyehue–Cordón Caulle',-40.59,-72.12],
    ['10','Osorno',-41.11,-72.49,1],['10','Michinmahuida',-42.79,-72.44],['10','Corcovado',-43.19,-72.80],['10','Calbuco',-41.33,-72.62],
    ['11','Lautaro',-49.02,-73.51,1],['11','Melimoyu',-44.08,-72.86],['11','Hudson',-45.90,-72.97],
  ],
  'Cerros': [
    ['15','Acotango',-18.38,-69.05,1],['15','Puquintica',-18.57,-69.10],['15','Taapaca',-18.11,-69.50],['15','Lliscaya',-18.88,-68.93],
    ['01','Lirima',-19.87,-68.87,1],['01','Toroni',-20.54,-68.70],['01','Cariquima',-19.69,-68.66],['01','Tatajachura',-19.50,-69.12],
    ['02','Llullaillaco',-24.72,-68.54,1],['02','Palpana',-21.54,-68.52],['02','Polapi',-21.99,-68.62],['02','Miñiques',-23.82,-67.73],
    ['03','Tres Cruces',-27.11,-68.80,1],['03','Incahuasi',-27.03,-68.30],['03','Del Toro',-29.14,-69.77],['03','Ermitaño',-27.20,-68.97],
    ['04','Olivares',-30.08,-69.88,1],['04','Las Tórtolas',-29.96,-69.92],['04','Desfiladero',-30.53,-70.12],['04','Ingaguas',-30.27,-70.05],
    ['05','Juncalito (Juncal Chico)',-33.00,-70.08,1],['05','Alto de los Leones',-32.92,-70.12],['05','Altar',-33.28,-70.32],['05','La Paloma',-33.29,-70.30,0,'Zona cordillerana limítrofe.'],
    ['13','Tupungato',-33.36,-69.77,1],['13','Marmolejo',-33.73,-69.88],['13','Nevado Piuquenes',-33.60,-69.85],['13','El Plomo',-33.24,-70.21],
    ['06','Paredones',-34.24,-70.09,1],['06','El Moño',-34.45,-70.12],['06','De los Piuquenes',-34.63,-70.10],['06','El Yeso',-34.48,-70.23],
    ['07','El Planchón',-35.15,-70.57,1],['07','El Horno',-35.56,-70.62],['07','Mora',-35.79,-70.71],['07','San Pablo',-36.00,-70.96],
    ['08','De las Minas',-36.98,-71.18,1],['08','Las Melosas',-37.10,-71.23],['08','Pilmahuida',-37.98,-71.27],
    ['09','Batea Mahuida',-38.84,-71.06,1],['09','Nevados de Sollipulli',-38.97,-71.52],
    ['10','Monte Tronador',-41.16,-71.89,1],['10','Puntiagudo',-40.98,-72.27],['10','Aguja Sur',-41.45,-72.13],['10','Aguja Norte',-41.40,-72.13],
    ['11','O’Higgins',-48.94,-73.23,1],['11','El Riñón',-46.78,-72.13],['11','Castillo',-46.09,-72.20],['11','Hyades',-48.78,-73.28],
    ['12','Balmaceda',-51.41,-73.11,1],['12','Obelisco',-50.95,-73.19],['12','Donoso',-51.25,-73.30],
  ],
  'Montes': [
    ['11','San Valentín',-46.59,-73.35,1],['11','San Lorenzo',-47.59,-72.31],
    ['12','Fitz Roy',-49.27,-73.04,1,'Cumbre fronteriza, según la lámina.'],['12','Campanario',-50.53,-73.16],
  ],
  'Cuencas hidrográficas': [
    ['15','Río Lluta',-18.40,-70.08,0,'Exorreica · origen andino altiplánico · alimentación pluvio-nivo-glacial.'],
    ['02','Río Loa',-22.37,-68.89],['03','Río Copiapó',-27.56,-70.26],['03','Río Huasco',-28.62,-70.49],
    ['04','Río Elqui',-29.98,-70.75],['04','Río Limarí',-30.64,-71.15],['04','Río Quilimarí',-32.11,-71.43],
    ['04','Río Choapa',-31.77,-71.03],['04','Río Los Choros',-29.32,-71.05,0,'Alimentación pluvial.'],
    ['05','Río Aconcagua',-32.88,-71.02],['05','Peñuelas',-33.13,-71.55],['13','Río Maipo',-33.73,-70.42],
    ['06','Río Rapel',-34.23,-71.47],['07','Río Maule',-35.67,-71.22],
    ['16','Río Itata / Ñuble',-36.63,-72.13],['08','Río Biobío',-37.63,-72.09],
    ['09','Río Toltén',-39.23,-72.55],['14','Río Valdivia',-39.83,-73.26],['14','Río Bueno',-40.36,-73.04,0,'Sistema Río Bueno–Río Puelo · exorreico.','10'],
    ['10','Río Puelo',-41.67,-72.22,0,'Sistema Río Bueno–Río Puelo · exorreico.','14'],
    ['10','Río Palena',-43.72,-72.19,0,'Sistema Río Palena–Río Aysén · exorreico.','11'],
    ['11','Río Cisnes',-44.68,-72.20,0,'Sistema Río Palena–Río Aysén · exorreico.'],
    ['11','Río Aysén',-45.40,-72.62,0,'Sistemas Río Palena–Río Aysén y Río Aysén–Río Baker–Península de Taitao · exorreicos.'],
    ['11','Río Baker',-47.49,-72.98,0,'Sistema Río Aysén–Río Baker–Península de Taitao · exorreico.'],
    ['11','Península de Taitao',-46.45,-75.05,0,'Sistema Río Aysén–Río Baker–Península de Taitao · exorreico.'],
    ['01','Pampa del Tamarugal',-20.47,-69.66,0,'Drenaje endorreico y arreico según el sector de la lámina.'],
    ['01','Costeras quebrada Tiliviche–Boca',-19.55,-70.05,0,'Drenaje arreico.'],
    ['15','Cuencas altiplánicas',-18.27,-69.15,0,'Exorreicas según la lámina · origen andino altiplánico · alimentación nivo-pluvial.'],
    ['02','Salares Carcote–Ascotán',-21.52,-68.28,0,'Endorreicos · origen andino altiplánico · alimentación nivo-pluvial. La lámina indica alimentación pluvio-nival para otros salares.'],
    ['02','Altiplánicas del Salar de Atacama',-23.29,-67.67,0,'Drenaje endorreico.'],
    ['02','Pie de monte del Salar de Atacama',-23.28,-68.01,0,'Drenaje endorreico.'],
    ['02','Salar de Atacama',-23.52,-68.24,0,'Drenaje endorreico.'],
    ['02','Salar Los Morros–Salar Pajonales',-25.14,-68.81,0,'Drenaje endorreico.'],
    ['03','Salar de la Isla–Salar de Maricunga',-26.61,-69.04,0,'Drenaje endorreico.'],
    ['11','Costeras del Campo de Hielo Sur',-48.88,-74.07,0,'Exorreicas · origen andino · alimentación glacio-nivo-pluvial.','12'],
    ['12','Costeras-lacustres de la cordillera Sarmiento',-51.76,-73.37,0,'Exorreicas · origen andino pampeano patagónico · alimentación glacio-nivo-pluvial.'],
    ['12','Archipiélago Desolación–Santa Inés',-53.27,-73.09,0,'Exorreico · origen intrainsular · alimentación nivo-fluvial-glacial.'],
    ['12','Territorio Chileno Antártico',-64.4,-62.2,0,'Territorio reclamado por Chile · origen inlandsis · alimentación glacial, según la lámina.'],
  ],
};

const chileReservoirs = [
  ['02','Conchi',-22.025,-68.58,'Loa','Riego · entre los de menor capacidad de la lámina.'],
  ['03','Lautaro',-27.96,-70.00,'Copiapó'],['03','Santa Juana',-28.73,-70.60,'Huasco'],
  ['04','La Laguna',-30.20,-70.02,'Elqui'],['04','Puclaro',-30.03,-70.80,'Elqui'],
  ['04','Recoleta',-30.50,-71.17,'Limarí'],['04','La Paloma',-30.72,-71.03,'Limarí'],['04','Cogotí',-31.00,-71.05,'Limarí'],
  ['04','Culimo',-32.12,-71.35,'Quilimarí','Riego · entre los de menor capacidad de la lámina.'],
  ['04','El Bato',-31.51,-71.00,'Choapa'],['04','Corrales',-31.94,-70.93,'Choapa'],
  ['05','Los Aromos',-32.99,-71.40,'Aconcagua','Agua potable.'],['05','Peñuelas',-33.14,-71.55,'Peñuelas','Agua potable.'],
  ['13','El Yeso',-33.67,-70.10,'Maipo','Agua potable.'],['13','Rungue',-33.05,-70.92,'Maipo','Riego · entre los de menor capacidad de la lámina.'],
  ['06','Convento Viejo',-34.79,-71.14,'Rapel'],['06','Rapel',-34.16,-71.56,'Rapel','Electricidad.'],
  ['07','Colbún',-35.69,-71.30,'Maule','Electricidad y riego · entre los de mayor capacidad de la lámina.'],
  ['07','Laguna del Maule',-36.00,-70.58,'Maule','Electricidad y riego · entre los de mayor capacidad de la lámina.'],
  ['07','Bullileo',-36.29,-71.43,'Maule'],['07','Digua',-36.17,-71.63,'Maule'],
  ['07','Tutuvén',-36.00,-72.44,'Maule','Riego · entre los de menor capacidad de la lámina.'],
  ['16','Coihueco',-36.61,-71.78,'Itata'],
  ['08','Lago Laja',-37.36,-71.28,'Biobío','Electricidad y riego · entre los de mayor capacidad de la lámina.'],
  ['08','Ralco',-38.00,-71.46,'Biobío','Electricidad.'],['08','Pangue',-37.90,-71.59,'Biobío','Electricidad.'],
];
chilePhysical.Embalses = chileReservoirs.map(([code,name,lat,lon,basin,notes]) =>
  [code,name,lat,lon,0,'Cuenca: '+basin+'.'+(notes ? ' '+notes : '')]);

for (const [theme,entries] of Object.entries(chilePhysical)) {
  chileItems[theme] = entries.map(([regionCode,name,lat,lon,highlight,notes,otherRegion],index)=>{
    const regionName = chileDirectory.find(([code])=>code===regionCode)[1];
    return {id:'chile-'+theme+'-'+index, name, regionCode, otherRegion, anchor:[lon+180,85-lat],
      detail:[regionName,highlight ? 'Mayor altura de su categoría en la región según la lámina.' : '',notes].filter(Boolean).join(' · ')};
  });
}
