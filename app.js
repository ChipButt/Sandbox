
const stateKey = 'astra-field-terminal-progress-v9-animated-anomalies';
const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

const ASTRA_ASSET_VERSION = '20260520-final-ui-v5';
function versionedAsset(src){
  if(!src || String(src).startsWith('data:') || String(src).startsWith('http')) return src;
  return `${src}${String(src).includes('?') ? '&' : '?'}v=${ASTRA_ASSET_VERSION}`;
}
const EMBEDDED_LAYOUT = {"project":"astra-field-terminal-layout","stage":{"width":1080,"height":1920},"activePage":"home","pages":{"home":{"name":"Home Terminal","layers":[{"id":"img_1778812650015_8","type":"image","name":"futuristic sci fi scanner interface panel","assetId":"futuristic_sci_fi_scanner_interface_panel","asset":"assets/scanner-button.webp","x":319,"y":275,"width":471,"height":110,"rotation":0,"opacity":1,"zIndex":10,"visible":true,"locked":false,"fit":"contain","alpha":true},{"id":"img_1778812651099_9","type":"image","name":"map vertical transparent","assetId":"map_vertical_transparent","asset":"assets/map-vertical.webp","x":68,"y":685,"width":122,"height":455,"rotation":0,"opacity":1,"zIndex":20,"visible":true,"locked":true,"fit":"contain","alpha":true},{"id":"img_1778812652000_10","type":"image","name":"inbox vertical transparent","assetId":"inbox_vertical_transparent","asset":"assets/inbox-vertical.webp","x":894,"y":699,"width":122,"height":425,"rotation":0,"opacity":1,"zIndex":30,"visible":true,"locked":true,"fit":"contain","alpha":true},{"id":"img_1778812680450_11","type":"image","name":"futuristic data log ui panel","assetId":"futuristic_data_log_ui_panel","asset":"assets/data-log-button.webp","x":262,"y":1721,"width":558,"height":161,"rotation":0,"opacity":1,"zIndex":40,"visible":true,"locked":false,"fit":"contain","alpha":true},{"id":"img_1778813068385_23","type":"image","name":"astronaut profile icon transparent","assetId":"astronaut_profile_icon_transparent","asset":"assets/astronaut-profile-icon.webp","x":189,"y":1528,"width":186,"height":174,"rotation":0,"opacity":1,"zIndex":80,"visible":true,"locked":false,"fit":"contain","alpha":true},{"id":"img_1778813085846_24","type":"image","name":"signal core radar transparent","assetId":"signal_core_radar_transparent","asset":"assets/home-screen-anomaly-tracker.webp","x":280,"y":855,"width":540,"height":597,"rotation":-60,"opacity":1,"zIndex":60,"visible":true,"locked":false,"fit":"contain","alpha":true},{"id":"img_1778813183493_26","type":"image","name":"RB LOWECASE LOGO R","assetId":"RB_LOWECASE_LOGO_R","asset":"assets/rb-logo.webp","x":825,"y":45,"width":200,"height":80,"rotation":0,"opacity":1,"zIndex":70,"visible":true,"locked":true,"fit":"contain","alpha":true},{"id":"img_1778956425699_2","type":"image","name":"Background UI.png","assetId":"upload_1778956403772_1","asset":"assets/background-ui.webp","x":-3,"y":-3,"width":1084,"height":1925,"rotation":0,"opacity":1,"zIndex":-20,"visible":true,"locked":true,"fit":"contain","alpha":true}]},"inbox":{"name":"Inbox / Messages","layers":[{"id":"img_1778813392603_29","type":"image","name":"Mail UI","assetId":"futuristic_cyberpunk_ui_panel_design","asset":"assets/mail-ui.webp","x":45,"y":216,"width":991,"height":1409,"rotation":0,"opacity":1,"zIndex":-10,"visible":true,"locked":true,"fit":"contain","alpha":false},{"id":"text_1778815996491_41","type":"text","name":"MAIL MESSAGE HEADER","text":"MAIL MESSAGE HEADER\n\n","x":406,"y":490,"width":550,"height":66,"rotation":0,"opacity":1,"zIndex":150,"visible":true,"locked":false,"fontKey":"astra","fontSize":44,"color":"#2cff6a","align":"center","glow":true,"lineHeight":1.15,"letterSpacing":0.05},{"id":"text_1778816071269_42","type":"text","name":"Mail Message Content","text":"Mail Message Content\n\n","x":412,"y":568,"width":519,"height":831,"rotation":0,"opacity":1,"zIndex":150,"visible":true,"locked":true,"fontKey":"astra","fontSize":36,"color":"#2cff6a","align":"left","glow":true,"lineHeight":1.15,"letterSpacing":0.05},{"id":"text_1778816152391_43","type":"text","name":"Close Button","text":"x","x":926,"y":335,"width":60,"height":93,"rotation":0,"opacity":1,"zIndex":170,"visible":true,"locked":false,"fontKey":"astra","fontSize":65,"color":"#2edcff","align":"center","glow":true,"lineHeight":1.15,"letterSpacing":0.05},{"id":"img_1779027862465_4","type":"image","name":"Mail Open Icon.png","assetId":"upload_1779027861036_3","asset":"assets/mail-open-icon.webp","x":130,"y":500,"width":72,"height":135,"rotation":0,"opacity":1,"zIndex":180,"visible":true,"locked":true,"fit":"contain","alpha":true},{"id":"text_1779027892348_5","type":"text","name":"Mail Message Content Copy","text":"Mail Message Header\n\n","x":210,"y":525,"width":137,"height":87,"rotation":0,"opacity":1,"zIndex":190,"visible":true,"locked":true,"fontKey":"astra","fontSize":21,"color":"#2cff6a","align":"left","glow":true,"lineHeight":1.15,"letterSpacing":0.05},{"id":"image_1779027955247_6","type":"image","name":"Mail Open Icon.png Copy","assetId":"upload_1779027861036_3","asset":"assets/mail-open-icon.webp","x":130,"y":610,"width":72,"height":135,"rotation":0,"opacity":1,"zIndex":200,"visible":true,"locked":true,"fit":"contain","alpha":true},{"id":"image_1779028016148_7","type":"image","name":"Mail Open Icon.png Copy Copy","assetId":"upload_1779027861036_3","asset":"assets/mail-open-icon.webp","x":130,"y":720,"width":72,"height":135,"rotation":0,"opacity":1,"zIndex":210,"visible":true,"locked":true,"fit":"contain","alpha":true},{"id":"text_1779028044136_8","type":"text","name":"Mail Message Content Copy Copy","text":"Mail Message Header\n\n","x":210,"y":635,"width":137,"height":87,"rotation":0,"opacity":1,"zIndex":220,"visible":true,"locked":true,"fontKey":"astra","fontSize":21,"color":"#2cff6a","align":"left","glow":true,"lineHeight":1.15,"letterSpacing":0.05},{"id":"text_1779029130696_10","type":"text","name":"Mail Message Content Copy Copy Copy","text":"Mail Message Header\n\n","x":210,"y":745,"width":137,"height":87,"rotation":0,"opacity":1,"zIndex":230,"visible":true,"locked":false,"fontKey":"astra","fontSize":21,"color":"#2cff6a","align":"left","glow":true,"lineHeight":1.15,"letterSpacing":0.05},{"id":"text_1779029201147_12","type":"text","name":"Mail Message Content Copy Copy Copy Copy","text":"Mail Message Header\n\n","x":210,"y":855,"width":137,"height":87,"rotation":0,"opacity":1,"zIndex":240,"visible":true,"locked":false,"fontKey":"astra","fontSize":21,"color":"#2cff6a","align":"left","glow":true,"lineHeight":1.15,"letterSpacing":0.05},{"id":"image_1779029232096_13","type":"image","name":"Mail Open Icon.png Copy Copy Copy","assetId":"upload_1779027861036_3","asset":"assets/mail-open-icon.webp","x":130,"y":830,"width":72,"height":135,"rotation":0,"opacity":1,"zIndex":250,"visible":true,"locked":true,"fit":"contain","alpha":true},{"id":"image_1779029257179_14","type":"image","name":"Mail Open Icon.png Copy Copy Copy Copy","assetId":"upload_1779027861036_3","asset":"assets/mail-open-icon.webp","x":130,"y":940,"width":72,"height":135,"rotation":0,"opacity":1,"zIndex":260,"visible":true,"locked":true,"fit":"contain","alpha":true},{"id":"image_1779029283113_15","type":"image","name":"Mail Open Icon.png Copy Copy Copy Copy Copy","assetId":"upload_1779027861036_3","asset":"assets/mail-open-icon.webp","x":130,"y":1050,"width":72,"height":135,"rotation":0,"opacity":1,"zIndex":270,"visible":true,"locked":true,"fit":"contain","alpha":true},{"id":"image_1779029328446_16","type":"image","name":"Mail Open Icon.png Copy Copy Copy Copy Copy Copy","assetId":"upload_1779027861036_3","asset":"assets/mail-open-icon.webp","x":130,"y":1160,"width":72,"height":135,"rotation":0,"opacity":1,"zIndex":280,"visible":true,"locked":true,"fit":"contain","alpha":true},{"id":"text_1779029374349_17","type":"text","name":"Mail Message Content Copy Copy Copy Copy Copy","text":"Mail Message Header\n\n","x":215,"y":965,"width":137,"height":87,"rotation":0,"opacity":1,"zIndex":290,"visible":true,"locked":false,"fontKey":"astra","fontSize":21,"color":"#2cff6a","align":"left","glow":true,"lineHeight":1.15,"letterSpacing":0.05},{"id":"text_1779029375780_18","type":"text","name":"Mail Message Content Copy Copy Copy Copy Copy Copy","text":"Mail Message Header\n\n","x":220,"y":1076,"width":137,"height":87,"rotation":0,"opacity":1,"zIndex":300,"visible":true,"locked":false,"fontKey":"astra","fontSize":21,"color":"#2cff6a","align":"left","glow":true,"lineHeight":1.15,"letterSpacing":0.05},{"id":"text_1779029376280_19","type":"text","name":"Mail Message 7","text":"Mail Message Header\n\n","x":220,"y":1185,"width":137,"height":87,"rotation":0,"opacity":1,"zIndex":310,"visible":true,"locked":true,"fontKey":"astra","fontSize":21,"color":"#2cff6a","align":"left","glow":true,"lineHeight":1.15,"letterSpacing":0.05}]},"scanner":{"name":"Scanner","layers":[{"id":"img_1778847986783_58","type":"image","name":"RB LOWECASE LOGO R","assetId":"RB_LOWECASE_LOGO_R","asset":"assets/rb-logo.webp","x":825,"y":45,"width":200,"height":80,"rotation":0,"opacity":1,"zIndex":110,"visible":true,"locked":true,"fit":"contain","alpha":true},{"id":"text_1778848160834_60","type":"text","name":"ANOMALY NAME","text":"ANOMALY NAME","x":251,"y":385,"width":592,"height":93,"rotation":0,"opacity":1,"zIndex":130,"visible":true,"locked":true,"fontKey":"astra","fontSize":70,"color":"#2cff6a","align":"center","glow":false,"lineHeight":1.15,"letterSpacing":0.05},{"id":"text_1778848269020_61","type":"text","name":"Anomaly Info 1","text":"Anomaly \nInfo 1","x":220,"y":1322,"width":647,"height":93,"rotation":0,"opacity":1,"zIndex":140,"visible":true,"locked":true,"fontKey":"astra","fontSize":34,"color":"#2cff6a","align":"center","glow":true,"lineHeight":1.15,"letterSpacing":0.05},{"id":"text_1778848324386_62","type":"text","name":"Anomaly Info 2","text":"Anomaly \nInfo 2","x":220,"y":1473,"width":647,"height":93,"rotation":0,"opacity":1,"zIndex":150,"visible":true,"locked":true,"fontKey":"astra","fontSize":34,"color":"#2cff6a","align":"center","glow":true,"lineHeight":1.15,"letterSpacing":0.05},{"id":"text_1778848341486_63","type":"text","name":"Anomaly Info 3","text":"Anomaly \nInfo 3","x":220,"y":1623,"width":647,"height":93,"rotation":0,"opacity":1,"zIndex":160,"visible":true,"locked":true,"fontKey":"astra","fontSize":34,"color":"#2cff6a","align":"center","glow":true,"lineHeight":1.15,"letterSpacing":0.05},{"id":"img_1779108075232_25","type":"image","name":"Background UI.png","assetId":"upload_1778956403772_1","asset":"assets/background-ui.webp","x":-3,"y":-3,"width":1084,"height":1925,"rotation":0,"opacity":1,"zIndex":-30,"visible":true,"locked":true,"fit":"contain","alpha":true},{"id":"img_1779112372030_37","type":"image","name":"Background UI Back Button.png","assetId":"upload_1779111968841_32","asset":"assets/background-ui-back-button.webp","x":-11,"y":39,"width":370,"height":93,"rotation":0,"opacity":1,"zIndex":170,"visible":true,"locked":true,"fit":"contain","alpha":true},{"id":"img_1779112428464_38","type":"image","name":"specimen_ui.png","assetId":"upload_1779111968825_30","asset":"assets/specimen-ui.webp","x":36,"y":223,"width":1016,"height":1676,"rotation":0,"opacity":1,"zIndex":180,"visible":true,"locked":true,"fit":"contain","alpha":true},{"id":"img_1779113150756_56","type":"image","name":"unknown_anomaly_real_transparent.png","assetId":"upload_1779112846562_40","asset":"assets/unknown-anomaly.webp","x":163,"y":510,"width":756,"height":756,"rotation":0,"opacity":1,"zIndex":190,"visible":true,"locked":false,"fit":"contain","alpha":true}]},"dataLog":{"name":"Data Log","layers":[{"id":"img_1779108671271_29","type":"image","name":"Background UI.png","assetId":"upload_1778956403772_1","asset":"assets/background-ui.webp","x":-3,"y":-3,"width":1084,"height":1925,"rotation":0,"opacity":1,"zIndex":-20,"visible":true,"locked":true,"fit":"contain","alpha":true},{"id":"img_1779111971370_33","type":"image","name":"Background UI Back Button.png","assetId":"upload_1779111968841_32","asset":"assets/background-ui-back-button.webp","x":-11,"y":39,"width":370,"height":93,"rotation":0,"opacity":1,"zIndex":110,"visible":true,"locked":true,"fit":"contain","alpha":true},{"id":"img_1779112239472_35","type":"image","name":"RB LOWECASE LOGO R","assetId":"RB_LOWECASE_LOGO_R","asset":"assets/rb-logo.webp","x":825,"y":45,"width":200,"height":80,"rotation":0,"opacity":1,"zIndex":130,"visible":true,"locked":true,"fit":"contain","alpha":true},{"id":"img_1779112297205_36","type":"image","name":"Data Log UI.png","assetId":"upload_1779111968836_31","asset":"assets/data-log-ui.webp","x":112,"y":305,"width":862,"height":1426,"rotation":0,"opacity":1,"zIndex":-10,"visible":true,"locked":true,"fit":"contain","alpha":true},{"id":"image_1779112869136_43","type":"image","name":"unknown_anomaly_real_transparent.png Copy Copy","assetId":"upload_1779112846562_40","asset":"assets/unknown-anomaly.webp","x":243,"y":881,"width":123,"height":223,"rotation":0,"opacity":1,"zIndex":160,"visible":true,"locked":false,"fit":"contain","alpha":true},{"id":"image_1779112883025_44","type":"image","name":"unknown_anomaly_real_transparent.png Copy Copy Copy","assetId":"upload_1779112846562_40","asset":"assets/unknown-anomaly.webp","x":246,"y":1492,"width":123,"height":223,"rotation":0,"opacity":1,"zIndex":170,"visible":true,"locked":false,"fit":"contain","alpha":true},{"id":"image_1779112883470_45","type":"image","name":"unknown_anomaly_real_transparent.png Copy Copy Copy Copy","assetId":"upload_1779112846562_40","asset":"assets/unknown-anomaly.webp","x":246,"y":1289,"width":123,"height":223,"rotation":0,"opacity":1,"zIndex":180,"visible":true,"locked":false,"fit":"contain","alpha":true},{"id":"image_1779112883936_46","type":"image","name":"unknown_anomaly_real_transparent.png Copy Copy Copy Copy Copy","assetId":"upload_1779112846562_40","asset":"assets/unknown-anomaly.webp","x":245,"y":1081,"width":123,"height":223,"rotation":0,"opacity":1,"zIndex":190,"visible":true,"locked":false,"fit":"contain","alpha":true},{"id":"image_1779112884376_47","type":"image","name":"unknown_anomaly_real_transparent.png Copy Copy Copy Copy Copy Copy","assetId":"upload_1779112846562_40","asset":"assets/unknown-anomaly.webp","x":246,"y":679,"width":123,"height":223,"rotation":0,"opacity":1,"zIndex":200,"visible":true,"locked":false,"fit":"contain","alpha":true},{"id":"image_1779112884804_48","type":"image","name":"unknown_anomaly_real_transparent.png Copy Copy Copy Copy Copy Copy Copy","assetId":"upload_1779112846562_40","asset":"assets/unknown-anomaly.webp","x":246,"y":471,"width":123,"height":223,"rotation":0,"opacity":1,"zIndex":210,"visible":true,"locked":false,"fit":"contain","alpha":true},{"id":"text_1779112913786_49","type":"text","name":"Anomaly 1","text":"Summary of Anomaly\n","x":426,"y":540,"width":404,"height":102,"rotation":0,"opacity":1,"zIndex":220,"visible":true,"locked":true,"fontKey":"astra","fontSize":40,"color":"#2cff6a","align":"center","glow":true,"lineHeight":1.15,"letterSpacing":0.05},{"id":"text_1779112974936_50","type":"text","name":"Anomaly 2","text":"Summary of Anomaly\n","x":426,"y":741,"width":404,"height":102,"rotation":0,"opacity":1,"zIndex":230,"visible":true,"locked":true,"fontKey":"astra","fontSize":40,"color":"#2cff6a","align":"center","glow":true,"lineHeight":1.15,"letterSpacing":0.05},{"id":"text_1779113008036_51","type":"text","name":"Anomaly 3","text":"Summary of Anomaly\n","x":426,"y":951,"width":404,"height":102,"rotation":0,"opacity":1,"zIndex":240,"visible":true,"locked":true,"fontKey":"astra","fontSize":40,"color":"#2cff6a","align":"center","glow":true,"lineHeight":1.15,"letterSpacing":0.05},{"id":"text_1779113051701_52","type":"text","name":"Anomaly 4","text":"Summary of Anomaly\n","x":426,"y":1155,"width":404,"height":102,"rotation":0,"opacity":1,"zIndex":250,"visible":true,"locked":true,"fontKey":"astra","fontSize":40,"color":"#2cff6a","align":"center","glow":true,"lineHeight":1.15,"letterSpacing":0.05},{"id":"text_1779113074390_53","type":"text","name":"Anomaly 5","text":"Summary of Anomaly\n","x":426,"y":1359,"width":404,"height":102,"rotation":0,"opacity":1,"zIndex":260,"visible":true,"locked":true,"fontKey":"astra","fontSize":40,"color":"#2cff6a","align":"center","glow":true,"lineHeight":1.15,"letterSpacing":0.05},{"id":"text_1779113079503_54","type":"text","name":"Anomaly 5","text":"Summary of Anomaly\n","x":426,"y":1359,"width":404,"height":102,"rotation":0,"opacity":1,"zIndex":260,"visible":true,"locked":true,"fontKey":"astra","fontSize":40,"color":"#2cff6a","align":"center","glow":false,"lineHeight":1.15,"letterSpacing":0.05},{"id":"text_1779113110269_55","type":"text","name":"Anomaly 6","text":"Summary of Anomaly\n","x":426,"y":1560,"width":404,"height":102,"rotation":0,"opacity":1,"zIndex":270,"visible":true,"locked":false,"fontKey":"astra","fontSize":40,"color":"#2cff6a","align":"center","glow":true,"lineHeight":1.15,"letterSpacing":0.05}]},"anomalyDetail":{"name":"Anomaly Detail","layers":[{"id":"img_1778848605255_67","type":"image","name":"RB LOWECASE LOGO R","assetId":"RB_LOWECASE_LOGO_R","asset":"assets/rb-logo.webp","x":825,"y":45,"width":200,"height":80,"rotation":0,"opacity":1,"zIndex":110,"visible":true,"locked":true,"fit":"contain","alpha":true},{"id":"text_1778853710335_70","type":"text","name":"Data Found","text":"DATA FOUND","x":349,"y":493,"width":390,"height":80,"rotation":0,"opacity":1,"zIndex":130,"visible":true,"locked":true,"fontKey":"astra","fontSize":44,"color":"#2cff6a","align":"center","glow":true,"lineHeight":1.15,"letterSpacing":0.05},{"id":"text_1778853818017_71","type":"text","name":"Text Layer","text":"AIM SCANNER \n\n\nAT ANOMALY","x":279,"y":1397,"width":532,"height":211,"rotation":0,"opacity":1,"zIndex":140,"visible":true,"locked":true,"fontKey":"astra","fontSize":45,"color":"#2cff6a","align":"center","glow":true,"lineHeight":1.15,"letterSpacing":0.05},{"id":"img_1779100607767_20","type":"image","name":"Background UI.png","assetId":"upload_1778956403772_1","asset":"assets/background-ui.webp","x":-3,"y":-3,"width":1084,"height":1925,"rotation":0,"opacity":1,"zIndex":-50,"visible":true,"locked":true,"fit":"contain","alpha":true},{"id":"img_1779112613925_39","type":"image","name":"Background UI Back Button.png","assetId":"upload_1779111968841_32","asset":"assets/background-ui-back-button.webp","x":-11,"y":39,"width":370,"height":93,"rotation":0,"opacity":1,"zIndex":150,"visible":true,"locked":true,"fit":"contain","alpha":true},{"id":"area_1779121123238_62","type":"placeholder","name":"Camera Scanner","label":"Camera Scanner Area","x":243,"y":720,"width":600,"height":612,"rotation":0,"opacity":0.45,"zIndex":170,"visible":true,"locked":false,"borderColor":"#2cff6a","fillColor":"rgba(44,255,106,.08)"},{"id":"img_1779121212390_63","type":"image","name":"Scanner_ui.png","assetId":"upload_1779107948446_23","asset":"assets/scanner-ui.webp","x":45,"y":307,"width":996,"height":1446,"rotation":0,"opacity":1,"zIndex":180,"visible":true,"locked":true,"fit":"contain","alpha":true}]},"map":{"name":"Map","layers":[{"id":"img_1779120883952_58","type":"image","name":"Background UI Back Button.png","assetId":"upload_1779111968841_32","asset":"assets/background-ui-back-button.webp","x":-11,"y":39,"width":370,"height":93,"rotation":0,"opacity":1,"zIndex":100,"visible":true,"locked":true,"fit":"contain","alpha":true},{"id":"img_1779120887790_59","type":"image","name":"Background UI.png","assetId":"upload_1778956403772_1","asset":"assets/background-ui.webp","x":-3,"y":-3,"width":1084,"height":1925,"rotation":0,"opacity":1,"zIndex":-10,"visible":true,"locked":true,"fit":"contain","alpha":true},{"id":"img_1779120894872_60","type":"image","name":"RB LOWECASE LOGO R","assetId":"RB_LOWECASE_LOGO_R","asset":"assets/rb-logo.webp","x":825,"y":45,"width":200,"height":80,"rotation":0,"opacity":1,"zIndex":120,"visible":true,"locked":true,"fit":"contain","alpha":true}]}},"exportedAt":"2026-05-18T17:08:00.344Z","note":"Asset dimensions are layout-optimised. Use x/y/width/height/rotation/zIndex values in final app."};
const EMBEDDED_GAME = {"planet":"Unknown Graphite Exoplanet (UK.G.E.)","motto":"Contain. Control. Consider.","youtube":"https://www.youtube.com/playlist?list=PLWh6zjkuSLMD8saDiL2UjJOzB-M_i8Oms","markers":["ASTRA:UKGE:ANOMALY-01","ASTRA:UKGE:ANOMALY-02","ASTRA:UKGE:ANOMALY-03","ASTRA:UKGE:ANOMALY-04","ASTRA:UKGE:ANOMALY-05","ASTRA:UKGE:ANOMALY-06"],"anomalies":[{"id":"cyan-trackway","marker":"ASTRA:UKGE:ANOMALY-01","name":"TRACKWAY IMPRESSION","type":"Fauna trace / movement evidence","venue":"Astra HQ","asset":"assets/anomaly-trackway-fixed-static-position-20260520.webp","colour":"Cyan","glow":{"base":"#2EDCFF","soft":"rgba(46,220,255,0.38)","medium":"rgba(46,220,255,0.78)","strong":"rgba(46,220,255,0.95)"},"info":["Fossilised pressure mark still emits low residual energy ripples.","Pattern suggests a heavy native organism with deliberate gait control.","Residual glow indicates the ground was chemically altered by contact."],"summary":"Fossilised pressure mark emits low residual energy ripples.","header":"FIELD REPORT: TRACKWAY IMPRESSION","body":"Agent, scan received. The Trackway Impression is not a simple footprint. Residual energy is still moving through the compressed material, suggesting the creature that made it altered the terrain as it passed. UKGE has mobile native life, and at least some of it leaves chemically active traces behind. Continue the survey.\n\n— General Starguardian, Director of ASTRA"},{"id":"magenta-fungal-bloom","marker":"ASTRA:UKGE:ANOMALY-02","name":"SPORE-CROWN BLOOM","type":"Fungus / airborne biological hazard","venue":"Venue 2","asset":"assets/anomaly-spore-crown-fixed-static-position-20260520.webp","colour":"Magenta","glow":{"base":"#FF3ADF","soft":"rgba(255,58,223,0.38)","medium":"rgba(255,58,223,0.78)","strong":"rgba(255,58,223,0.95)"},"info":["Cluster vents spores in timed biological cycles.","Crown-like growths appear to feed on mineral-rich surface deposits.","Air around the bloom should be treated as unsafe without filtration."],"summary":"Cluster pulses while venting spores in timed biological cycles.","header":"FIELD REPORT: SPORE-CROWN BLOOM","body":"Agent, scan received. The Spore-Crown Bloom appears to pulse in regular venting cycles, releasing material into the local air. ASTRA is classifying this as an airborne biological hazard until proven otherwise. Do not assume the atmosphere is safe simply because it is breathable. Continue scanning.\n\n— General Starguardian, Director of ASTRA"},{"id":"lime-gas-vent","marker":"ASTRA:UKGE:ANOMALY-03","name":"PRESSURE GAS VENT","type":"Atmospheric / geological vent","venue":"Venue 3","asset":"assets/anomaly-pressure-vent-fixed-static-position-20260520.webp","colour":"Lime","glow":{"base":"#8FFF38","soft":"rgba(143,255,56,0.38)","medium":"rgba(143,255,56,0.78)","strong":"rgba(143,255,56,0.95)"},"info":["Vent releases luminous vapour from a sealed surface fracture.","Gas plume movement suggests continuing pressure beneath the crust.","Atmospheric readings may fluctuate near active vents and fissures."],"summary":"Vent releases luminous vapour from a sealed surface fracture.","header":"FIELD REPORT: PRESSURE GAS VENT","body":"Agent, scan received. The Pressure Gas Vent confirms that UKGE is still geologically active. The vapour is moving under pressure, which means local air quality may shift without warning near cracks, vents, and surface fractures. Treat this region as unstable until further notice.\n\n— General Starguardian, Director of ASTRA"},{"id":"orange-geode-core","marker":"ASTRA:UKGE:ANOMALY-04","name":"EMBERHEART GEODE","type":"Mineral / energy-reactive crystal","venue":"Venue 4","asset":"assets/anomaly-emberheart-fixed-static-position-20260520.webp","colour":"Orange","glow":{"base":"#FF9C2E","soft":"rgba(255,156,46,0.38)","medium":"rgba(255,156,46,0.78)","strong":"rgba(255,156,46,0.95)"},"info":["Crystalline formation refracts a warm internal energy pulse.","Structure appears stable while storing measurable energy in layers.","Material may be useful for shielding, signal focus, or power storage."],"summary":"Crystalline formation refracts a warm internal energy pulse.","header":"FIELD REPORT: EMBERHEART GEODE","body":"Agent, scan received. The Emberheart Geode is storing and refracting energy through layered crystal growth. This may be one of UKGE’s most valuable mineral resources, especially if ASTRA can determine how it holds a charge without visible machinery. Continue the anomaly sweep.\n\n— General Starguardian, Director of ASTRA"},{"id":"purple-liquid-basin","marker":"ASTRA:UKGE:ANOMALY-05","name":"RESONANT LIQUID BASIN","type":"Liquid source / chemical reservoir","venue":"Venue 5","asset":"assets/anomaly-liquid-basin-fixed-static-position-20260520.webp","colour":"Purple","glow":{"base":"#A767FF","soft":"rgba(167,103,255,0.38)","medium":"rgba(167,103,255,0.78)","strong":"rgba(167,103,255,0.95)"},"info":["Contained liquid shows active rippling without external disturbance.","Fluid sample has unknown mineral, organic, or reactive contamination.","Liquid confirms surface fluid presence but must be treated as non-potable."],"summary":"Contained liquid ripples without external disturbance.","header":"FIELD REPORT: RESONANT LIQUID BASIN","body":"Agent, scan received. The Resonant Liquid Basin confirms exposed liquid on UKGE, but it is not safe water. The surface is moving without visible contact, suggesting chemical activity, microbial motion, or a deeper energy response. Survival use is not authorised without treatment and containment.\n\n— General Starguardian, Director of ASTRA"},{"id":"gold-sap-stump","marker":"ASTRA:UKGE:ANOMALY-06","name":"LUMINOUS SAP STUMP","type":"Flora residue / organic secretion","venue":"Venue 6","asset":"assets/anomaly-sap-stump-fixed-static-position-20260520.webp","colour":"Gold","glow":{"base":"#FFD84A","soft":"rgba(255,216,74,0.38)","medium":"rgba(255,216,74,0.78)","strong":"rgba(255,216,74,0.95)"},"info":["Severed organic stump continues to exude luminous sap.","Secretion movement suggests the tissue remains biologically active.","May indicate regenerative flora or a defensive chemical response."],"summary":"Severed organic stump continues to exude luminous sap.","header":"FIELD REPORT: LUMINOUS SAP STUMP","body":"Agent, scan received. The Luminous Sap Stump is still secreting luminous material despite visible damage to the main growth. This may indicate regenerative plant life, a defensive chemical response, or a larger connected root system below the surface. UKGE flora should be treated as active even when it appears damaged.\n\n— General Starguardian, Director of ASTRA"}],"missionBrief":{"id":"mission-brief","title":"MISSION BRIEF: UKGE SURVEY","body":"Agent, ASTRA has detected six anomaly signatures across Unknown Graphite Exoplanet (UK.G.E.). The current readings include active liquid, mineral energy storage, biological growth, atmospheric venting, organic secretion, and evidence of mobile native life.\n\nUse your field scanner to locate and scan each anomaly marker. Each confirmed scan will update your Data Log and send a field report to this inbox.\n\nGather what you can. ASTRA needs evidence of UKGE water safety, mineral value, atmospheric hazards, flora behaviour, fauna movement, and wider expedition risk.\n\nContain. Control. Consider.\n\n— General Starguardian, Director of ASTRA"},"fiveScanMessage":{"id":"mission-status-5","title":"MISSION STATUS UPDATE","body":"Agent, ASTRA has received enough anomaly data to establish a functional UKGE survey profile. The planet is biologically active, chemically unstable, geologically venting, and scientifically valuable.\n\nYou may now return to ASTRA HQ at the Roll Britannia stand for a token of gratitude, or scan the final anomaly to complete the record.\n\n— General Starguardian, Director of ASTRA"},"sixScanMessage":{"id":"mission-complete-6","title":"MISSION COMPLETE","baseBody":"Agent, ASTRA confirms that all six UKGE anomaly signatures have been documented. The planetary survey profile is complete: liquid activity, mineral energy storage, active spores, venting gas, organic secretion, and mobile-life evidence are now logged.\n\nReturn to ASTRA HQ at the Roll Britannia stand to receive a token of gratitude for exceptional field service.","endings":{"emailPrizeUpdates":"Your prize draw details are logged. ASTRA will email you if selected, and Roll Britannia may contact you about future ASTRA missions.","emailPrize":"Your prize draw details are logged. ASTRA will email you if selected.","emailNoPrize":"Your contact details are saved, but prize draw entry is not authorised. Open Agent Profile and tick the prize draw box if you wish to enter.","noEmail":"To be contacted for the prize draw, open Agent Profile, enter your email, tick the prize draw box, and save your details."},"signoff":"— General Starguardian, Director of ASTRA"},"rarities":[{"count":1,"name":"COMMON","asset":"assets/rarity-common.webp"},{"count":2,"name":"UNCOMMON","asset":"assets/rarity-uncommon.webp"},{"count":3,"name":"RARE","asset":"assets/rarity-rare.webp"},{"count":4,"name":"VERY RARE","asset":"assets/rarity-very-rare.webp"},{"count":5,"name":"LEGENDARY","asset":"assets/rarity-legendary.webp"},{"count":6,"name":"GODLIKE","asset":"assets/rarity-godlike.webp"}],"editingGuide":{"purpose":"Edit this file to change app wording. Text in this file is pulled into the game automatically.","important":"Do not change ids, marker payloads, asset paths, or object key names unless you also update the app logic.","safeToEdit":["missionBrief.title","missionBrief.body","anomalies[].name","anomalies[].info","anomalies[].summary","anomalies[].header","anomalies[].body","fiveScanMessage","sixScanMessage","uiText","anomalies[].colour","anomalies[].glow"]},"uiText":{"scannerIdleWord":"SCANNING","scannerDataFound":"DATA FOUND","scannerInstruction":"AIM SCANNER\n\n\nAT ANOMALY","unresolvedSignalTitle":"UNRESOLVED SIGNAL","unresolvedSignalDescription":"Scan anomaly marker to reveal classification and field data.","mapComingSoon":"COMING SOON","simulateScanButton":"SIMULATE SCAN","astraAdventuresOpening":"ASTRA ADVENTURES LINK OPENING","profile":{"title":"AGENT PROFILE","agentNameLabel":"AGENT NAME","emailLabel":"EMAIL ADDRESS","prizeDrawLabel":"ENTER ME INTO THE ASTRA PRIZE DRAW IF I COMPLETE THE FULL ANOMALY SURVEY","updatesLabel":"SUBSCRIBE ME TO ROLL BRITANNIA / ASTRA FUTURE MISSION UPDATES","saveButton":"SAVE PROFILE"},"popups":{"newMessage":"NEW MESSAGE RECEIVED","profileSaved":"PROFILE SAVED","markerAlreadyLogged":"MARKER ALREADY LOGGED","noUnresolvedSignals":"NO UNRESOLVED SIGNALS REMAIN"}}};

