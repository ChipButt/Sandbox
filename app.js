
const DATA = window.RESTORATION_ROUTE_DATA;
const homeRoot = document.getElementById("homeRoot");
const overlayRoot = document.getElementById("overlayRoot");
const scannerRoot = document.getElementById("scannerRoot");
const STORE_KEY = "restorationRoute8VenueState.finished.v1";
const ADMIN_CODE = "Watson";

let auth=null, db=null, currentUser=null, firebaseReady=false;
let activeScannerStream=null, activeScannerTimer=null;
let hornTapTimes=[];

function baseRepaired(){ const r={}; DATA.venues.forEach(v=>r[v.id]=false); return r; }
function defaultState(){
  return { uid:"", email:"", username:"", termsAccepted:false, emailVerified:false,
    repaired:baseRepaired(), completedVehicles:0, prizeEntries:0, pendingPrizeEntries:0,
    totalPartsRestored:0, currentVehicle:1, hornBroken:false, hornBrokenCount:0, hornRestoredCount:0, log:[] };
}
let state = loadLocal();
function loadLocal(){ try{ return {...defaultState(), ...JSON.parse(localStorage.getItem(STORE_KEY)||"{}"), repaired:{...baseRepaired(), ...(JSON.parse(localStorage.getItem(STORE_KEY)||"{}").repaired||{})}}; }catch{return defaultState();} }
function saveLocal(){ localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
function venueById(id){ return DATA.venues.find(v=>v.id===id); }
function allRepaired(){ return DATA.venues.every(v=>state.repaired[v.id]); }
function repairedCount(){ return DATA.venues.filter(v=>state.repaired[v.id]).length; }

async function sha256(s){
  const d=await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(s||"")));
  return [...new Uint8Array(d)].map(b=>b.toString(16).padStart(2,"0")).join("");
}

async function initFirebase(){
  try{
    const {initializeApp}=await import("https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js");
    const authMod=await import("https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js");
    const fsMod=await import("https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js");
    window.fb={...authMod,...fsMod};
    const app=initializeApp(DATA.firebaseConfig);
    auth=authMod.getAuth(app); db=fsMod.getFirestore(app); firebaseReady=true;
    authMod.onAuthStateChanged(auth, async user=>{
      currentUser=user;
      if(user){ await loadCloud(user); renderHome(); closeAuthPanel(); if(!state.username||!state.termsAccepted) openAuthPanel("complete"); }
      else { renderHome(); openAuthPanel("login"); }
    });
  }catch(e){ renderHome(); openAuthPanel("login","Firebase could not load. Check Firebase setup/internet."); }
}
async function loadCloud(user){
  state.uid=user.uid; state.email=user.email||""; state.emailVerified=!!user.emailVerified;
  const ref=fb.doc(db,"userVisits",user.uid), snap=await fb.getDoc(ref);
  if(snap.exists()) state={...defaultState(),...snap.data(),uid:user.uid,email:user.email||snap.data().email||"",emailVerified:!!user.emailVerified,repaired:{...baseRepaired(),...(snap.data().repaired||{})}};
  await saveCloud();
}
async function saveCloud(){
  saveLocal();
  if(!firebaseReady||!currentUser) return;
  const data={uid:currentUser.uid,email:currentUser.email||state.email||"",username:state.username||"",termsAccepted:!!state.termsAccepted,emailVerified:!!currentUser.emailVerified,
    repaired:state.repaired,completedVehicles:state.completedVehicles||0,prizeEntries:state.prizeEntries||0,pendingPrizeEntries:state.pendingPrizeEntries||0,totalPartsRestored:state.totalPartsRestored||0,
    currentVehicle:state.currentVehicle||1,hornBroken:!!state.hornBroken,hornBrokenCount:state.hornBrokenCount||0,hornRestoredCount:state.hornRestoredCount||0,updatedAt:fb.serverTimestamp()};
  await fb.setDoc(fb.doc(db,"userVisits",currentUser.uid),data,{merge:true});
  if(state.username) await fb.setDoc(fb.doc(db,"leaderboard",currentUser.uid),{uid:currentUser.uid,username:state.username,completedVehicles:state.completedVehicles||0,prizeEntries:state.prizeEntries||0,pendingPrizeEntries:state.pendingPrizeEntries||0,totalPartsRestored:state.totalPartsRestored||0,updatedAt:fb.serverTimestamp()},{merge:true});
}

