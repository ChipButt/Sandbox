/* Captain's Trail data.
   This file is deliberately plain JavaScript so the app can run from GitHub Pages
   or by opening index.html without a build step.
*/
(function () {
  const TRIGGER_ROOT = "assets/triggers/bidford/";

  window.CAPTAINS_TRAILS = [
    {
      id: "bidford-lost-captain",
      appName: "Captain's Trail: Bidford-on-Avon",
      name: "The Lost Captain of Bidford",
      location: "Bidford-on-Avon, Warwickshire, UK",
      theme: "Pirate treasure hunt",
      estimatedTime: "75-110 minutes",
      distanceEstimate: "Approx. 2 km circular walk. VERIFY_ON_SITE.",
      difficulty: "Easy to moderate",

      // ADJUST_AFTER_TESTING: raise this if false positives happen, lower it if
      // good scans are rejected. The local matcher reports confidence from 0-100.
      matchThreshold: 68,

      story:
        "A long-lost river captain hid his treasure somewhere around Bidford-on-Avon. Visit the captain's marked places, scan the right landmark, solve each clue, and cross false hiding places from the chart until only the true treasure remains.",

      safetyWarning:
        "Stay aware of roads, water, uneven paths, and private property. All clues should be viewed from public areas.",

      possibleHidingPlaces: [
        "Bidford Bridge",
        "St Laurence Churchyard",
        "The War Memorial",
        "Big Meadow",
        "The Old Riverside Path",
        "The High Street Market Stone"
      ],
      correctFinalHidingPlace: "Bidford Bridge",
      finalAcceptedAnswers: [
        "Bidford Bridge",
        "the bridge",
        "bridge",
        "Bidford Bridge over the Avon"
      ],

      map: {
        title: "Captain's Chart of Bidford",
        asset: "assets/maps/bidford-pirate-map.svg"
      },

      locations: [
        {
          id: "bidford-bridge-info",
          number: 1,
          title: "Bidford Bridge",
          shortTitle: "Bridge",

          // VERIFY_ON_SITE: approximate Bidford Bridge area. Edit lat/lng after testing on location.
          gps: { lat: 52.16386, lng: -1.85667, label: "VERIFY_ON_SITE - Bidford Bridge" },
          radiusM: 80,

          // ADJUST_AFTER_PHOTOS: replace this file with your real reference photo.
          triggerFile: TRIGGER_ROOT + "trigger-01-bidford-bridge-info-board.jpg",

          riddle:
            "Eight old backs carry the road where river secrets flow. Count the arches and follow the captain's crossing.",
          answer: "8",
          // ADJUST_CLUE_ANSWERS: add common spelling or wording variants here.
          acceptedAnswers: ["8", "eight"],
          eliminates: "The Old Riverside Path",
          hint: "Look at the bridge itself. The answer is a number.",
          mapPoint: { x: 49, y: 66 },
          illustration: "bridge"
        },
        {
          id: "st-laurence-church",
          number: 2,
          title: "St Laurence Church",
          shortTitle: "Church",

          // VERIFY_ON_SITE: approximate St Laurence Church, Church Street. Edit after testing on location.
          gps: { lat: 52.16464, lng: -1.85384, label: "VERIFY_ON_SITE - St Laurence Church" },
          radiusM: 80,
          triggerFile: TRIGGER_ROOT + "trigger-02-st-laurence-church-sign.jpg",

          riddle:
            "Where bells once warned the river folk, find the saint who guards the village. What is the church's saintly name?",
          answer: "Laurence",
          acceptedAnswers: ["Laurence", "Lawrence", "St Laurence", "Saint Laurence", "St Lawrence"],
          eliminates: "The High Street Market Stone",
          hint: "Read the church sign or look for the church name.",
          mapPoint: { x: 79, y: 30 },
          illustration: "church"
        },
        {
          id: "war-memorial",
          number: 3,
          title: "The War Memorial",
          shortTitle: "Memorial",

          // VERIFY_ON_SITE: approximate war memorial on High Street. Edit after testing on location.
          gps: { lat: 52.16445, lng: -1.85528, label: "VERIFY_ON_SITE - War Memorial" },
          radiusM: 80,
          triggerFile: TRIGGER_ROOT + "trigger-03-war-memorial-plaque.jpg",

          riddle:
            "The names of the lost are carved where the village remembers. Which great conflict is named on the memorial?",
          answer: "Great War",
          acceptedAnswers: ["Great War", "The Great War", "World War One", "World War 1", "WW1", "First World War"],
          eliminates: "St Laurence Churchyard",
          hint: "Look for the older war inscription.",
          mapPoint: { x: 57, y: 44 },
          illustration: "memorial"
        },
        {
          id: "big-meadow",
          number: 4,
          title: "Big Meadow",
          shortTitle: "Meadow",

          // VERIFY_ON_SITE: approximate Big Meadow/riverside park area. Edit after testing on location.
          gps: { lat: 52.16235, lng: -1.85867, label: "VERIFY_ON_SITE - Big Meadow" },
          radiusM: 100,
          triggerFile: TRIGGER_ROOT + "trigger-04-big-meadow-sign.jpg",

          riddle:
            "Where grass meets river and walkers rest, the captain watched the water bend. What natural feature runs beside this meadow?",
          answer: "River Avon",
          acceptedAnswers: ["River Avon", "Avon", "the Avon"],
          eliminates: "The War Memorial",
          hint: "Look toward the water.",
          mapPoint: { x: 25, y: 78 },
          illustration: "meadow"
        },
        {
          id: "riverside-feature",
          number: 5,
          title: "Riverside Feature",
          shortTitle: "Riverside",

          // VERIFY_ON_SITE: approximate public riverside feature near bridge/walk. Edit after testing.
          gps: { lat: 52.16326, lng: -1.85742, label: "VERIFY_ON_SITE - Riverside Feature" },
          radiusM: 100,
          triggerFile: TRIGGER_ROOT + "trigger-05-riverside-feature.jpg",

          riddle:
            "The captain followed the water, not the road. Which river carries the secret through Bidford?",
          answer: "Avon",
          acceptedAnswers: ["Avon", "River Avon", "the River Avon"],
          eliminates: "Big Meadow",
          hint: "The village name gives you the clue.",
          mapPoint: { x: 38, y: 61 },
          illustration: "river"
        },
        {
          id: "high-street-detail",
          number: 6,
          title: "High Street Detail",
          shortTitle: "High Street",

          // VERIFY_ON_SITE: approximate central High Street. Edit after testing on location.
          gps: { lat: 52.16491, lng: -1.85463, label: "VERIFY_ON_SITE - High Street Detail" },
          radiusM: 100,
          triggerFile: TRIGGER_ROOT + "trigger-06-high-street-detail.jpg",

          riddle:
            "From the village heart, the trail points back to stone over water. What crossing carries the final secret?",
          answer: "Bridge",
          acceptedAnswers: ["Bridge", "Bidford Bridge", "the bridge"],

          // There are six clue locations but only five false hiding places. This clue
          // confirms the final crossing after the five unique false locations are gone.
          eliminates: null,
          confirmsFinal: true,
          hint: "The final treasure is not in a building. It crosses the river.",
          mapPoint: { x: 67, y: 51 },
          illustration: "street"
        }
      ]
    }
  ];
})();