let layout = EMBEDDED_LAYOUT;
let game = window.ASTRA_CONTENT || EMBEDDED_GAME;
function t(path, fallback=''){
  try{
    return path.split('.').reduce((obj,key)=>obj && obj[key], game) ?? fallback;
  }catch{ return fallback; }
}
let currentPage = 'home';
let selectedAnomalyId = null;
let videoStream = null;
let detectorTimer = null;
let activeMessageId = 'mission-brief';
let scanStatus = t('uiText.scannerIdleWord','SCANNING');
let pendingScanLock = false;
let typewriterTimer = null;
let firstOpenThisBoot = false;
const ROLL_BRITANNIA_URL = 'https://www.rollbritannia.co.uk/';
let lockedAppHeight = getVisibleViewportHeight();
let profileInputFocused = false;


function getVisibleViewportWidth(){
  const vv = window.visualViewport;
  return Math.max(1, Math.round((vv && vv.width) || window.innerWidth || document.documentElement.clientWidth || layout.stage.width));
}
function getVisibleViewportHeight(){
  const vv = window.visualViewport;
  return Math.max(1, Math.round((vv && vv.height) || window.innerHeight || document.documentElement.clientHeight || layout.stage.height));
}
function isCriticalUiLayer(layer, pageName){
  const asset = String((layer && layer.asset) || '').toLowerCase();
  const name = String((layer && layer.name) || '').toLowerCase();
  if(!layer || layer.type !== 'image') return false;
  if(asset.includes('background-ui.webp')) return true;
  if(asset.includes('background-ui-back-button.webp')) return true;
  if(asset.includes('mail-ui.webp')) return true;
  if(asset.includes('scanner-ui.webp')) return true;
  if(asset.includes('data-log-ui.webp')) return true;
  if(name.includes('mail ui')) return true;
  if(name.includes('scanner_ui')) return true;
  if(name.includes('data log ui')) return true;
  return false;
}
function revealWhenCriticalUiLoaded(stage){
  if(!stage) return;
  const criticalImages = Array.from(stage.querySelectorAll('.critical-ui-layer img'));
  if(!criticalImages.length){
    requestAnimationFrame(()=>stage.classList.remove('ui-loading'));
    return;
  }
  let settled = false;
  const reveal = () => {
    if(settled) return;
    settled = true;
    requestAnimationFrame(()=>stage.classList.remove('ui-loading'));
  };
  let remaining = criticalImages.length;
  const done = () => { remaining -= 1; if(remaining <= 0) reveal(); };
  criticalImages.forEach(img => {
    if(img.complete && img.naturalWidth > 0) done();
    else {
      img.addEventListener('load', done, {once:true});
      img.addEventListener('error', done, {once:true});
    }
  });
  setTimeout(reveal, 2500);
}

