const CACHE = "restoration-route-github-webp-v1";
const ASSETS = [
  "index.html",
  "app.js",
  "data.js",
  "styles.css",
  "manifest.webmanifest",
  "firestore.rules",
  "QR_LINKS.md",
  "README.md",
  "GITHUB_UPLOAD_INSTRUCTIONS.txt",
  "assets/component_assets_exhaust_broken.png",
  "assets/component_assets_exhaust_fixed.png",
  "assets/component_assets_fuel_tank_broken.png",
  "assets/component_assets_fuel_tank_fixed.png",
  "assets/component_assets_gearbox_fixed.png",
  "assets/component_assets_headlight_broken.png",
  "assets/component_assets_headlight_fixed.png",
  "assets/component_assets_horn_broken.png",
  "assets/component_assets_horn_fixed.png",
  "assets/component_assets_oil_filter_fixed.png",
  "assets/component_assets_wheel_broken.png",
  "assets/component_assets_wheel_fixed.png",
  "assets/8_venue_assets_venue_1_ui.webp",
  "assets/8_venue_assets_venue_2_ui.webp",
  "assets/8_venue_assets_venue_3_ui.webp",
  "assets/8_venue_assets_venue_4_ui.webp",
  "assets/8_venue_assets_venue_5_ui.webp",
  "assets/8_venue_assets_venue_6_ui.webp",
  "assets/8_venue_assets_venue_7_ui.webp",
  "assets/8_venue_assets_venue_8_ui.webp",
  "assets/home_ui.webp",
  "assets/garage_directory_assets_repaired_stamp.webp",
  "assets/8_venue_assets_garage_directory_ui.webp",
  "assets/wall_map_exact_from_json.webp",
  "assets/component_assets_scanner_tool.webp",
  "assets/menu_ui.webp",
  "assets/banter_box.webp",
  "assets/garage_directory_exact_from_json.webp",
  "assets/menu_buttons_restoration_route_button_profile_true_alpha.webp",
  "assets/scanner_ui.webp",
  "assets/component_assets_radiator_broken.webp",
  "assets/menu_buttons_restoration_route_button_leaderboard_true_alpha.webp",
  "assets/menu_buttons_restoration_route_button_issues_true_alpha.webp",
  "assets/menu_buttons_restoration_route_button_log_out_true_alpha.webp",
  "assets/garage_directory_assets_home_button.webp",
  "assets/engine_damaged_true_transparent.webp",
  "assets/engine_repaired_true_transparent.webp",
  "assets/component_assets_radiator_fixed.webp",
  "assets/component_assets_oil_filter_broken.webp",
  "assets/component_assets_gearbox_broken.webp",
  "qr-codes/piston-club.png",
  "qr-codes/oily-rag.png",
  "qr-codes/seven-mile.png",
  "qr-codes/mr-watsons.png",
  "qr-codes/gilks-garage.png",
  "qr-codes/long-itch-diner.png",
  "qr-codes/pats-baps.png",
  "qr-codes/the-man-cave.png"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
});
self.addEventListener("fetch", event => {
  event.respondWith(caches.match(event.request).then(resp => resp || fetch(event.request).then(net => {
    const copy = net.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(()=>{});
    return net;
  }).catch(() => caches.match("index.html"))));
});
