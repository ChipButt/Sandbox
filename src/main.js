const TILE=48;
const canvas=document.getElementById('game');
const ctx=canvas.getContext('2d');
ctx.imageSmoothingEnabled=false;
const prompt=document.getElementById('prompt');

const tileNames=['water_0','water_1','water_2','water_3','shallow_0','shallow_1','shallow_2','shallow_3','dry_sand','wet_sand','grass','tall_grass_0','tall_grass_1','tall_grass_2','dirt','rock_ground','grass_sand_patch1','grass_sand_patch2','grass_sand_patch3','grass_sand_mottled1','grass_sand_mottled2','grass_sand_mottled3','grass_sand_diag1','grass_sand_diag2','shore_n0','shore_e','shore_w','water_bay_se','water_bay_sw','sand_island','cliff_face','cliff_grass','cliff_sand','cave_large','cave_small','cave_floor','rock_small','rock_big','mossy_rock','flat_rock','pebbles','shells','starfish','driftwood','broken_crate','seaweed','coral','barrel','footprints','crab_holes','sand_mound','palm_sprout','bush','grass_tuft','flowers','reeds_0','reeds_1','reeds_2','palm_0','palm_1','palm_2','palm_3','dock_horiz','dock_vert','dock_end_s','dock_end_n','dock_square','dock_post','dock_broken','rope','ladder','stone_path','wood_path','path_vert','path_patch','grass_path'];
const img={};
let loaded=0;
for(const n of tileNames){ const im=new Image(); im.src=`assets/tiles/${n}.png`; im.onload=()=>{loaded++; if(loaded===tileNames.length) requestAnimationFrame(loop)}; img[n]=im; }

const W=64,H=44;
const base=Array.from({length:H},()=>Array(W).fill('water_0'));
const blocked=new Set();
const decor=[];
const interact=[];
function key(x,y){return `${x},${y}`}
function ellipse(x,y,cx,cy,rx,ry){return ((x-cx)*(x-cx))/(rx*rx)+((y-cy)*(y-cy))/(ry*ry)<=1}
function setBlock(x,y,v=true){ if(v) blocked.add(key(x,y)); else blocked.delete(key(x,y)); }