function freshProgress(){
  return {
    scanned:{},
    usedMarkers:{},
    messages:['mission-brief'],
    messagesRead:{},
    activeMessageId:'mission-brief',
    profile:{agentName:'', email:'', prizeDraw:false, updates:false},
    missionBriefAutoOpened:false
  };
}
function loadProgress(){
  let p;
  try{ p = JSON.parse(localStorage.getItem(stateKey)) || {}; } catch { p = {}; }
  const f = freshProgress();
  p.scanned = p.scanned || f.scanned;
  p.usedMarkers = p.usedMarkers || f.usedMarkers;
  p.messages = Array.isArray(p.messages) ? p.messages : f.messages;
  if(!p.messages.includes('mission-brief')) p.messages.unshift('mission-brief');
  p.messagesRead = p.messagesRead || f.messagesRead;
  p.activeMessageId = p.activeMessageId || f.activeMessageId;
  p.profile = {...f.profile, ...(p.profile || {})};
  p.missionBriefAutoOpened = !!p.missionBriefAutoOpened;
  return p;
}
function saveProgress(p){ localStorage.setItem(stateKey, JSON.stringify(p)); }
function scannedCount(){ return Object.keys(loadProgress().scanned || {}).length; }
function getAnomaly(id){ return game.anomalies.find(a => a.id === id); }
function getUnscannedAnomalies(){ const p=loadProgress(); return game.anomalies.filter(a => !p.scanned[a.id]); }
function setAnomalyGlow(el, anomaly){
  if(!el || !anomaly || !anomaly.glow) return;
  el.style.setProperty('--anomaly-glow-soft', anomaly.glow.soft || 'rgba(46,220,255,.35)');
  el.style.setProperty('--anomaly-glow-medium', anomaly.glow.medium || 'rgba(46,220,255,.8)');
  el.style.setProperty('--anomaly-glow-strong', anomaly.glow.strong || 'rgba(46,220,255,.95)');
}
function getAgentLabel(){ const name=(loadProgress().profile.agentName || '').trim(); return name ? `Agent ${name}` : 'Agent'; }
function addressBody(body){ return String(body || '').replace(/^Agent\b/, getAgentLabel()); }
function allMessages(){
  const p = loadProgress();
  const out = [];
  for(const id of p.messages){
    if(id === 'mission-brief') out.push({id, title:game.missionBrief.title, body:addressBody(game.missionBrief.body)});
    else if(id === 'mission-status-5') out.push({id, title:game.fiveScanMessage.title, body:addressBody(game.fiveScanMessage.body)});
    else if(id === 'mission-complete-6') out.push(buildSixScanMessage());
    else if(id.startsWith('field-')){
      const a=getAnomaly(id.slice(6));
      if(a) out.push({id, title:a.header, body:addressBody(a.body)});
    }
  }
  return out;
}
function buildSixScanMessage(){
  const p=loadProgress();
  let ending = game.sixScanMessage.endings.noEmail;
  if((p.profile.email || '').trim()){
    if(p.profile.prizeDraw && p.profile.updates) ending = game.sixScanMessage.endings.emailPrizeUpdates;
    else if(p.profile.prizeDraw) ending = game.sixScanMessage.endings.emailPrize;
    else ending = game.sixScanMessage.endings.emailNoPrize;
  }
  return {id:'mission-complete-6', title:game.sixScanMessage.title, body:addressBody(`${game.sixScanMessage.baseBody}\n\n${ending}\n\n${game.sixScanMessage.signoff}`)};
}
function getActiveMessage(){
  const p=loadProgress();
  return allMessages().find(m => m.id === (activeMessageId || p.activeMessageId)) || allMessages()[0];
}
function addMessage(id, popup=true){
  const p = loadProgress();
  if(!p.messages.includes(id)){
    p.messages.push(id);
    saveProgress(p);
    if(popup) showPopup(t('uiText.popups.newMessage','NEW MESSAGE RECEIVED'));
  }
}
function markMessageRead(id){
  const p=loadProgress();
  p.messagesRead[id] = {time:new Date().toISOString()};
  p.activeMessageId = id;
  activeMessageId = id;
  saveProgress(p);
}

