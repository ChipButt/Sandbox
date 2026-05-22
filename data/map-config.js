// ASTRA editable map configuration
// Coordinates are percentages of the map image.

window.ASTRA_MAP_ZONES_CONFIG = [
  {
    "id": "overview",
    "title": "PLANET OVERVIEW",
    "image": "assets/map-overview.webp",
    "thumb": "assets/map-thumb-overview.webp",
    "colour": "#2edcff",
    "thumbBg": "rgba(46,220,255,.16)",
    "thumbBorder": "rgba(46,220,255,.62)",
    "thumbGlow": "rgba(46,220,255,.22)",
    "summary": "ASTRA terrain trace of the active zones and central piazza reference.",
    "hotspots": [
      {
        "target": "zone-2",
        "x": 9,
        "y": 37,
        "width": 25.85,
        "height": 32.97
      },
      {
        "target": "zone-3a",
        "x": 43,
        "y": 10,
        "width": 25.77,
        "height": 26.23
      },
      {
        "target": "zone-4",
        "x": 53,
        "y": 37,
        "width": 38.07,
        "height": 31.24
      },
      {
        "target": "zone-3",
        "x": 20,
        "y": 10,
        "width": 23.32,
        "height": 26.17
      }
    ],
    "pins": [
      {
        "anomalyId": "cyan-trackway",
        "zone": "ZONE 2",
        "x": 14.16,
        "y": 38.39,
        "coordinates": "ASTRA COORDINATES: Z2-984",
        "standRef": "ASTRA TEMP HQ - Anomaly Located"
      },
      {
        "anomalyId": "magenta-fungal-bloom",
        "zone": "ZONE 2",
        "x": 27.76,
        "y": 55.08,
        "coordinates": "ASTRA COORDINATES: Z2 / GRID B-02",
        "standRef": "UKGE REF: ZONE 2-536"
      },
      {
        "anomalyId": "purple-liquid-basin",
        "zone": "ZONE 3A",
        "x": 56.64,
        "y": 17.48,
        "coordinates": "ASTRA COORDINATES: Z3A / GRID C-03",
        "standRef": "UKGE REF: ZONE 3A-344"
      },
      {
        "anomalyId": "lime-gas-vent",
        "zone": "ZONE 3",
        "x": 24.92,
        "y": 16.12,
        "coordinates": "ASTRA COORDINATES: Z3 / GRID D-04",
        "standRef": "UKGE REF: ZONE 3-626"
      },
      {
        "anomalyId": "gold-sap-stump",
        "zone": "ZONE 4",
        "x": 65.46,
        "y": 61.87,
        "coordinates": "ASTRA COORDINATES: Z4 / GRID E-05",
        "standRef": "UKGE REF: ZONE 4-474"
      },
      {
        "anomalyId": "orange-geode-core",
        "zone": "ZONE 4",
        "x": 59.55,
        "y": 41.71,
        "coordinates": "ASTRA COORDINATES: Z4-234",
        "standRef": "MANDO METALSMITH - ANOMALY LOCATED"
      }
    ]
  },
  {
    "id": "zone-2",
    "title": "ZONE 2",
    "image": "assets/map-zone-2.webp",
    "thumb": "assets/map-thumb-zone-2.webp",
    "colour": "#ffe24b",
    "thumbBg": "rgba(255,226,75,.25)",
    "thumbBorder": "rgba(255,226,75,.82)",
    "thumbGlow": "rgba(255,226,75,.28)",
    "summary": "Expanded close-range layout for the Zone 2 anomaly sweep.",
    "pins": [
      {
        "anomalyId": "cyan-trackway",
        "zone": "ZONE 2",
        "x": 28.99,
        "y": 13.5,
        "coordinates": "ASTRA COORDINATES: Z2-894",
        "standRef": "ASTRA TEMP HQ"
      },
      {
        "anomalyId": "magenta-fungal-bloom",
        "zone": "ZONE 2",
        "x": 51,
        "y": 43,
        "coordinates": "ASTRA COORDINATES: Z2 / GRID B-02",
        "standRef": "UKGE REF: ZONE 2-536"
      }
    ]
  },
  {
    "id": "zone-3",
    "title": "ZONE 3",
    "image": "assets/map-zone-3.webp",
    "thumb": "assets/map-thumb-zone-3.webp",
    "colour": "#2cff6a",
    "thumbBg": "rgba(44,255,106,.22)",
    "thumbBorder": "rgba(44,255,106,.76)",
    "thumbGlow": "rgba(44,255,106,.24)",
    "summary": "Expanded close-range layout for the Zone 3 anomaly sweep.",
    "pins": [
      {
        "anomalyId": "lime-gas-vent",
        "zone": "ZONE 3",
        "x": 52,
        "y": 48,
        "coordinates": "ASTRA COORDINATES: Z3 / GRID D-04",
        "standRef": "UKGE REF: ZONE 3-626"
      }
    ]
  },
  {
    "id": "zone-3a",
    "title": "ZONE 3A",
    "image": "assets/map-zone-3a.webp",
    "thumb": "assets/map-thumb-zone-3a.webp",
    "colour": "#2edcff",
    "thumbBg": "rgba(46,220,255,.24)",
    "thumbBorder": "rgba(46,220,255,.78)",
    "thumbGlow": "rgba(46,220,255,.25)",
    "summary": "Expanded close-range layout for the Zone 3A anomaly sweep.",
    "pins": [
      {
        "anomalyId": "purple-liquid-basin",
        "zone": "ZONE 3A",
        "x": 64,
        "y": 45,
        "coordinates": "ASTRA COORDINATES: Z3A / GRID C-03",
        "standRef": "UKGE REF: ZONE 3A-344"
      }
    ]
  },
  {
    "id": "zone-4",
    "title": "ZONE 4",
    "image": "assets/map-zone-4.webp",
    "thumb": "assets/map-thumb-zone-4.webp",
    "colour": "#ff9b2e",
    "thumbBg": "rgba(255,155,46,.25)",
    "thumbBorder": "rgba(255,155,46,.8)",
    "thumbGlow": "rgba(255,155,46,.26)",
    "summary": "Expanded close-range layout for the Zone 4 anomaly sweep.",
    "pins": [
      {
        "anomalyId": "gold-sap-stump",
        "zone": "ZONE 4",
        "x": 43.2,
        "y": 66.04,
        "coordinates": "ASTRA COORDINATES: Z4 / GRID E-05",
        "standRef": "UKGE REF: ZONE 4-474"
      },
      {
        "anomalyId": "orange-geode-core",
        "zone": "ZONE 4",
        "x": 73.51,
        "y": 38.87,
        "coordinates": "ASTRA COORDINATES: Z4-234",
        "standRef": "MANDO METALSMITH - ANOMALY LOCATED"
      }
    ]
  }
];

window.ASTRA_MAP_THUMB_ZONE_IDS_CONFIG = [
  "zone-2",
  "zone-3",
  "zone-3a",
  "zone-4"
];