for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const land=ellipse(x,y,32,23,25,16) || ellipse(x,y,42,18,10,7) || ellipse(x,y,18,26,9,7);
  const inner=ellipse(x,y,32,23,20,12) || ellipse(x,y,42,18,7,5);
  const core=ellipse(x,y,32,23,14,8);
  if(!land){base[y][x]=['water_0','water_1','water_2','water_3'][(x+y)%4]; setBlock(x,y); continue;}
  if(!inner) base[y][x]=((x+y)%3===0?'wet_sand':'dry_sand');
  else if(!core) base[y][x]=['grass_sand_patch1','grass_sand_patch2','grass_sand_mottled1','grass_sand_mottled2'][(x+y)%4];
  else base[y][x]=['grass','grass','grass_sand_mottled3'][(x*3+y)%3];
}
// improve shoreline ring with supplied shoreline/wet tiles
for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
 if(!blocked.has(key(x,y))){
   const nearWater=[key(x+1,y),key(x-1,y),key(x,y+1),key(x,y-1)].some(k=>blocked.has(k));
   if(nearWater) base[y][x]=['shore_n0','shore_e','shore_w','wet_sand'][(x+y)%4];
 }
}
// dock from west into island
for(let x=0;x<=12;x++){ const y=25; base[y][x]=x<6?'dock_horiz':(x===12?'dock_end_s':'dock_horiz'); setBlock(x,y,false); }
decor.push({x:3,y:24,t:'dock_post'},{x:6,y:24,t:'dock_post'},{x:9,y:24,t:'rope'},{x:11,y:24,t:'dock_broken'},{x:4,y:26,t:'ladder'});
interact.push({x:5,y:25,text:'The dock is the perfect entry point for a new quest, ship, shop, or travel system.'});
// paths
for(let x=12;x<=31;x++) base[25][x]=(x%2?'path_vert':'grass_path');
for(let y=16;y<=25;y++) base[y][31]=(y%2?'path_vert':'grass_path');
for(let x=31;x<=46;x++) base[16][x]=(x%2?'path_vert':'grass_path');
// cliff/cave zone northeast
for(let y=9;y<=17;y++)for(let x=42;x<=52;x++){ if(ellipse(x,y,47,13,7,5)){base[y][x]='cliff_grass'; setBlock(x,y);} }
for(let x=43;x<=51;x++){ base[17][x]='cliff_face'; setBlock(x,17); }
base[16][46]='cave_floor'; decor.push({x:46,y:15,t:'cave_large',wide:2}); setBlock(46,15); setBlock(47,15); interact.push({x:46,y:16,text:'Cave entrance. Drop a dungeon folder here and load it from this hook.'});
// clear hub
for(let y=21;y<=27;y++)for(let x=27;x<=36;x++) if(ellipse(x,y,31,24,6,4)) base[y][x]='path_patch';
interact.push({x:31,y:24,text:'Central clearing. Ideal for Nassau noticeboard, tavern entrance, NPC party start, or tutorial.'});
// decoration helper
function obj(x,y,t,block=true,scale=1){decor.push({x,y,t,scale}); if(block) setBlock(x,y);}
[[15,21,'palm_0'],[20,17,'palm_1'],[25,33,'palm_2'],[12,30,'palm_3'],[38,29,'palm_1'],[49,22,'palm_0']].forEach(([x,y,t])=>{decor.push({x,y,t,scale:2,anchorY:1}); setBlock(x,y); setBlock(x,y+1);});
[[18,19,'rock_big'],[21,31,'mossy_rock'],[44,24,'rock_small'],[50,28,'flat_rock'],[13,19,'barrel'],[16,28,'broken_crate'],[21,24,'flowers'],[35,20,'bush'],[39,17,'reeds_0'],[29,30,'reeds_1'],[28,18,'grass_tuft'],[36,31,'seaweed'],[11,23,'shells'],[14,27,'starfish'],[23,16,'driftwood'],[34,16,'footprints'],[17,33,'crab_holes'],[41,15,'pebbles'],[51,17,'vines']].forEach(([x,y,t])=>obj(x,y,t,t.includes('rock')||t==='barrel'||t==='broken_crate'||t==='bush'));