function isTextInputFocused(){
  const el=document.activeElement;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
}
function scaleStage(){
  // Keep the terminal centred inside the currently visible viewport.
  // Do not use screen.height here: mobile browsers include browser chrome in screen.height,
  // which was pushing the ASTRA frame down and leaving large black gaps.
  const keyboardOpen = isTextInputFocused();
  const viewportWidth = getVisibleViewportWidth();
  const rawHeight = getVisibleViewportHeight();
  if(!keyboardOpen){
    lockedAppHeight = rawHeight;
    document.documentElement.style.setProperty('--locked-app-height', `${lockedAppHeight}px`);
  }
  const viewportHeight = keyboardOpen ? (lockedAppHeight || rawHeight) : rawHeight;
  const app = document.getElementById('app');
  if(app){
    app.style.width = '100vw';
    app.style.height = `${viewportHeight}px`;
    app.style.maxHeight = `${viewportHeight}px`;
    app.style.left = '0px';
    app.style.top = '0px';
  }
  const scale = Math.min(viewportWidth / layout.stage.width, viewportHeight / layout.stage.height);
  document.documentElement.style.setProperty('--scale', String(scale));
}
async function lockPortrait(){
  try{
    if(screen.orientation && screen.orientation.lock){
      await screen.orientation.lock('portrait');
    }
  }catch(err){
    // iPhone/Safari may refuse orientation lock outside installed fullscreen/PWA mode. CSS still keeps the stage portrait.
  }
}
function installGestureLocks(){
  const prevent = (e)=>{ e.preventDefault(); };
  document.addEventListener('gesturestart', prevent, {passive:false});
  document.addEventListener('gesturechange', prevent, {passive:false});
  document.addEventListener('gestureend', prevent, {passive:false});
  document.addEventListener('dblclick', prevent, {passive:false});
  document.addEventListener('touchmove', (e)=>{ if((e.touches && e.touches.length > 1) || (typeof e.scale === 'number' && e.scale !== 1)){ e.preventDefault(); } }, {passive:false});
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e)=>{
    const now = Date.now();
    if(now - lastTouchEnd <= 300){ e.preventDefault(); }
    lastTouchEnd = now;
  }, {passive:false});
}