function stableSrc(src,name=""){
  if(!src||String(src).startsWith("blob:null/")){
    const n=name.toLowerCase();
    if(n.includes("garage directory"))return DATA.assets.serviceBook;
    if(n.includes("wall map"))return DATA.assets.wallMap;
    if(n.includes("scanner tool"))return DATA.assets.scannerTool;
    if(n.includes("scanner home"))return DATA.assets.homeButton;
    if(n.includes("engine_damaged"))return DATA.components.engine.broken;
    if(n.includes("engine_repaired"))return DATA.components.engine.fixed;
    if(n.includes("venue 1 ui"))return DATA.assets.venue1;
    if(n.includes("garage directory ui"))return DATA.assets.directory;
    return "";
  }
  const map={
    "assets/home_ui.webp":DATA.assets.home,"assets/menu_ui.webp":DATA.assets.menu,"assets/scanner_ui.webp":DATA.assets.scanner,"assets/banter_box.webp":DATA.assets.banterBox,
    "assets/component_assets_exhaust_broken.png":DATA.components.exhaust.broken,"assets/component_assets_exhaust_fixed.png":DATA.components.exhaust.fixed,
    "assets/component_assets_fuel_tank_broken.png":DATA.components.fuel_tank.broken,"assets/component_assets_fuel_tank_fixed.png":DATA.components.fuel_tank.fixed,
    "assets/component_assets_horn_fixed.png":DATA.components.horn.fixed,"assets/component_assets_horn_broken.png":DATA.components.horn.broken,
    "assets/component_assets_headlight_broken.png":DATA.components.headlight.broken,"assets/component_assets_headlight_fixed.png":DATA.components.headlight.fixed,
    "assets/component_assets_oil_filter_broken.webp":DATA.components.oil_filter.broken,"assets/component_assets_oil_filter_fixed.png":DATA.components.oil_filter.fixed,
    "assets/component_assets_radiator_broken.webp":DATA.components.radiator.broken,"assets/component_assets_radiator_fixed.webp":DATA.components.radiator.fixed,
    "assets/component_assets_wheel_broken.png":DATA.components.wheel.broken,"assets/component_assets_wheel_fixed.png":DATA.components.wheel.fixed,
    "assets/component_assets_gearbox_broken.webp":DATA.components.gearbox.broken,"assets/component_assets_gearbox_fixed.png":DATA.components.gearbox.fixed,
    "assets/garage_directory_assets_home_button.webp":DATA.assets.homeButton,"assets/garage_directory_assets_repaired_stamp.webp":DATA.assets.repairStamp,
    "assets/menu_buttons_restoration_route_button_issues_true_alpha.webp":DATA.assets.menuButtons?.issues,"assets/menu_buttons_restoration_route_button_profile_true_alpha.webp":DATA.assets.menuButtons?.profile,
    "assets/menu_buttons_restoration_route_button_leaderboard_true_alpha.webp":DATA.assets.menuButtons?.leaderboard,"assets/menu_buttons_restoration_route_button_log_out_true_alpha.webp":DATA.assets.menuButtons?.logout
  };
  return map[src]||src;
}

