'use strict';

// Representative points read from the historical reference, expressed as latitude and longitude.
chileItems['Pueblos originarios'] = [
  ['Aimaras', -19.25, -69.45, 'Altiplano del extremo norte.'],
  ['Licanantay', -23.1, -68.15, 'Interior del desierto de Atacama.'],
  ['Diaguitas', -29.2, -70.6, 'Valles transversales del Norte Chico.'],
  ['Changos', -24.2, -70.6, 'Litoral del norte de Chile.'],
  ['Picunches', -33.55, -71.1, 'Valles de la zona central.'],
  ['Mapuches', -38.25, -72.55, 'Centro-sur de Chile, en el sector de la Araucanía.'],
  ['Huilliches', -40.6, -72.85, 'Zona de Osorno y Llanquihue.'],
  ['Cuncos', -42.28, -74.0, 'Litoral de Chiloé y sectores costeros vecinos.'],
  ['Chiquiyanes', -34.6, -70.25, 'Cordillera de la zona central.'],
  ['Pehuenches', -38.05, -71.1, 'Cordillera andina del centro-sur.'],
  ['Puelches', -40.55, -70.05, 'Al este de los Andes, en el norte de la Patagonia.'],
  ['Poyas', -42.7, -71.45, 'Vertiente oriental de los Andes patagónicos.'],
  ['Chonos', -45.15, -74.3, 'Archipiélagos al sur de Chiloé.'],
  ['Aónikenk', -48.9, -71.2, 'Estepa de la Patagonia continental.'],
  ['Kawashkar', -51.1, -74.65, 'Canales y archipiélagos de la Patagonia occidental.'],
  ['Selk’nam', -53.65, -69.4, 'Isla Grande de Tierra del Fuego.'],
  ['Yaganes', -55.05, -67.9, 'Canal Beagle y archipiélagos australes.'],
  ['Rapa Nui', -27.12, -109.35, 'Rapa Nui, en el océano Pacífico.']
].map(([name, lat, lon, detail], index) => ({
  id: 'pueblo-' + index,
  name,
  detail,
  anchor: [lon + 180, 85 - lat]
}));