function stopCamera(){
  if(detectorTimer){ clearInterval(detectorTimer); detectorTimer=null; }
  if(videoStream){ videoStream.getTracks().forEach(t=>t.stop()); videoStream=null; }
}
function clearTypewriter(){ if(typewriterTimer){ clearInterval(typewriterTimer); typewriterTimer=null; } }

function boot(){
  installGestureLocks();
  lockPortrait();
  document.documentElement.style.setProperty('--locked-app-height', `${lockedAppHeight}px`);
  const p=loadProgress();
  activeMessageId = p.activeMessageId || 'mission-brief';
  firstOpenThisBoot = !p.missionBriefAutoOpened;
  if(firstOpenThisBoot){
    p.activeMessageId = 'mission-brief';
    p.missionBriefAutoOpened = true;
    p.messagesRead['mission-brief'] = {time:new Date().toISOString()};
    saveProgress(p);
    activeMessageId = 'mission-brief';
    renderPage('inbox', null, {typewriter:true});
  } else {
    renderPage('home');
  }
  window.addEventListener('resize', scaleStage, {passive:true});
  window.addEventListener('orientationchange', () => { window.scrollTo(0,0); setTimeout(()=>{ lockPortrait(); scaleStage(); }, 80); }, {passive:true});
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize', ()=>{ if(!isTextInputFocused()) scaleStage(); }, {passive:true});
    window.visualViewport.addEventListener('scroll', ()=>{ if(!isTextInputFocused()) scaleStage(); }, {passive:true});
  }
}

