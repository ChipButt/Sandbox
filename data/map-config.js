// ASTRA editable map configuration
// Coordinates are percentages of the map image. UI layout boxes are pixels on the 1080×1920 app stage.
// Map layers are editable in map-editor.html.

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
    "summary": "ASTRA terrain trace of the active UK.G.E. zones and central piazza reference.",
    "hotspots": [
      {
        "target": "zone-2",
        "x": 15.9,
        "y": 35.65,
        "width": 25.85,
        "height": 32.97,
        "label": "ZONE 2"
      },
      {
        "target": "zone-3a",
        "x": 49.14,
        "y": 8.72,
        "width": 25.77,
        "height": 26.23,
        "label": "ZONE 3A"
      },
      {
        "target": "zone-4",
        "x": 55.96,
        "y": 35.72,
        "width": 38.07,
        "height": 31.24,
        "label": "ZONE 4"
      },
      {
        "target": "zone-3",
        "x": 24.82,
        "y": 8.44,
        "width": 23.32,
        "height": 26.17,
        "label": "ZONE 3"
      }
    ],
    "pins": [
      {
        "anomalyId": "cyan-trackway",
        "zone": "ZONE 2",
        "x": 22.2,
        "y": 39.95,
        "coordinates": "ASTRA COORDINATES: Z2-984",
        "standRef": "ASTRA TEMP HQ"
      },
      {
        "anomalyId": "magenta-fungal-bloom",
        "zone": "ZONE 2",
        "x": 37.13,
        "y": 57.1,
        "coordinates": "ASTRA COORDINATES: Z2 / GRID B-02",
        "standRef": "UKGE REF: ZONE 2-536"
      },
      {
        "anomalyId": "purple-liquid-basin",
        "zone": "ZONE 3A",
        "x": 58.49,
        "y": 23.3,
        "coordinates": "ASTRA COORDINATES: Z3A / GRID C-03",
        "standRef": "UKGE REF: ZONE 3A-344"
      },
      {
        "anomalyId": "lime-gas-vent",
        "zone": "ZONE 3",
        "x": 38.98,
        "y": 21.5,
        "coordinates": "ASTRA COORDINATES: Z3 / GRID D-04",
        "standRef": "UKGE REF: ZONE 3-626"
      },
      {
        "anomalyId": "gold-sap-stump",
        "zone": "ZONE 4",
        "x": 77.76,
        "y": 60.74,
        "coordinates": "ASTRA COORDINATES: Z4 / GRID E-05",
        "standRef": "UKGE REF: ZONE 4-474"
      },
      {
        "anomalyId": "orange-geode-core",
        "zone": "ZONE 4",
        "x": 64.69,
        "y": 43.24,
        "coordinates": "ASTRA COORDINATES: Z4-234",
        "standRef": "MANDO METALSMITH - ANOMALY LOCATED"
      }
    ],
    "kicker": "ASTRA CARTOGRAPHY",
    "defaultIntelTitle": "ZONE SIGNALS",
    "defaultIntelBody": "Locations are approximated from Pax Astra Scans\nTap Anomaly for more accurate co-ordinates ",
    "mapLayers": [
      {
        "id": "overview-background",
        "type": "background",
        "name": "ASTRA blank grid background",
        "src": "assets/map-builder/astra-map-background.png",
        "x": 0,
        "y": 0,
        "width": 100,
        "height": 100,
        "rotation": 0,
        "opacity": 1,
        "locked": true,
        "zIndex": 0
      },
      {
        "id": "overview-overlay",
        "type": "overlay",
        "name": "PLANET OVERVIEW coloured map overlay",
        "src": "assets/map-builder/overview-overlay.png",
        "x": 14.29,
        "y": 4.51,
        "width": 80.84,
        "height": 90,
        "rotation": -1,
        "opacity": 1,
        "locked": false,
        "zIndex": 10
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
        "x": 33.08,
        "y": 14.24,
        "coordinates": "ASTRA COORDINATES: Z2-894",
        "standRef": "ASTRA TEMP HQ"
      },
      {
        "anomalyId": "magenta-fungal-bloom",
        "zone": "ZONE 2",
        "x": 70.87,
        "y": 58.61,
        "coordinates": "ASTRA COORDINATES: Z2-???",
        "standRef": "YOUR COMPANY NAME HERE"
      }
    ],
    "kicker": "ASTRA CARTOGRAPHY",
    "defaultIntelTitle": "ZONE 2 SIGNALS",
    "defaultIntelBody": "Locations are approximated from Pax Astra Scans\nTap Anomaly for more accurate co-ordinates ",
    "mapLayers": [
      {
        "id": "zone-2-background",
        "type": "background",
        "name": "ASTRA blank grid background",
        "src": "assets/map-builder/astra-map-background.png",
        "x": 0,
        "y": 0,
        "width": 100,
        "height": 100,
        "rotation": 0,
        "opacity": 1,
        "locked": true,
        "zIndex": 0
      },
      {
        "id": "zone-2-overlay",
        "type": "overlay",
        "name": "ZONE 2 coloured map overlay",
        "src": "assets/map-builder/zone-2-overlay.png",
        "x": 22.79,
        "y": 5.19,
        "width": 58.71,
        "height": 89.07,
        "rotation": 0,
        "opacity": 1,
        "locked": false,
        "zIndex": 10
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
        "x": 52.36,
        "y": 48.17,
        "coordinates": "ASTRA COORDINATES: Z3-???",
        "standRef": "YOUR COMPANY NAME HERE"
      }
    ],
    "kicker": "ASTRA CARTOGRAPHY",
    "defaultIntelTitle": "ZONE 3 SIGNALS",
    "defaultIntelBody": "Locations are approximated from Pax Astra Scans\nTap Anomaly for more accurate co-ordinates ",
    "mapLayers": [
      {
        "id": "zone-3-background",
        "type": "background",
        "name": "ASTRA blank grid background",
        "src": "assets/map-builder/astra-map-background.png",
        "x": 0,
        "y": 0,
        "width": 100,
        "height": 100,
        "rotation": 0,
        "opacity": 1,
        "locked": true,
        "zIndex": 0
      },
      {
        "id": "zone-3-overlay",
        "type": "overlay",
        "name": "ZONE 3 coloured map overlay",
        "src": "assets/map-builder/zone-3-overlay.png",
        "x": 1.32,
        "y": -0.83,
        "width": 100.38,
        "height": 101.56,
        "rotation": -90,
        "opacity": 1,
        "locked": false,
        "zIndex": 10
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
        "x": 53.55,
        "y": 41.78,
        "coordinates": "ASTRA COORDINATES: Z3a-???",
        "standRef": "YOUR COMPANY NAME HERE"
      }
    ],
    "kicker": "ASTRA CARTOGRAPHY",
    "defaultIntelTitle": "ZONE 3A SIGNALS",
    "defaultIntelBody": "Locations are approximated from Pax Astra Scans\nTap Anomaly for more accurate co-ordinates ",
    "mapLayers": [
      {
        "id": "zone-3a-background",
        "type": "background",
        "name": "ASTRA blank grid background",
        "src": "assets/map-builder/astra-map-background.png",
        "x": 0,
        "y": 0,
        "width": 100,
        "height": 100,
        "rotation": 0,
        "opacity": 1,
        "locked": true,
        "zIndex": 0
      },
      {
        "id": "zone-3a-overlay",
        "type": "overlay",
        "name": "ZONE 3A coloured map overlay",
        "src": "assets/map-builder/zone-3a-overlay.png",
        "x": 22.7,
        "y": 5.03,
        "width": 54.5,
        "height": 90,
        "rotation": -90,
        "opacity": 1,
        "locked": false,
        "zIndex": 10
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
        "x": 60.75,
        "y": 51.63,
        "coordinates": "ASTRA COORDINATES: Z4-???",
        "standRef": "YOUR COMPANY NAME HERE"
      },
      {
        "anomalyId": "orange-geode-core",
        "zone": "ZONE 4",
        "x": 45.45,
        "y": 18.11,
        "coordinates": "ASTRA COORDINATES: Z4-234",
        "standRef": "MANDO METALSMITH"
      }
    ],
    "kicker": "ASTRA CARTOGRAPHY",
    "defaultIntelTitle": "ZONE 4 SIGNALS",
    "defaultIntelBody": "Locations are approximated from Pax Astra Scans\nTap Anomaly for more accurate co-ordinates ",
    "mapLayers": [
      {
        "id": "zone-4-background",
        "type": "background",
        "name": "ASTRA blank grid background",
        "src": "assets/map-builder/astra-map-background.png",
        "x": 0,
        "y": 0,
        "width": 100,
        "height": 100,
        "rotation": 0,
        "opacity": 1,
        "locked": true,
        "zIndex": 0
      },
      {
        "id": "zone-4-overlay",
        "type": "overlay",
        "name": "ZONE 4 coloured map overlay",
        "src": "assets/map-builder/zone-4-overlay.png",
        "x": 23.27,
        "y": 3.11,
        "width": 56.71,
        "height": 94.51,
        "rotation": -90,
        "opacity": 1,
        "locked": false,
        "zIndex": 10
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

window.ASTRA_MAP_UI_LAYOUT_CONFIG = {
  "terminal": {
    "x": 159,
    "y": 326,
    "width": 768,
    "height": 1437
  },
  "header": {
    "x": 16,
    "y": 51,
    "width": 729,
    "height": 132
  },
  "mainFrame": {
    "x": 9,
    "y": 230,
    "width": 745,
    "height": 562
  },
  "thumbStrip": {
    "x": 7,
    "y": 837,
    "width": 753,
    "height": 163
  },
  "intel": {
    "x": 5,
    "y": 1100,
    "width": 742,
    "height": 235
  },
  "text": {
    "intelLabel": "SIGNAL INTEL",
    "defaultKicker": "ASTRA CARTOGRAPHY"
  },
  "loader": {
    "label": "LOADING"
  }
};