const player={x:31*TILE,y:25*TILE,w:28,h:36,speed:170,dir:'down',walk:0};
const keys={};
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true; if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(e.key.toLowerCase())) e.preventDefault(); if(e.key==='Enter'||e.key.toLowerCase()==='e') doInteract();});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
function blockedAt(px,py){const tx=Math.floor(px/TILE), ty=Math.floor(py/TILE); return tx<0||ty<0||tx>=W||ty>=H||blocked.has(key(tx,ty));}
function canMove(nx,ny){const l=nx-player.w/2+5,r=nx+player.w/2-5,t=ny-player.h/2+12,b=ny+player.h/2-3;return !blockedAt(l,t)&&!blockedAt(r,t)&&!blockedAt(l,b)&&!blockedAt(r,b)}
function doInteract(){const px=Math.floor(player.x/TILE),py=Math.floor(player.y/TILE);let best=null,bd=999;for(const it of interact){const d=Math.abs(it.x-px)+Math.abs(it.y-py);if(d<bd&&d<3){best=it;bd=d}}if(best) showPrompt(best.text,2500)}
function showPrompt(text,ms=1200){prompt.textContent=text;prompt.style.display='block';clearTimeout(showPrompt.t);showPrompt.t=setTimeout(()=>prompt.style.display='none',ms)}
let last=performance.now();
function loop(now){const dt=Math.min(0.05,(now-last)/1000);last=now;update(dt,now);draw(now);requestAnimationFrame(loop)}
function update(dt,now){let dx=0,dy=0;if(keys.arrowleft||keys.a)dx--;if(keys.arrowright||keys.d)dx++;if(keys.arrowup||keys.w)dy--;if(keys.arrowdown||keys.s)dy++;if(dx&&dy){dx*=0.707;dy*=0.707} if(dx||dy){player.dir=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');player.walk+=dt*10;const nx=player.x+dx*player.speed*dt, ny=player.y+dy*player.speed*dt;if(canMove(nx,player.y))player.x=nx;if(canMove(player.x,ny))player.y=ny}}
function drawPlayer(x,y,frame){ctx.save();ctx.translate(x,y);ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(0,18,18,7,0,0,Math.PI*2);ctx.fill();const bob=Math.sin(frame*.5)*2;ctx.translate(0,bob);ctx.fillStyle='#2a1a11';ctx.fillRect(-9,-15,18,22);ctx.fillStyle='#e0b77a';ctx.fillRect(-8,-30,16,16);ctx.fillStyle='#7b3f1f';ctx.fillRect(-11,-35,22,8);ctx.fillStyle='#1f5e8a';ctx.fillRect(-12,5,9,20);ctx.fillRect(3,5,9,20);ctx.fillStyle='#e0b77a';ctx.fillRect(-18,-12,7,20);ctx.fillRect(11,-12,7,20);if(player.dir==='left'||player.dir==='right'){ctx.fillStyle='#111';ctx.fillRect(player.dir==='right'?5:-8,-24,3,3)}else if(player.dir==='down'){ctx.fillStyle='#111';ctx.fillRect(-5,-24,3,3);ctx.fillRect(4,-24,3,3)}ctx.restore();}
function draw(now){ctx.clearRect(0,0,canvas.width,canvas.height);const camX=Math.max(0,Math.min(W*TILE-canvas.width,player.x-canvas.width/2));const camY=Math.max(0,Math.min(H*TILE-canvas.height,player.y-canvas.height/2));const waterFrame=Math.floor(now/420)%4;const grassFrame=Math.floor(now/520)%3;const palmFrame=Math.floor(now/650)%4;const x0=Math.floor(camX/TILE),y0=Math.floor(camY/TILE),x1=Math.ceil((camX+canvas.width)/TILE),y1=Math.ceil((camY+canvas.height)/TILE);
for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(x<0||y<0||x>=W||y>=H)continue;let t=base[y][x];if(t.startsWith('water_'))t=`water_${waterFrame}`;if(t.startsWith('shallow_'))t=`shallow_${waterFrame}`;if(img[t])ctx.drawImage(img[t],x*TILE-camX,y*TILE-camY,TILE,TILE);}
// animated tall grass overlays on core edges
for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if((x*17+y*11)%23===0 && base[y]?.[x]?.includes('grass')){const t=['tall_grass_0','tall_grass_1','tall_grass_2'][grassFrame];ctx.drawImage(img[t],x*TILE-camX,y*TILE-camY,TILE,TILE)}}
const drawables=[];for(const d of decor)drawables.push(d);drawables.push({player:true,x:player.x/TILE,y:player.y/TILE});drawables.sort((a,b)=>(a.y+(a.anchorY||0))-(b.y+(b.anchorY||0)));
for(const d of drawables){if(d.player){drawPlayer(player.x-camX,player.y-camY,player.walk);continue;}let t=d.t;if(t?.startsWith('palm_'))t=`palm_${palmFrame}`;const im=img[t];if(!im)continue;const scale=d.scale||1,w=TILE*scale,h=TILE*scale;ctx.drawImage(im,d.x*TILE-camX-(scale>1?TILE/2:0),d.y*TILE-camY-(scale>1?TILE:0),w,h)}
// subtle vignette
const g=ctx.createRadialGradient(canvas.width/2,canvas.height/2,100,canvas.width/2,canvas.height/2,700);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(0,0,0,.28)');ctx.fillStyle=g;ctx.fillRect(0,0,canvas.width,canvas.height);
}