function renderPage(pageName, selectedId=null, opts={}){
  stopCamera();
  clearTypewriter();
  currentPage = pageName;
  selectedAnomalyId = selectedId;
  const app=document.getElementById('app');
  app.innerHTML='';
  const stage=document.createElement('div');
  stage.id='appStage';
  stage.className=`stage page-${pageName} ui-loading`;
  app.appendChild(stage);
  scaleStage();

  if(pageName === 'profile'){ renderProfile(stage); revealWhenCriticalUiLoaded(stage); return; }

  // Inbox is a pop-up over the full Home Terminal. Other pages replace Home.
  if(pageName === 'inbox'){
    renderJsonPageLayers(stage, 'home', selectedId, opts, 'home');
    addAstraAdventuresButton(stage);
    renderJsonPageLayers(stage, 'inbox', selectedId, opts, 'inbox');
    addInboxList(stage);
    if(opts.typewriter) runTypewriter();
    revealWhenCriticalUiLoaded(stage);
    return;
  }

  const page=layout.pages[pageName];
  if(!page){ renderPage('home'); return; }
  renderJsonPageLayers(stage, pageName, selectedId, opts, pageName);

  if(pageName === 'home') addAstraAdventuresButton(stage);
  if(pageName === 'map') addMapComingSoon(stage);
  if(pageName === 'anomalyDetail') startCameraIfAvailable();
  if(pageName === 'anomalyDetail' && new URLSearchParams(location.search).get('test') === '1') addSimulateButton(stage);
  revealWhenCriticalUiLoaded(stage);
}

function renderJsonPageLayers(stage, pageKey, selectedId=null, opts={}, behaviorPage=pageKey){
  const page=layout.pages[pageKey];
  if(!page) return;
  const layers=[...page.layers].sort((a,b)=>(a.zIndex||0)-(b.zIndex||0));
  for(const layer of layers){
    const el=createLayer(layer, behaviorPage, selectedId, opts);
    if(behaviorPage === 'inbox'){
      const base = parseInt(el.style.zIndex || '0', 10);
      el.style.zIndex = String(base + 500);
    }
    stage.appendChild(el);
  }
}

function createLayer(layer, pageName, selectedId, opts){
  const el=document.createElement('div');
  el.className=`layer ${layer.type}`;
  el.dataset.layerId=layer.id;
  el.dataset.layerName=layer.name || '';
  if(isCriticalUiLayer(layer, pageName)) el.classList.add('critical-ui-layer');
  el.style.left=`${layer.x}px`; el.style.top=`${layer.y}px`;
  if(pageName === 'anomalyDetail' && layer.type === 'text' && layer.name === 'Data Found') el.style.top=`${layer.y + 22}px`;
  el.style.width=`${layer.width}px`; el.style.height=`${layer.height}px`;
  el.style.opacity=layer.opacity ?? 1; el.style.zIndex=layer.zIndex ?? 0;
  el.style.transform=`rotate(${layer.rotation || 0}deg)`;
  if(layer.visible === false) el.style.display='none';

  if(layer.type === 'image'){
    if(pageName === 'inbox' && (layer.name || '').includes('Mail Open Icon')) el.style.display='none';
    const img=document.createElement('img');
    img.src=versionedAsset(resolveImage(layer,pageName,selectedId)); img.alt=layer.name || '';
    el.appendChild(img);
    if(pageName === 'scanner' && (layer.name || '').includes('unknown_anomaly')) {
      // New animated WebP anomalies already contain their own movement.
      // Keep the original scanner layer position/size only; no old pulse, float, scale, glow-cycle, padding, or JS movement.
      el.classList.add('anomaly-media-static');
      el.style.animation='none';
      el.style.transition='none';
      el.style.filter='none';
      el.style.padding='0';
      el.style.overflow='visible';
      img.style.animation='none';
      img.style.transition='none';
      img.style.transform='none';
      img.style.filter='none';
      img.style.objectFit='contain';
      img.style.objectPosition='center center';
    }
    if(pageName === 'home' && (layer.name || '') === 'astronaut profile icon transparent') el.classList.add('home-icon-attention-pulse');
    if(pageName === 'home' && (layer.name || '') === 'inbox vertical transparent' && hasUnreadMessages()) {
      el.classList.add('home-icon-attention-pulse');
      const unreadDot=document.createElement('span');
      unreadDot.className='home-inbox-unread-dot';
      el.appendChild(unreadDot);
    }
    if(pageName === 'home' && (layer.name || '') === 'signal core radar transparent') {
      el.classList.add('home-tracker-rotating');
      addHomeNodesToTracker(el);
    }
    if(pageName === 'dataLog' && (layer.name || '').includes('unknown_anomaly')) {
      const slotAnomaly = dataLogSlotOrder()[slotFromDataLogLayer(layer.x, layer.y)];
      if(slotAnomaly && loadProgress().scanned[slotAnomaly.id]) setAnomalyGlow(el, slotAnomaly);
      el.classList.add('anomaly-media-static');
    }
    wireImageClick(el, layer, pageName);
  } else if(layer.type === 'text'){
    const text=resolveText(layer,pageName,selectedId);
    el.textContent=text;
    el.style.fontSize=`${fontSizeForLayer(layer,pageName)}px`;
    if(pageName === 'scanner' && layer.name === 'ANOMALY NAME'){
      el.style.fontSize = `${scannerNameFontSize(text)}px`;
      el.style.lineHeight = '0.98';
      el.style.letterSpacing = '0.035em';
      el.style.width = '670px';
      el.style.left = '205px';
      el.style.justifyContent = 'center';
      el.style.alignItems = 'center';
      el.style.overflow = 'visible';
    }
    el.style.color=layer.color || '#2cff6a';
    el.style.letterSpacing=`${(layer.letterSpacing || 0)}em`;
    el.classList.add(layer.align === 'left' ? 'align-left' : 'align-center');
    el.classList.add('no-glow');
    if(pageName === 'inbox' && inboxTextSlotFromLayer(layer) !== null) el.style.display='none';
    if(pageName === 'anomalyDetail' && layer.name === 'Data Found') {
      el.classList.add(scanStatus === t('uiText.scannerDataFound','DATA FOUND') ? 'scanner-data-found-status' : 'scanner-loading-status');
    }
    if(pageName === 'anomalyDetail' && layer.name === 'Text Layer') el.classList.add('scanner-instruction-pulse');
    if(pageName === 'inbox' && layer.name === 'MAIL MESSAGE HEADER'){ el.classList.add('inbox-active-header'); el.style.height='122px'; }
    if(pageName === 'inbox' && layer.name === 'Mail Message Content'){ el.id='activeMessageBody'; el.classList.add('active-message-scroll'); }
    if(pageName === 'dataLog' && String(layer.name||'').startsWith('Anomaly')){ el.style.lineHeight='1.04'; el.style.alignItems='center'; }
    if(pageName === 'scanner' && String(layer.name||'').startsWith('Anomaly Info')){ el.style.lineHeight='1.05'; el.style.alignItems='center'; }
    if(layer.name === 'Close Button'){
      el.classList.add('clickable'); el.style.pointerEvents='auto';
      el.addEventListener('click',()=>renderPage('home'));
    }
    wireTextClick(el, layer, pageName);
  } else if(layer.type === 'placeholder'){
    if(layer.name === 'Camera Scanner'){
      const video=document.createElement('video');
      video.id='scannerVideo'; video.setAttribute('playsinline',''); video.muted=true;
      el.appendChild(video);
    }
  }
  return el;
}
function scannerNameFontSize(name){
  const len = String(name || '').replace(/s+/g,' ').trim().length;
  if(len >= 22) return 40;
  if(len >= 20) return 43;
  if(len >= 18) return 46;
  if(len >= 16) return 50;
  return 56;
}

function fontSizeForLayer(layer,pageName){
  if(pageName === 'dataLog' && String(layer.name||'').startsWith('Anomaly')) return 20;
  if(pageName === 'scanner' && String(layer.name||'').startsWith('Anomaly Info')) return 27;
  if(pageName === 'inbox' && layer.name === 'MAIL MESSAGE HEADER') return 36;
  if(pageName === 'inbox' && layer.name === 'Mail Message Content') return 34;
  if(pageName === 'inbox' && inboxTextSlotFromLayer(layer) !== null) return 17;
  return layer.fontSize || 32;
}

