'use strict';

// Coordenadas de referencia (latitud, longitud). Los lugares extensos
// se representan con un punto dentro de su zona.
const southAmericaGroups = {
  'Océanos': [
    ['Océano Pacífico', -29, -93], ['Océano Atlántico', -34, -40],
  ],
  'Mares': [
    ['Mar Caribe', 15, -74], ['Mar Chileno', -39, -80],
  ],
  'Estrechos': [
    ['Estrecho de Magallanes', -53.45, -71.22], ['Estrecho de Le Maire', -54.85, -65.02],
  ],
  'Relieve submarino': [
    ['Dorsal de Chile', -43, -84], ['Dorsal de las Georgias del Sur', -54, -44],
    ['Plataforma continental', -46, -63], ['Elevación de Río Grande', -30, -34],
  ],
  'Regiones naturales': [
    ['Selva Amazónica', -5, -61], ['Pantanal', -17.7, -57.4],
    ['Gran Chaco', -23, -61], ['Pampa', -35.5, -62], ['Patagonia', -46.5, -70],
  ],
  'Cordilleras': [
    ['Cordillera de Mérida', 8.65, -71], ['Cordillera Oriental', 5.9, -73.1],
    ['Cordillera Occidental', 4.55, -76.25], ['Cordillera de los Andes', -31, -70.3],
  ],
  'Macizos y llanos': [
    ['Macizo de las Guayanas', 4.7, -61], ['Llanos del Orinoco', 7.1, -68.3],
    ['Llanos de Chiquitos', -17.7, -60.8],
  ],
  'Sierras': [
    ['Sierra de Perijá', 10.3, -72.9], ['Serranía del Baudó', 5.9, -77.2],
    ['Sierra de los Gradaús', -7.8, -51], ['Sierra de Ibiapaba', -4, -41],
    ['Sierra Geral de Goiás', -13.8, -46.6], ['Sierra de Maracaju', -20.9, -55.5],
    ['Sierra de Paranapiacaba', -24.2, -48.5], ['Sierra del Mar', -22.7, -44.8],
    ['Sierra de Misiones', -26.8, -54.3], ['Sierras de Córdoba', -31.58, -64.84],
  ],
  'Mesetas': [
    ['Meseta de Borborema', -7.2, -36], ['Chapada Diamantina', -12.65, -41.5],
    ['Meseta Brasileña', -17, -47], ['Meseta del Mato Grosso', -14.4, -56],
  ],
  'Alturas destacadas': [
    ['Pico Bolívar', 8.54, -71.05], ['Pico Cristóbal Colón', 10.84, -73.69],
    ['Chimborazo', -1.47, -78.82], ['Huascarán', -9.12, -77.60],
    ['Yerupajá', -10.27, -76.91], ['Salcantay', -13.34, -72.54],
    ['Ampato', -15.82, -71.88], ['Coropuna', -15.52, -72.65],
    ['Illimani', -16.65, -67.78], ['Sajama', -18.11, -68.88],
    ['Tacora', -17.72, -69.77], ['Aucanquilcha', -21.22, -68.47],
    ['Pular', -24.19, -68.05], ['Llullaillaco', -24.72, -68.54],
    ['Bonete Chico', -28.02, -68.76], ['Antofalla', -25.55, -67.88],
    ['Ojos del Salado', -27.11, -68.54], ['Pissis', -27.75, -68.80],
    ['Tres Cruces', -27.11, -68.80], ['Mercedario', -31.98, -70.11],
    ['Aconcagua', -32.65, -70.01],
  ],
  'Golfos': [
    ['Golfo de Venezuela', 11.45, -71.15], ['Golfo de Paria', 10.36, -62.12],
    ['Golfo San Matías', -41.64, -64.55], ['Golfo Corcovado', -43.04, -73.36],
    ['Golfo de Ancud', -42.08, -73.05], ['Golfo San Jorge', -46.21, -66.51],
    ['Golfo de Penas', -47.48, -75.2], ['Golfo Trinidad', -50.03, -75.4],
    ['Golfo de Guayaquil', -3.06, -80.45],
  ],
  'Islas': [
    ['Isla de Marajó', -0.98, -49.55], ['Islas Galápagos', -0.65, -91.05],
    ['Isla San Félix', -26.29, -80.10], ['Isla San Ambrosio', -26.34, -79.89],
    ['Isla Alejandro Selkirk', -33.76, -80.78], ['Isla Robinson Crusoe', -33.64, -78.85],
    ['Isla Grande de Chiloé', -42.62, -73.99], ['Isla Grande de Tierra del Fuego', -54, -68.4],
    ['Islas Malvinas', -51.75, -59.14], ['Isla de los Estados', -54.79, -64.17],
    ['Islas Georgias del Sur', -54.42, -36.59], ['Islas Diego Ramírez', -56.52, -68.71],
  ],
  'Canales y archipiélagos': [
    ['Canal de Chacao', -41.80, -73.55], ['Archipiélago de Colón', -0.65, -91.05],
    ['Archipiélago Juan Fernández', -33.66, -79.48], ['Archipiélago Madre de Dios', -50.25, -75.21],
  ],
  'Bahías': [
    ['Bahía de Marajó', -0.76, -48.52], ['Bahía de São Marcos', -2.47, -44.42],
    ['Bahía de Todos los Santos', -12.84, -38.67], ['Bahía de Samborombón', -36.05, -57.23],
    ['Bahía Blanca', -38.93, -62.11], ['Bahía Grande', -51.34, -68.58],
  ],
  'Cabos': [
    ['Cabo de São Tomé', -22.04, -41.05], ['Cabo Frío', -22.99, -42.01],
    ['Cabo de Santa Marta Grande', -28.60, -48.81], ['Cabo San Antonio', -36.30, -56.75],
    ['Cabo Dos Bahías', -44.92, -65.53], ['Cabo Vírgenes', -52.33, -68.36],
    ['Cabo San Diego', -54.66, -65.12], ['Cabo de Hornos', -55.98, -67.27],
  ],
  'Penínsulas': [
    ['Península de la Guajira', 12.13, -71.66], ['Península Valdés', -42.54, -63.95],
    ['Península de Taitao', -46.45, -75.06],
  ],
  'Cataratas': [
    ['Cataratas de Kaieteur', 5.18, -59.48], ['Cataratas de Orinduik', 4.72, -60.04],
    ['Salto del Ángel', 5.97, -62.54], ['Catarata del Aracá', 0.91, -63.33],
    ['Catarata de Gocta', -6.03, -77.89], ['Catarata de Yumbilla', -5.93, -77.89],
    ['Salto del Laja', -37.22, -72.38], ['Garganta del Diablo', -25.695, -54.437],
    ['Cataratas del Iguazú', -25.687, -54.447], ['Saltos del Moconá', -27.15, -53.89],
    ['Catarata Velo de la Novia', -29.31, -50.83],
  ],
  'Lagos': [
    ['Lago Argentino', -50.26, -72.66], ['Lago Viedma', -49.57, -72.24],
    ['Lago General Carrera', -46.56, -72.10], ['Lago Llanquihue', -41.11, -72.81],
    ['Laguna Mar Chiquita', -30.74, -62.59], ['Laguna Merín (Mirim)', -32.83, -53.20],
    ['Laguna de los Patos', -31.05, -51.30], ['Lago Poopó', -18.60, -67.09],
    ['Lago Titicaca', -15.84, -69.40], ['Lago de Maracaibo', 9.77, -71.59],
  ],
  'Embalses': [
    ['Embalse de Guri', 7.71, -63.03], ['Embalse de Tucuruí', -3.80, -49.66],
    ['Embalse de Sobradinho', -9.62, -41.24], ['Embalse del Río Negro', -32.82, -56.44],
    ['Embalse Ezequiel Ramos Mexía', -39.42, -68.86], ['Represa de Itaipú', -25.41, -54.59],
  ],
  'Ríos destacados': [
    ['Río Orinoco', 7.62, -66.18], ['Río Amazonas', -2.04, -55.50],
    ['Río Ucayali', -8.35, -74.53], ['Río Madre de Dios', -12.59, -69.17],
    ['Río Paraguay', -22.1, -57.9], ['Río Uruguay', -31.40, -58.02],
    ['Río Paraná', -32.9, -60.62], ['Río Desaguadero', -16.56, -68.95],
    ['Río de la Plata', -34.96, -56.93], ['Río Colorado', -38.83, -64.46],
    ['Río Negro', -39.42, -65.72], ['Río Deseado', -47.68, -66.70],
  ],
  'Salares': [
    ['Salar de Uyuni', -20.22, -67.54], ['Salar de Atacama', -23.50, -68.25],
    ['Salinas Grandes', -23.65, -65.98],
  ],
};

const referenceElevations = [5007,5775,6310,6768,6634,6264,6288,6425,6402,6542,5980,6176,6233,6739,6759,6440,6879,6858,6749,6770,6959];

const southAmericaPlaces = Object.fromEntries(
  Object.entries(southAmericaGroups).map(([category, entries], groupIndex) => [
    category,
    entries.map(([name, lat, lon], index) => {
      const x = lon + 180;
      const y = 85 - lat;
      return {id: 'physical-' + groupIndex + '-' + index, name, region: category,
        elevation: category === 'Alturas destacadas' ? referenceElevations[index] : null,
        anchor: [x, y], box: [x - .07, y - .07, x + .07, y + .07]};
    }),
  ]),
);