function setScales(){const w=innerWidth,h=innerHeight,bw=390,bh=844,s=Math.min(w/bw,h/bh);document.documentElement.style.setProperty("--homeScale",s);document.documentElement.style.setProperty("--popupScale",s*.96);document.documentElement.style.setProperty("--menuScale",s*.92);document.documentElement.style.setProperty("--scannerScale",s);}
addEventListener("resize",setScales);
function makeStage(c){const s=document.createElement("div");s.className="stage "+c;return s;}
function imgLayer(stage,l,override){const src=override||stableSrc(l.src,l.name); if(!src)return; const d=document.createElement("div");d.className="layer imageLayer";Object.assign(d.style,{left:l.x+"px",top:l.y+"px",width:l.w+"px",height:l.h+"px",opacity:l.opacity??1,zIndex:l.z??1,transform:`rotate(${l.r||0}deg)`});const i=document.createElement("img");i.src=src;i.alt=l.name||"";d.appendChild(i);stage.appendChild(d);return d;}
function textLayer(stage,l,t){const d=document.createElement("div");d.className="textLayer";Object.assign(d.style,{left:l.x+"px",top:l.y+"px",width:l.w+"px",height:l.h+"px",opacity:l.opacity??1,zIndex:l.z??10,fontSize:(l.fontSize||12)+"px",color:l.color||"#0a3156",transform:`rotate(${l.r||0}deg)`});d.textContent=t||"";stage.appendChild(d);}
function hit(stage,x,y,w,h,fn,title=""){const b=document.createElement("button");b.className="hit";Object.assign(b.style,{left:x+"px",top:y+"px",width:w+"px",height:h+"px"});b.title=title;b.onclick=fn;stage.appendChild(b);}
function requireLogin(){ if(!currentUser){openAuthPanel("login");return false;} if(!state.username||!state.termsAccepted){openAuthPanel("complete");return false;} return true; }