function resolveImage(layer,pageName,selectedId){
  const p=loadProgress(); const lname=layer.name || '';
  if(pageName === 'inbox' && lname.includes('Mail Open Icon')){
    const msg=getMessageBySlot(inboxSlotFromLayer(layer));
    return msg && p.messagesRead[msg.id] ? 'assets/mail-open-icon.webp' : 'assets/mail-closed-icon.webp';
  }
  if(pageName === 'scanner' && lname.includes('unknown_anomaly')){
    const a=getAnomaly(selectedId); return a ? a.asset : 'assets/unknown-anomaly.webp';
  }
  if(pageName === 'dataLog' && lname === 'Data Log UI.png') return 'assets/data-log-ui.webp';
  if(pageName === 'dataLog' && lname.includes('unknown_anomaly')){
    const a=dataLogSlotOrder()[slotFromDataLogLayer(layer.x, layer.y)];
    return a && p.scanned[a.id] ? a.asset : 'assets/unknown-anomaly.webp';
  }
  return layer.asset || TRANSPARENT_PIXEL;
}
function resolveText(layer,pageName,selectedId){
  const lname=layer.name || ''; const p=loadProgress();
  if(pageName === 'anomalyDetail'){
    if(lname === 'Data Found') return scanStatus === t('uiText.scannerDataFound','DATA FOUND') ? t('uiText.scannerDataFound','DATA FOUND') : t('uiText.scannerIdleWord','SCANNING');
    if(lname === 'Text Layer') return t('uiText.scannerInstruction','AIM SCANNER\n\n\nAT ANOMALY');
  }
  if(pageName === 'scanner'){
    const a=getAnomaly(selectedId);
    if(a){
      if(lname === 'ANOMALY NAME') return a.name;
      if(lname === 'Anomaly Info 1') return a.info[0] || '';
      if(lname === 'Anomaly Info 2') return a.info[1] || '';
      if(lname === 'Anomaly Info 3') return a.info[2] || '';
    } else {
      if(lname === 'ANOMALY NAME') return t('uiText.unresolvedSignalTitle','UNRESOLVED SIGNAL');
      if(lname === 'Anomaly Info 1') return t('uiText.unresolvedSignalDescription','Scan anomaly marker to reveal classification and field data.');
      if(lname === 'Anomaly Info 2' || lname === 'Anomaly Info 3') return '';
    }
  }
  if(pageName === 'inbox'){
    if(lname === 'Close Button') return '';
    const active=getActiveMessage();
    if(lname === 'MAIL MESSAGE HEADER') return active.title;
    if(lname === 'Mail Message Content') return active.body;
    const slot=inboxTextSlotFromLayer(layer);
    if(slot !== null){ const msg=getMessageBySlot(slot); return msg ? msg.title : ''; }
  }
  if(pageName === 'dataLog' && lname.startsWith('Anomaly')){
    const a=dataLogSlotOrder()[dataLogTextSlotFromLayer(layer)];
    if(a && p.scanned[a.id]) return `${a.name}\n${a.summary}`;
    return `${t('uiText.unresolvedSignalTitle','UNRESOLVED SIGNAL')}\n${t('uiText.unresolvedSignalDescription','Scan anomaly marker to reveal classification and field data.')}`;
  }
  return layer.text || '';
}

function dataLogSlotOrder(){ return game.anomalies; }
function nearestSlot(y, order){ return order.map((v,i)=>({i,d:Math.abs(y-v)})).sort((a,b)=>a.d-b.d)[0].i; }
function slotFromDataLogLayer(x,y){ return nearestSlot(y,[471,679,881,1081,1289,1492]); }
function dataLogTextSlotFromLayer(layer){ return nearestSlot(layer.y,[540,741,951,1155,1359,1560]); }
function inboxSlotFromLayer(layer){ return nearestSlot(layer.y,[500,610,720,830,940,1050,1160]); }
function inboxTextSlotFromLayer(layer){
  const n=layer.name || '';
  if(!(n.startsWith('Mail Message Content Copy') || n === 'Mail Message 7')) return null;
  return nearestSlot(layer.y,[525,635,745,855,965,1076,1185]);
}
function getMessageBySlot(slot){ return allMessages().slice(-7)[slot] || null; }
function hasUnreadMessages(){
  const p=loadProgress();
  return allMessages().some(msg=>!p.messagesRead[msg.id]);
}

function wireImageClick(el,layer,pageName){
  const lname=layer.name || '';
  if(lname === 'RB LOWECASE LOGO R' || (layer.asset || '').includes('rb-logo')){
    el.classList.add('clickable');
    el.addEventListener('click',()=>window.open(ROLL_BRITANNIA_URL,'_blank','noopener'));
  }
  if(lname === 'Background UI Back Button.png'){
    el.classList.add('clickable');
    el.addEventListener('click',()=>{
      if(pageName === 'scanner') renderPage('dataLog');
      else if(pageName === 'dataLog') renderPage('home');
      else if(pageName === 'anomalyDetail') renderPage('home');
      else renderPage('home');
    });
  }
  if(pageName === 'home'){
    if(lname === 'futuristic sci fi scanner interface panel'){ el.classList.add('clickable'); el.addEventListener('click',()=>renderPage('anomalyDetail')); }
    if(lname === 'map vertical transparent'){ el.classList.add('clickable'); el.addEventListener('click',()=>renderPage('map')); }
    if(lname === 'inbox vertical transparent'){ el.classList.add('clickable'); el.addEventListener('click',()=>renderPage('inbox')); }
    if(lname === 'futuristic data log ui panel'){ el.classList.add('clickable'); el.addEventListener('click',()=>renderPage('dataLog')); }
    if(lname === 'astronaut profile icon transparent'){ el.classList.add('clickable'); el.addEventListener('click',()=>renderPage('profile')); }
  }
  if(pageName === 'inbox' && lname.includes('Mail Open Icon')){
    const msg=getMessageBySlot(inboxSlotFromLayer(layer));
    if(msg){ el.classList.add('clickable'); el.addEventListener('click',()=>{ markMessageRead(msg.id); renderPage('inbox'); }); }
  }
  if(pageName === 'dataLog' && lname.includes('unknown_anomaly')){
    const a=dataLogSlotOrder()[slotFromDataLogLayer(layer.x,layer.y)];
    if(a && loadProgress().scanned[a.id]){ el.classList.add('clickable'); el.addEventListener('click',()=>renderPage('scanner',a.id)); }
  }
}
function wireTextClick(el,layer,pageName){
  if(pageName !== 'inbox') return;
  const slot=inboxTextSlotFromLayer(layer);
  if(slot === null) return;
  const msg=getMessageBySlot(slot);
  if(msg){ el.classList.add('clickable'); el.style.pointerEvents='auto'; el.addEventListener('click',()=>{ markMessageRead(msg.id); renderPage('inbox'); }); }
}


function addInboxList(stage){
  const p=loadProgress();
  const messages=allMessages();
  const list=document.createElement('div');
  list.className='inbox-scroll-list';
  list.style.zIndex=820;
  messages.forEach((msg,idx)=>{
    const row=document.createElement('div');
    row.className='inbox-message-row clickable';
    row.style.top=`${idx*110}px`;
    const icon=document.createElement('img');
    icon.className='inbox-message-icon';
    icon.src=versionedAsset(p.messagesRead[msg.id] ? 'assets/mail-open-icon.webp' : 'assets/mail-closed-icon.webp');
    const title=document.createElement('div');
    title.className='inbox-message-title';
    title.textContent=msg.title;
    row.appendChild(icon); row.appendChild(title);
    row.addEventListener('click',()=>{ markMessageRead(msg.id); renderPage('inbox'); });
    list.appendChild(row);
  });
  stage.appendChild(list);
}

function addHomeNodesToTracker(trackerEl){
  const p=loadProgress();
  // Locked from the user's red-dot target image. Values are the centre points inside the tracker asset.
  const nodePositions=[
    {left:'49.85%', top:'12.57%', angle:0}, // top
    {left:'85.87%', top:'30.10%', angle:60}, // upper right
    {left:'85.97%', top:'70.94%', angle:120}, // lower right
    {left:'49.95%', top:'87.96%', angle:180}, // bottom
    {left:'13.84%', top:'70.94%', angle:240}, // lower left
    {left:'13.94%', top:'30.28%', angle:300}  // upper left
  ];
  game.anomalies.forEach((a,i)=>{
    const size=86;
    const pos=nodePositions[i];
    const d=document.createElement('div');
    d.className='home-anomaly-node anomaly-media-static';
    d.style.left=pos.left;
    d.style.top=pos.top;
    d.style.width=`${size}px`;
    d.style.height=`${size}px`;
    d.style.marginLeft=`-${size/2}px`;
    d.style.marginTop=`-${size/2}px`;
    d.style.zIndex=6;
    d.style.transform = `rotate(${pos.angle || 0}deg)`;
    const img=document.createElement('img');
    img.src=versionedAsset(p.scanned[a.id] ? a.asset : 'assets/unknown-anomaly.webp');
    img.alt=p.scanned[a.id] ? a.name : t('uiText.unresolvedSignalTitle','UNRESOLVED SIGNAL');
    d.appendChild(img);
    if(p.scanned[a.id]){
      setAnomalyGlow(d, a);
      d.classList.add('clickable');
      d.addEventListener('click',(ev)=>{ ev.stopPropagation(); renderPage('scanner',a.id); });
    }
    trackerEl.appendChild(d);
  });
}
function addAstraAdventuresButton(stage){
  const d=document.createElement('div');
  d.className='astra-adventures-home clickable home-icon-attention-pulse';
  // Mirrored from the astronaut profile icon position: same size, same bottom margin, opposite side.
  d.style.left='705px'; d.style.top='1528px'; d.style.width='186px'; d.style.height='174px'; d.style.zIndex=90;
  const img=document.createElement('img'); img.src=versionedAsset('assets/screen-icon.webp'); img.alt='Astra Adventures';
  d.appendChild(img);
  d.addEventListener('click',()=>openAstraAdventures(stage));
  stage.appendChild(d);
}
function openAstraAdventures(stage){
  showPopup(t('uiText.astraAdventuresOpening','ASTRA ADVENTURES LINK OPENING'));
  setTimeout(()=>window.open(game.youtube,'_blank','noopener'),700);
}
function addMapComingSoon(stage){
  const d=document.createElement('div'); d.className='map-coming-soon';
  d.textContent=t('uiText.mapComingSoon','COMING SOON'); d.style.left='240px'; d.style.top='860px'; d.style.width='600px'; d.style.height='160px'; d.style.zIndex=180;
  stage.appendChild(d);
}
function addSimulateButton(stage){
  const d=document.createElement('button'); d.className='simulate-scan-button'; d.textContent=t('uiText.simulateScanButton','SIMULATE SCAN');
  d.addEventListener('click',()=>simulateScan()); stage.appendChild(d);
}
function showPopup(text){
  const app=document.getElementById('app');
  app.querySelectorAll('.popup-message').forEach(existing=>existing.remove());
  const p=document.createElement('div');
  p.className='popup-message';
  p.textContent=text;
  app.appendChild(p);
  setTimeout(()=>p.remove(),2400);
}

function renderProfile(stage){
  addImage(stage,'assets/background-ui.webp',-3,-3,1084,1925,-20);
  const back=addImage(stage,'assets/background-ui-back-button.webp',-11,39,370,93,110); back.classList.add('clickable'); back.addEventListener('click',()=>renderPage('home'));
  addImage(stage,'assets/rb-logo.webp',825,45,200,80,130);
  const p=loadProgress();
  const panel=document.createElement('div'); panel.className='profile-panel'; panel.style.zIndex=500;
  panel.innerHTML=`
    <h1>${t('uiText.profile.title','AGENT PROFILE')}</h1>
    <label>${t('uiText.profile.agentNameLabel','AGENT NAME')}<input type="text" id="agentName" value="${escapeAttr(p.profile.agentName)}"></label>
    <label>${t('uiText.profile.emailLabel','EMAIL ADDRESS')}<input type="email" id="agentEmail" value="${escapeAttr(p.profile.email)}"></label>
    <label class="check"><input type="checkbox" id="prizeDraw" ${p.profile.prizeDraw?'checked':''}> ${t('uiText.profile.prizeDrawLabel','ENTER ME INTO THE ASTRA PRIZE DRAW IF I COMPLETE THE FULL ANOMALY SURVEY')}</label>
    <label class="check"><input type="checkbox" id="updates" ${p.profile.updates?'checked':''}> ${t('uiText.profile.updatesLabel','SUBSCRIBE ME TO ROLL BRITANNIA / ASTRA FUTURE MISSION UPDATES')}</label>
    <button id="saveProfile">${t('uiText.profile.saveButton','SAVE PROFILE')}</button>
  `;
  stage.appendChild(panel);
  panel.querySelector('#saveProfile').addEventListener('click',()=>{
    const pr=loadProgress();
    pr.profile.agentName=panel.querySelector('#agentName').value.trim();
    pr.profile.email=panel.querySelector('#agentEmail').value.trim();
    pr.profile.prizeDraw=panel.querySelector('#prizeDraw').checked;
    pr.profile.updates=panel.querySelector('#updates').checked;
    saveProgress(pr);
    renderPage('home');
    setTimeout(()=>showPopup(t('uiText.popups.profileSaved','PROFILE SAVED')), 50);
  });
  panel.querySelectorAll('input').forEach(input=>{
    input.addEventListener('focus',()=>{ profileInputFocused=true; scaleStage(); });
    input.addEventListener('blur',()=>{ profileInputFocused=false; setTimeout(scaleStage, 120); });
  });
}
function escapeAttr(s){ return String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function addImage(stage,src,x,y,w,h,z){ const d=document.createElement('div'); d.className='layer image'; Object.assign(d.style,{left:x+'px',top:y+'px',width:w+'px',height:h+'px',zIndex:z}); const img=document.createElement('img'); img.src=versionedAsset(src); d.appendChild(img); if(String(src).includes('rb-logo')){ d.classList.add('clickable'); d.addEventListener('click',()=>window.open(ROLL_BRITANNIA_URL,'_blank','noopener')); } stage.appendChild(d); return d; }

function runTypewriter(){
  const el=document.getElementById('activeMessageBody'); if(!el) return;
  const full=el.textContent; el.textContent=''; let i=0;
  typewriterTimer=setInterval(()=>{ el.textContent=full.slice(0,i++); if(i>full.length) clearTypewriter(); }, 10);
}

async function startCameraIfAvailable(){
  const video=document.getElementById('scannerVideo');
  if(!video || !navigator.mediaDevices?.getUserMedia){
    showPopup('CAMERA ACCESS NOT AVAILABLE');
    return;
  }
  try{
    videoStream=await navigator.mediaDevices.getUserMedia({
      video:{ facingMode:{ ideal:'environment' }, width:{ ideal:1280 }, height:{ ideal:720 } },
      audio:false
    });
    video.srcObject=videoStream;
    await video.play();

    // Chrome/Android path: native BarcodeDetector.
    if('BarcodeDetector' in window){
      const detector=new BarcodeDetector({formats:['qr_code']});
      detectorTimer=setInterval(async()=>{
        try{
          const codes=await detector.detect(video);
          for(const code of codes){
            const marker=extractMarker(code.rawValue || '');
            if(marker){ handleDetectedScan(marker); break; }
          }
        }catch{}
      },300);
      return;
    }

    // iPhone/Safari path: BarcodeDetector is usually unavailable, so use jsQR.
    if(typeof window.jsQR === 'function'){
      const canvas=document.createElement('canvas');
      const ctx=canvas.getContext('2d', { willReadFrequently:true });
      detectorTimer=setInterval(()=>{
        try{
          if(video.readyState < 2 || pendingScanLock) return;
          const vw=video.videoWidth || 640;
          const vh=video.videoHeight || 480;
          canvas.width=vw;
          canvas.height=vh;
          ctx.drawImage(video,0,0,vw,vh);
          const imageData=ctx.getImageData(0,0,vw,vh);
          const code=window.jsQR(imageData.data, vw, vh, { inversionAttempts:'attemptBoth' });
          if(code && code.data){
            const marker=extractMarker(code.data);
            if(marker) handleDetectedScan(marker);
          }
        }catch{}
      },250);
      return;
    }

    showPopup('QR SCANNER NOT AVAILABLE IN THIS BROWSER');
  }catch(err){
    showPopup('CAMERA PERMISSION NEEDED');
  }
}
function extractMarker(raw){
  const cleaned=String(raw||'').trim().toUpperCase();
  return game.markers.find(m => cleaned === m || cleaned.includes(m)) || null;
}
function simulateScan(){
  const marker=game.markers.find(m => !loadProgress().usedMarkers[m]);
  if(marker) handleDetectedScan(marker);
  else showPopup(t('uiText.popups.noUnresolvedSignals','NO UNRESOLVED SIGNALS REMAIN'));
}
function handleDetectedScan(marker){
  if(pendingScanLock) return;
  const p=loadProgress();
  if(p.usedMarkers[marker]){ showPopup(t('uiText.popups.markerAlreadyLogged','MARKER ALREADY LOGGED')); return; }
  const next=getUnscannedAnomalies()[0];
  if(!next){ showPopup(t('uiText.popups.noUnresolvedSignals','NO UNRESOLVED SIGNALS REMAIN')); return; }
  pendingScanLock=true;
  scanStatus=t('uiText.scannerDataFound','DATA FOUND');
  renderPage('anomalyDetail');
  setTimeout(()=>{
    registerScan(marker,next.id);
    scanStatus=t('uiText.scannerIdleWord','SCANNING'); pendingScanLock=false;
    renderPage('scanner',next.id);
  },1200);
}
function registerScan(marker, anomalyId){
  const p=loadProgress();
  p.usedMarkers[marker]={time:new Date().toISOString(), anomalyId};
  p.scanned[anomalyId]={time:new Date().toISOString(), marker};
  saveProgress(p);
  addMessage(`field-${anomalyId}`);
  const count=scannedCount();
  if(count >= 5) addMessage('mission-status-5');
  if(count >= 6) addMessage('mission-complete-6');
}

boot();


/* Final safety pass: strip old anomaly pulse classes if any older saved/embedded layer path adds them. */
function removeLegacyAnomalyPulseClasses(){
  document.querySelectorAll('.data-log-entity-pulse, .anomaly-detail-entity, .home-anomaly-node').forEach(el => {
    if(el.classList.contains('data-log-entity-pulse')){
      el.classList.remove('data-log-entity-pulse');
      el.classList.add('anomaly-media-static');
    }
    if(el.classList.contains('anomaly-detail-entity') || el.classList.contains('home-anomaly-node')){
      el.classList.add('anomaly-media-static');
    }
    el.style.animation = 'none';
    el.style.transition = 'none';
    el.style.filter = 'none';
  });
}
const __astraOriginalRenderPage = renderPage;
renderPage = function(...args){
  __astraOriginalRenderPage(...args);
  requestAnimationFrame(removeLegacyAnomalyPulseClasses);
};
requestAnimationFrame(removeLegacyAnomalyPulseClasses);
setTimeout(removeLegacyAnomalyPulseClasses, 150);