function renderHome(){
  setScales(); overlayRoot.innerHTML=""; scannerRoot.innerHTML=""; scannerRoot.style.display="none"; stopScanner(); homeRoot.innerHTML="";
  const st=makeStage("homeStage");
  DATA.layout.home.layers.forEach(l=>{
    if(l.type!=="image")return; const n=l.name.toLowerCase(); let key=null,id=null,src=stableSrc(l.src,l.name);
    if(n.includes("engine_damaged")){key="engine";id="piston-club"} else if(n.includes("exhaust")){key="exhaust";id="long-itch-diner"} else if(n.includes("fuel tank")){key="fuel_tank";id="pats-baps"} else if(n.includes("headlight")){key="headlight";id="mr-watsons"} else if(n.includes("oil filter")){key="oil_filter";id="oily-rag"} else if(n.includes("radiator")){key="radiator";id="the-man-cave"} else if(n.includes("wheel")){key="wheel";id="seven-mile"} else if(n.includes("gearbox")){key="gearbox";id="gilks-garage"} else if(n.includes("horn")) src=state.hornBroken?DATA.components.horn.broken:DATA.components.horn.fixed;
    if(key){src=state.repaired[id]?DATA.components[key].fixed:DATA.components[key].broken;imgLayer(st,l,src);hit(st,l.x,l.y,l.w,l.h,()=>{if(requireLogin())openVenue(id)},id);return;}
    imgLayer(st,l,src);
    if(n.includes("garage directory"))hit(st,l.x,l.y,l.w,l.h,()=>{if(requireLogin())openDirectory()},"Garage Directory");
    if(n.includes("wall map"))hit(st,l.x,l.y,l.w,l.h,()=>{if(requireLogin())openMap()},"Map");
    if(n.includes("scanner tool"))hit(st,l.x,l.y,l.w,l.h,()=>{if(requireLogin())openScanner()},"Scanner");
    if(n.includes("banter box"))hit(st,l.x,l.y,l.w,l.h,()=>{if(requireLogin())openBanter()},"Banter");
    if(n.includes("horn"))hit(st,l.x,l.y,l.w,l.h,()=>{if(requireLogin())honkHorn()},"Horn");
  });
  hit(st,82,58,230,70,()=>{if(requireLogin())openMenu()},"Menu");
  homeRoot.appendChild(st);
}
function popupStage(cls="popupStage"){overlayRoot.innerHTML="";const sh=document.createElement("div");sh.className="popupShell";const st=makeStage(cls);sh.appendChild(st);overlayRoot.appendChild(sh);return st;}
function closePopup(){overlayRoot.innerHTML="";}
function openMenu(){const st=popupStage("menuStage");DATA.layout.menu.layers.forEach(l=>{if(l.type==="image")imgLayer(st,l)});let taps=0;const x=document.createElement("button");x.className="closeX";x.textContent="×";x.onclick=()=>taps>=5?openAdmin():closePopup();st.appendChild(x);hit(st,82,58,230,70,()=>{taps++;setTimeout(()=>taps=0,1800)},"Admin tap");DATA.layout.menu.layers.filter(l=>l.type==="image"&&!l.name.toLowerCase().includes("menu ui")).forEach(l=>{const n=l.name.toLowerCase();if(n.includes("profile"))hit(st,l.x,l.y,l.w,l.h,openProfile,"Profile");else if(n.includes("leaderboard"))hit(st,l.x,l.y,l.w,l.h,openLeaderboard,"Leaderboard");else if(n.includes("issues"))hit(st,l.x,l.y,l.w,l.h,openIssues,"Issues");else if(n.includes("log out"))hit(st,l.x,l.y,l.w,l.h,openLogout,"Logout");});}
function bookHome(st){const r=DATA.layout.directory.layers.find(l=>l.name.toLowerCase().includes("home button")); if(r){imgLayer(st,r,DATA.assets.homeButton);hit(st,r.x,r.y,r.w,r.h,closePopup,"Home");}}
function tabs(st){const ts=DATA.layout.directory.layers.filter(l=>l.name.toLowerCase().includes("tab button")||l.name.toLowerCase().includes("man cave")).sort((a,b)=>a.y-b.y),ids=["directory",...DATA.venues.map(v=>v.id)];ts.forEach((l,i)=>hit(st,l.x-4,l.y-2,Math.max(l.w+10,34),Math.max(l.h+6,54),()=>ids[i]==="directory"?openDirectory():openVenue(ids[i]),ids[i]));}
function openDirectory(){const st=popupStage(),bg=DATA.layout.directory.layers.find(l=>l.name.toLowerCase().includes("garage directory ui"))||DATA.layout.directory.layers[0];imgLayer(st,bg,DATA.assets.directory);drawDirectory(st);bookHome(st);tabs(st);}
function drawDirectory(st){const txt=DATA.layout.directory.layers.filter(l=>l.type==="text"), names=txt.filter(l=>l.x>=50&&l.x<=60&&l.fontSize===28).sort((a,b)=>a.y-b.y).slice(0,8), parts=txt.filter(l=>l.x>=160&&l.x<=180&&l.fontSize===20).sort((a,b)=>a.y-b.y).slice(0,16), desc=txt.filter(l=>l.x>=230&&l.x<=245&&l.fontSize===12).sort((a,b)=>a.y-b.y).slice(0,24);DATA.venues.forEach((v,i)=>{if(names[i])textLayer(st,names[i],shortName(v.name));wrap(v.component.toUpperCase(),10,2).forEach((t,j)=>parts[i*2+j]&&textLayer(st,parts[i*2+j],t));wrap(v.specialist,23,3).forEach((t,j)=>desc[i*3+j]&&textLayer(st,desc[i*3+j],t));});const comps=DATA.layout.directory.layers.filter(l=>l.type==="image"&&(l.name.toLowerCase().includes("fixed")||l.name.toLowerCase().includes("engine_repaired"))).sort((a,b)=>a.y-b.y).slice(0,8);DATA.venues.forEach((v,i)=>comps[i]&&imgLayer(st,comps[i],DATA.components[v.key].fixed));[287,335,383,431,479,527,575,623].forEach((y,i)=>hit(st,34,y,302,43,()=>openVenue(DATA.venues[i].id),DATA.venues[i].name));}
function shortName(n){return n.replace("The Piston Club","PISTON\nCLUB").replace("Oily Rag","OILY\nRAG").replace("Seven Mile","SEVEN\nMILE").replace("Mr. Watson’s","MR.\nWATSON’S").replace("Gilks’ Garage","GILKS’\nGARAGE").replace("The Long Itch Diner","LONG ITCH\nDINER").replace("Pat’s Baps","PAT’S\nBAPS").replace("The Man Cave","MAN\nCAVE");}
function wrap(t,max,lines){const words=String(t).split(/\s+/),out=[];let line="";words.forEach(w=>{const test=line?line+" "+w:w;if(test.length>max&&line){out.push(line);line=w}else line=test});if(line)out.push(line);while(out.length<lines)out.push("");return out.slice(0,lines);}
function openVenue(id){const v=venueById(id);if(!v)return;const st=popupStage(),bg=DATA.layout.venueTemplate.layers.find(l=>l.z===0)||{x:0,y:0,w:390,h:844,r:0,opacity:1,z:0};imgLayer(st,bg,DATA.assets[v.page]);drawVenue(st,v);bookHome(st);tabs(st);}
function drawVenue(st,v){const tl=DATA.layout.venueTemplate.layers.filter(l=>l.type==="text"), img=DATA.layout.venueTemplate.layers.find(l=>l.type==="image"&&l.name.toLowerCase().includes("exhaust broken"))||{x:41,y:337,w:121,h:97,r:0,opacity:1,z:3}, stamp=DATA.layout.venueTemplate.layers.find(l=>l.name.toLowerCase().includes("repaired stamp"))||{x:221,y:239,w:152,h:91,r:0,opacity:1,z:1};const title=tl.find(l=>l.name==="Venue Name"); if(title)textLayer(st,title,v.name); imgLayer(st,img,state.repaired[v.id]?DATA.components[v.key].fixed:DATA.components[v.key].broken); if(state.repaired[v.id])imgLayer(st,stamp,DATA.assets.repairStamp); const exact=n=>tl.filter(l=>l.name.startsWith(n)).sort((a,b)=>a.y-b.y); exact("Summary Text Location").slice(0,4).forEach((l,i)=>textLayer(st,l,v.summary[i]||"")); exact("Address Text Location").slice(0,3).forEach((l,i)=>textLayer(st,l,v.address[i]||"")); exact("Food Hours").slice(0,7).forEach((l,i)=>textLayer(st,l,v.food[i]||"")); exact("Opening Hours").slice(0,7).forEach((l,i)=>textLayer(st,l,v.opening[i]||"")); exact("Notes Line").slice(0,3).forEach((l,i)=>textLayer(st,l,v.notes[i]||"")); const website=tl.find(l=>l.name==="Website Address"),phone=tl.find(l=>l.name==="Phone Number"),email=tl.find(l=>l.name==="Email Address"); if(website)textLayer(st,website,v.website||"To confirm"); if(phone)textLayer(st,phone,v.phone||"To confirm"); if(email)textLayer(st,email,v.email||"To confirm"); hit(st,stamp.x,stamp.y,stamp.w,stamp.h,()=>repairVenue(v.id,"manual_page_tap"),"Repair");}
function openMap(){const st=popupStage();imgLayer(st,{x:121,y:157,w:100,h:173,r:0,opacity:1,z:1,name:"Wall Map"},DATA.assets.wallMap);hit(st,121,157,100,173,closePopup,"Close");}
function openBanter(){card(`<h2>Banter Box</h2><p>${["That part has definitely seen things.","This is either restoration or archaeology.","Give it a scan. Worst case, it only judges you silently.","Do it for the banter."][Math.floor(Math.random()*4)]}</p><button data-close>Close</button>`);}
function badUsername(name){const low=name.toLowerCase();if(!new RegExp(DATA.usernameRules.pattern).test(name))return"Username must be 3–20 characters using letters, numbers, underscore or hyphen.";if((DATA.usernameRules.blocked||[]).some(w=>low.includes(w)))return"That username is not allowed.";return"";}
function openAuthPanel(mode="login",msg=""){closeAuthPanel();const d=document.createElement("div");d.id="authPanel";d.className="authPanel";d.innerHTML=`<div class="authCard"><h2>${mode==="register"?"Create Account":mode==="complete"?"Complete Account":"Sign In"}</h2>${msg?`<p class="authError">${esc(msg)}</p>`:""}<div id="authFields"></div></div>`;document.body.appendChild(d);const f=d.querySelector("#authFields");if(mode==="register"||mode==="complete"){f.innerHTML=`<input id="authEmail" type="email" placeholder="Email address" value="${esc(state.email||"")}"><input id="authPassword" type="password" placeholder="Password"><input id="authUsername" placeholder="Public username" value="${esc(state.username||"")}"><label class="check"><input id="authTerms" type="checkbox" ${state.termsAccepted?"checked":""}> I agree to The Restoration Route storing my email, username and route progress for prize draw and app operation purposes. Organiser: ${esc(DATA.terms.organiser)}. Contact: ${esc(DATA.terms.contactEmail)}.</label><button id="createAccount">${mode==="complete"?"Save Account Details":"Create Account"}</button><button id="switchLogin">Already have an account?</button>`;document.getElementById("createAccount").onclick=()=>handleRegister(mode==="complete");document.getElementById("switchLogin").onclick=()=>openAuthPanel("login");}else{f.innerHTML=`<input id="authEmail" type="email" placeholder="Email address" value="${esc(state.email||"")}"><input id="authPassword" type="password" placeholder="Password"><button id="loginButton">Sign In</button><button id="switchRegister">Create Account</button>`;document.getElementById("loginButton").onclick=handleLogin;document.getElementById("switchRegister").onclick=()=>openAuthPanel("register");}}
function closeAuthPanel(){document.querySelectorAll("#authPanel").forEach(x=>x.remove())}
async function reserveUsername(username,uid){const u=username.toLowerCase(),ref=fb.doc(db,"usernames",u),snap=await fb.getDoc(ref);if(snap.exists()&&snap.data().uid!==uid)throw new Error("That username is already taken.");await fb.setDoc(ref,{uid,username,usernameLower:u,updatedAt:fb.serverTimestamp()},{merge:true});}
async function handleRegister(updateOnly=false){const email=document.getElementById("authEmail").value.trim(),pass=document.getElementById("authPassword").value,user=document.getElementById("authUsername").value.trim(),terms=document.getElementById("authTerms").checked,bad=badUsername(user);if(bad)return openAuthPanel(updateOnly?"complete":"register",bad);if(!terms)return openAuthPanel(updateOnly?"complete":"register","You need to accept the terms to use the app.");try{if(updateOnly&&currentUser){await reserveUsername(user,currentUser.uid);state.username=user;state.termsAccepted=true;await fb.updateProfile(currentUser,{displayName:user}).catch(()=>{});await saveCloud();closeAuthPanel();return}const cred=await fb.createUserWithEmailAndPassword(auth,email,pass);currentUser=cred.user;await reserveUsername(user,cred.user.uid);await fb.updateProfile(cred.user,{displayName:user}).catch(()=>{});await fb.sendEmailVerification(cred.user).catch(()=>{});state={...defaultState(),uid:cred.user.uid,email,username:user,termsAccepted:true,emailVerified:false};await saveCloud();closeAuthPanel();openProfile("Verification email sent. Progress saves now. Prize entries become eligible once your email is verified.");}catch(e){openAuthPanel(updateOnly?"complete":"register",e.message||"Could not create account.");}}
async function handleLogin(){try{await fb.signInWithEmailAndPassword(auth,document.getElementById("authEmail").value.trim(),document.getElementById("authPassword").value)}catch(e){openAuthPanel("login",e.message||"Could not sign in.")}}
function openProfile(msg=""){card(`<h2>Profile</h2>${msg?`<p>${esc(msg)}</p>`:""}<p>Email: ${esc(state.email||"")}</p><p>Username: ${esc(state.username||"")}</p><p>Email verified: ${state.emailVerified?"Yes":"No"}</p>${!state.emailVerified?'<button id="resendVerification">Resend Verification Email</button><button id="refreshVerification">I Verified It</button>':""}<button data-close>Close</button>`,()=>{const r=document.getElementById("resendVerification");if(r)r.onclick=()=>currentUser&&fb.sendEmailVerification(currentUser);const rf=document.getElementById("refreshVerification");if(rf)rf.onclick=async()=>{await fb.reload(currentUser);state.emailVerified=!!auth.currentUser.emailVerified;await saveCloud();closeCard();openProfile();}});}
function openLeaderboard(){card(`<h2>Vehicles Restored</h2><p>Completed vehicles: <strong>${state.completedVehicles}</strong></p><p>Prize entries: <strong>${state.prizeEntries}</strong></p><p>Pending entries until email verification: <strong>${state.pendingPrizeEntries}</strong></p><p>Total parts restored: <strong>${state.totalPartsRestored}</strong></p><button data-close>Close</button>`);}
function openIssues(){location.href=`mailto:${DATA.terms.contactEmail}?subject=The%20Restoration%20Route%20Issue&body=${encodeURIComponent("User: "+(state.username||"")+"\nEmail: "+(state.email||"")+"\n\nIssue:\n")}`;}
function openLogout(){card(`<h2>Log Out</h2><p>Progress is saved to your account if online sync has completed.</p><button id="logoutConfirm">Log Out</button><button data-close>Cancel</button>`,()=>{document.getElementById("logoutConfirm").onclick=async()=>{await fb.signOut(auth);closeCard();openAuthPanel("login")}});}
function openAdmin(){card(`<h2>Garage Admin</h2><input id="adminCode" placeholder="Code"><button id="adminUnlock">Unlock</button><button data-close>Close</button>`,()=>{document.getElementById("adminUnlock").onclick=()=>{if(document.getElementById("adminCode").value!==ADMIN_CODE)return;closeCard();card(`<h2>Chip’s Big Red Button</h2><button id="repairAll">Repair All Components</button><button id="completeVehicle">Complete Vehicle</button><button id="resetVehicle">Reset Current Vehicle</button><button data-close>Close</button>`,()=>{document.getElementById("repairAll").onclick=async()=>{DATA.venues.forEach(v=>state.repaired[v.id]=true);await saveCloud();closeCard();renderHome()};document.getElementById("completeVehicle").onclick=async()=>{await completeVehicle("admin_complete");closeCard();renderHome()};document.getElementById("resetVehicle").onclick=async()=>{state.repaired=baseRepaired();state.hornBroken=false;await saveCloud();closeCard();renderHome()};})}});}
function card(html,after){const d=document.createElement("div");d.className="popCard";d.innerHTML=html;overlayRoot.appendChild(d);d.querySelectorAll("[data-close]").forEach(b=>b.onclick=closeCard);if(after)after();}
function closeCard(){overlayRoot.querySelectorAll(".popCard").forEach(c=>c.remove())}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
async function honkHorn(){const now=Date.now();hornTapTimes=hornTapTimes.filter(t=>now-t<4000);hornTapTimes.push(now);if(hornTapTimes.length>=5&&!state.hornBroken){state.hornBroken=true;state.hornBrokenCount=(state.hornBrokenCount||0)+1;await saveCloud();renderHome();}}
async function repairVenue(id,source="scan"){if(!requireLogin())return;const v=venueById(id);if(!v)return;const was=state.repaired[id];if(!was){state.repaired[id]=true;state.totalPartsRestored=(state.totalPartsRestored||0)+1}await scanEvent(id,source,was);await saveCloud();if(allRepaired())await completeVehicle("auto_complete");renderHome();openVenue(id);}
async function scanEvent(id,source,dup){if(!firebaseReady||!currentUser)return;await fb.addDoc(fb.collection(db,"scanEvents"),{uid:currentUser.uid,email:currentUser.email||state.email||"",username:state.username||"",venueId:id,source,duplicate:dup,vehicleNumber:state.currentVehicle||1,accepted:true,createdAt:fb.serverTimestamp()}).catch(()=>{});}
async function completeVehicle(type){if(!allRepaired())return;state.completedVehicles++;if(state.emailVerified||auth?.currentUser?.emailVerified)state.prizeEntries++;else state.pendingPrizeEntries++;state.currentVehicle++;state.repaired=baseRepaired();state.hornBroken=false;state.hornRestoredCount=(state.hornRestoredCount||0)+1;state.log.push({type,at:new Date().toISOString()});await saveCloud();}
function openScanner(){if(!requireLogin())return;closePopup();scannerRoot.innerHTML="";scannerRoot.style.display="block";const st=makeStage("scannerStage");DATA.layout.scanner.layers.forEach(l=>{if(l.type==="image")imgLayer(st,l,l.name.toLowerCase().includes("scanner home")?DATA.assets.homeButton:undefined)});const vp=document.createElement("div");vp.className="videoBox";Object.assign(vp.style,{left:"64px",top:"119px",width:"262px",height:"282px"});const video=document.createElement("video");video.setAttribute("playsinline","");video.muted=true;vp.appendChild(video);st.appendChild(vp);const h=DATA.layout.scanner.layers.find(l=>l.name.toLowerCase().includes("scanner home"));h?hit(st,h.x,h.y,h.w,h.h,closeScanner,"Home"):hit(st,263,505,103,52,closeScanner,"Home");scannerRoot.appendChild(st);startScanner(video);}
function closeScanner(){stopScanner();scannerRoot.style.display="none";scannerRoot.innerHTML="";renderHome()}
async function startScanner(video){try{activeScannerStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false});video.srcObject=activeScannerStream;await video.play();if(!("BarcodeDetector"in window))return;const det=new BarcodeDetector({formats:["qr_code"]}),canvas=document.createElement("canvas"),ctx=canvas.getContext("2d");activeScannerTimer=setInterval(async()=>{if(video.readyState<2)return;canvas.width=video.videoWidth;canvas.height=video.videoHeight;ctx.drawImage(video,0,0);try{const codes=await det.detect(canvas);if(codes&&codes[0]){const v=await matchToken(codes[0].rawValue);if(v){stopScanner();scannerRoot.style.display="none";await repairVenue(v.id,"qr_scan")}}}catch(e){}},750)}catch(e){}}
function stopScanner(){if(activeScannerTimer)clearInterval(activeScannerTimer);activeScannerTimer=null;if(activeScannerStream){activeScannerStream.getTracks().forEach(t=>t.stop());activeScannerStream=null}}
async function matchToken(raw){let s=String(raw||""),token=s;try{const u=new URL(s);token=u.searchParams.get("scan")||u.searchParams.get("code")||s}catch{}const id=DATA.scanTokenHashes[await sha256(token.trim())];return id?venueById(id):null}
async function handleUrlScan(){const p=new URLSearchParams(location.search),code=p.get("scan")||p.get("venue")||p.get("code");if(!code)return;history.replaceState(null,"",location.pathname);const v=await matchToken(code);if(v){const wait=setInterval(async()=>{if(currentUser&&state.username&&state.termsAccepted){clearInterval(wait);await repairVenue(v.id,"qr_deeplink")}},300)}}
window.addEventListener("load",async()=>{setScales();renderHome();await initFirebase();await handleUrlScan()});
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js").catch(()=>{}));
