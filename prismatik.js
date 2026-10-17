const $=s=>document.querySelector(s),TAU=Math.PI*2;
const TABS=[["prism","Prisme"],["color","Couleurs"],["laser","Laser"],["holo","Hologramme"],["pola","Polarisation"]];
let cur="prism";
const nav=$("#nav");
TABS.forEach(([id,l])=>{const b=document.createElement("button");b.textContent=l;b.setAttribute("role","tab");b.onclick=()=>show(id);b.dataset.id=id;nav.appendChild(b)});
function show(id){cur=id;document.querySelectorAll("section").forEach(s=>s.classList.toggle("on",s.id==id));nav.querySelectorAll("button").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.id==id)))}
function init(id,W,H){const c=$(id);c.width=W*2;c.height=H*2;const x=c.getContext("2d");return{c,x,W,H}}
function pos(o,e){const r=o.c.getBoundingClientRect();return[(e.clientX-r.left)*o.W/r.width,(e.clientY-r.top)*o.H/r.height]}
function drag(o,hs,R){let a=null;o.c.addEventListener("pointerdown",e=>{const p=pos(o,e);let best=R;a=null;hs.forEach(h=>{const d=Math.hypot(h.x-p[0],h.y-p[1]);if(d<best){best=d;a=h}});if(a)o.c.setPointerCapture(e.pointerId)});
o.c.addEventListener("pointermove",e=>{if(!a)return;const p=pos(o,e);a.x=Math.max(10,Math.min(o.W-10,p[0]));a.y=Math.max(10,Math.min(o.H-10,p[1]))});
const u=()=>a=null;o.c.addEventListener("pointerup",u);o.c.addEventListener("pointercancel",u)}
const clr=o=>{o.x.setTransform(2,0,0,2,0,0);o.x.globalCompositeOperation="source-over";o.x.shadowBlur=0;o.x.globalAlpha=1}

/* 1. Prisme */
const P=init("#c1",600,400),S1={x:70,y:260},C1={x:330,y:200};drag(P,[S1,C1],45);
const HUES=[0,28,55,120,195,240,280];
function refr(d,n,eta){const c=-(d[0]*n[0]+d[1]*n[1]),k=1-eta*eta*(1-c*c);if(k<0)return null;const a=eta*c-Math.sqrt(k);return[eta*d[0]+a*n[0],eta*d[1]+a*n[1]]}
function trace(o,d,N,V,C){const pts=[o];for(let it=0;it<6;it++){let best=null;for(let i=0;i<3;i++){const a=V[i],b=V[(i+1)%3],e=[b[0]-a[0],b[1]-a[1]],den=d[0]*e[1]-d[1]*e[0];if(Math.abs(den)<1e-9)continue;const ao=[a[0]-o[0],a[1]-o[1]],t=(ao[0]*e[1]-ao[1]*e[0])/den,u=(ao[0]*d[1]-ao[1]*d[0])/den;if(t>1e-3&&u>=0&&u<=1&&(!best||t<best.t)){const m=[(a[0]+b[0])/2-C.x,(a[1]+b[1])/2-C.y],l=Math.hypot(m[0],m[1]);best={t,n:[m[0]/l,m[1]/l]}}}
if(!best)break;o=[o[0]+d[0]*best.t,o[1]+d[1]*best.t];pts.push(o);let n=best.n,eta;if(d[0]*n[0]+d[1]*n[1]<0)eta=1/N;else{n=[-n[0],-n[1]];eta=N}
const r=refr(d,n,eta);if(r)d=r;else{const c=-(d[0]*n[0]+d[1]*n[1]);d=[d[0]+2*c*n[0],d[1]+2*c*n[1]]}}
pts.push([o[0]+d[0]*1500,o[1]+d[1]*1500]);return pts}
function drawPrism(){clr(P);const x=P.x;x.clearRect(0,0,600,400);
const rot=$("#rot").value*Math.PI/180,r=95,V=[0,1,2].map(i=>{const a=-Math.PI/2+i*TAU/3+rot;return[C1.x+r*Math.cos(a),C1.y+r*Math.sin(a)]});
let d=[C1.x-S1.x,C1.y-S1.y];const l=Math.hypot(d[0],d[1])||1;d=[d[0]/l,d[1]/l];const o=[S1.x,S1.y];
const w=trace(o,d,1.55,V,C1);x.lineCap="round";x.strokeStyle="#fff";x.lineWidth=3;x.shadowColor="#fff";x.shadowBlur=10;x.beginPath();x.moveTo(o[0],o[1]);x.lineTo(w[1][0],w[1][1]);x.stroke();
x.globalCompositeOperation="lighter";const dp=+$("#disp").value;
HUES.forEach((h,i)=>{const p=trace(o,d,1.5+i*0.016*dp,V,C1),col=`hsl(${h} 100% 55%)`;x.strokeStyle=col;x.shadowColor=col;x.shadowBlur=8;x.lineWidth=2.4;x.globalAlpha=.85;x.beginPath();x.moveTo(p[1][0],p[1][1]);for(let k=2;k<p.length;k++)x.lineTo(p[k][0],p[k][1]);x.stroke()});
clr(P);x.beginPath();V.forEach((v,i)=>i?x.lineTo(v[0],v[1]):x.moveTo(v[0],v[1]));x.closePath();x.fillStyle="rgba(170,210,255,.12)";x.fill();x.strokeStyle="rgba(255,255,255,.55)";x.lineWidth=1.5;x.stroke();
x.fillStyle="#fff";x.beginPath();x.arc(S1.x,S1.y,9,0,TAU);x.fill();x.strokeStyle="rgba(255,255,255,.4)";x.beginPath();x.arc(C1.x,C1.y,6,0,TAU);x.stroke()}

/* 2. Couleurs */
const K=init("#c2",600,400);let add=true;
const DA=[{x:240,y:160,c:"#f00"},{x:360,y:160,c:"#0f0"},{x:300,y:250,c:"#00f"}],DS=[{x:240,y:160,c:"#0ff"},{x:360,y:160,c:"#f0f"},{x:300,y:250,c:"#ff0"}];
const kd=[];drag(K,{forEach:f=>(add?DA:DS).forEach(f)},90);
function setMode(a){add=a;$("#m1").classList.toggle("sel",a);$("#m2").classList.toggle("sel",!a);$("#cn").textContent=a?"Rouge + vert + bleu donnent du blanc : c’est ainsi que fonctionne un écran. Rouge + vert donnent du jaune.":"Cyan + magenta + jaune donnent un noir sale : c’est ainsi que fonctionne l’impression. Cyan + jaune donnent du vert."}
$("#m1").onclick=()=>setMode(true);$("#m2").onclick=()=>setMode(false);setMode(true);
function drawColor(){clr(K);const x=K.x;x.fillStyle=add?"#000":"#f4f1e8";x.fillRect(0,0,600,400);x.globalCompositeOperation=add?"lighter":"multiply";(add?DA:DS).forEach(d=>{x.fillStyle=d.c;x.beginPath();x.arc(d.x,d.y,90,0,TAU);x.fill()})}

/* 3. Laser */
const LV=[["........","........","S.../...","........","........","....T..."],
["........","S../....",".....#..",".....#..","././..T.","........"],
["......T.","........",".\\.\\..\\.",".....#..",".....#..","S..\\...."]];
const L=init("#c3",600,450),CS=75;let done=[],lvl=0,g,moves=0,score=0,won=false;
function renderLv(){$("#lvl").innerHTML=LV.map((_,i)=>`<li class="${i==lvl?"cur":""}"><i>${i+1}</i><span>Niveau ${i+1}</span><em>${done[i]?"Réussi":i==lvl?"En cours":"À jouer"}</em></li>`).join("")}
function load(n){lvl=n;g=LV[n].map(r=>r.split(""));moves=0;won=false;$("#nx").hidden=true;$("#lv").textContent="Niveau "+(n+1)+"/"+LV.length;$("#sc").textContent=score;$("#msg").textContent="";renderLv()}
function beam(){let sy=g.findIndex(r=>r[0]=="S"),x=0,y=sy,dx=1,dy=0,p=[[0,sy]],hit=false;for(let i=0;i<200;i++){x+=dx;y+=dy;if(x<0||y<0||x>=8||y>=6){p.push([x,y]);break}const c=g[y][x];p.push([x,y]);if(c=="#")break;if(c=="T"){hit=true;break}if(c=="/"){[dx,dy]=[-dy,-dx]}else if(c=="\\"){[dx,dy]=[dy,dx]}}return{p,hit}}
L.c.addEventListener("pointerdown",e=>{if(won)return;const q=pos(L,e),cx=Math.floor(q[0]/CS),cy=Math.floor(q[1]/CS);if(g[cy]&&(g[cy][cx]=="/"||g[cy][cx]=="\\")){g[cy][cx]=g[cy][cx]=="/"?"\\":"/";moves++}});
$("#rs").onclick=()=>load(lvl);$("#nx").onclick=()=>load((lvl+1)%LV.length);
function drawLaser(){clr(L);const x=L.x;x.fillStyle="#05040c";x.fillRect(0,0,600,450);x.strokeStyle="#1d1a3a";x.lineWidth=1;for(let i=0;i<=8;i++){x.beginPath();x.moveTo(i*CS,0);x.lineTo(i*CS,450);x.stroke()}for(let j=0;j<=6;j++){x.beginPath();x.moveTo(0,j*CS);x.lineTo(600,j*CS);x.stroke()}
const b=beam(),ct=p=>[p[0]*CS+CS/2,p[1]*CS+CS/2];
if(b.hit&&!won){won=true;done[lvl]=true;renderLv();score+=Math.max(10,100-5*moves);$("#sc").textContent=score;$("#msg").textContent="Cible atteinte ! Niveau réussi.";$("#nx").hidden=false}
x.strokeStyle="#ff3b5c";x.shadowColor="#ff3b5c";x.shadowBlur=14;x.lineWidth=3;x.lineCap="round";x.beginPath();b.p.forEach((p,i)=>{const q=ct(p);i?x.lineTo(q[0],q[1]):x.moveTo(q[0],q[1])});x.stroke();x.shadowBlur=0;
g.forEach((row,j)=>row.forEach((c,i)=>{const px=i*CS,py=j*CS;if(c=="#"){x.fillStyle="#2a2750";x.fillRect(px+4,py+4,CS-8,CS-8)}
else if(c=="S"){x.fillStyle="#ff3b5c";x.beginPath();x.arc(px+CS/2,py+CS/2,14,0,TAU);x.fill()}
else if(c=="T"){x.strokeStyle=won?"#7dffa8":"#fff";x.lineWidth=3;for(const r of[8,18,28]){x.beginPath();x.arc(px+CS/2,py+CS/2,r,0,TAU);x.stroke()}}
else if(c=="/"||c=="\\"){x.strokeStyle="#cfe9ff";x.lineWidth=7;x.beginPath();const m=24;if(c=="/"){x.moveTo(px+CS/2-m,py+CS/2+m);x.lineTo(px+CS/2+m,py+CS/2-m)}else{x.moveTo(px+CS/2-m,py+CS/2-m);x.lineTo(px+CS/2+m,py+CS/2+m)}x.stroke()}}))}
score=0;load(0);

/* 4. Hologramme */
const H=init("#c4",600,600);let shape=0;
$("#h1").onclick=()=>{shape=0;$("#h1").classList.add("sel");$("#h2").classList.remove("sel")};$("#h2").onclick=()=>{shape=1;$("#h2").classList.add("sel");$("#h1").classList.remove("sel")};
function drawShape(x,t,s){if(shape==0){const g=x.createRadialGradient(-s*.3,-s*.3,s*.1,0,0,s);g.addColorStop(0,"#9fe3ff");g.addColorStop(1,"#1b4fd8");x.fillStyle=g;x.beginPath();x.arc(0,0,s*.6,0,TAU);x.fill();x.strokeStyle="#ffd27a";x.lineWidth=3;x.beginPath();x.ellipse(0,0,s*.95,s*.25,-.4,0,TAU);x.stroke();const a=t/700;x.fillStyle="#fff";x.beginPath();x.arc(Math.cos(a)*s*.95*Math.cos(-.4)-Math.sin(a)*s*.25*Math.sin(-.4),Math.cos(a)*s*.95*Math.sin(-.4)+Math.sin(a)*s*.25*Math.cos(-.4),s*.07,0,TAU);x.fill()}
else{const V=[];for(let i=0;i<8;i++)V.push([i&1?1:-1,i&2?1:-1,i&4?1:-1]);const a=t/900,b=t/1300,P=V.map(v=>{let[X,Y,Z]=v;let y=Y*Math.cos(a)-Z*Math.sin(a),z=Y*Math.sin(a)+Z*Math.cos(a);let x2=X*Math.cos(b)+z*Math.sin(b);return[x2*s*.55,y*s*.55]});x.strokeStyle="#7df9ff";x.lineWidth=3;x.shadowColor="#7df9ff";x.shadowBlur=10;x.beginPath();for(let i=0;i<8;i++)for(const j of[1,2,4])if(!(i&j)){x.moveTo(P[i][0],P[i][1]);x.lineTo(P[i|j][0],P[i|j][1])}x.stroke()}}
function drawHolo(t){clr(H);const x=H.x;x.fillStyle="#000";x.fillRect(0,0,600,600);const s=+$("#hs").value;for(let k=0;k<4;k++){x.save();x.translate(300,300);x.rotate(k*Math.PI/2);x.translate(0,-(s*1.9+40));drawShape(x,t,s);x.restore()}}

/* 5. Polarisation */
const Q=init("#c5",320,240),vid=document.createElement("video");vid.playsInline=true;vid.muted=true;let live=false;
$("#cam").onclick=async()=>{try{const st=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});vid.srcObject=st;await vid.play();live=true;$("#cam").textContent="Caméra active"}catch(e){$("#pn").textContent="Caméra indisponible ou refusée : la scène de démonstration reste utilisée."}};
function drawPola(t){const x=Q.x;x.setTransform(2,0,0,2,0,0);if(live&&vid.videoWidth)x.drawImage(vid,0,0,320,240);else{const g=x.createLinearGradient(0,0,0,240);g.addColorStop(0,"#5fa8d3");g.addColorStop(1,"#0b3c5d");x.fillStyle=g;x.fillRect(0,0,320,240);x.fillStyle="#ddd";x.fillRect(30,40,60,100);const o=Math.sin(t/1500)*20;x.fillStyle="rgba(255,255,255,.95)";x.beginPath();x.ellipse(220+o,150,80,16,0,0,TAU);x.fill();x.beginPath();x.ellipse(120-o,200,60,10,0,0,TAU);x.fill()}
const im=x.getImageData(0,0,640,480),d=im.data,th=+$("#ang").value*Math.PI/180,T=.12+.88*Math.cos(th)**2;
for(let i=0;i<d.length;i+=4){const l=.3*d[i]+.59*d[i+1]+.11*d[i+2],gl=Math.max(0,(l-170)/85),f=1-gl*(1-T);d[i]*=f;d[i+1]*=f;d[i+2]*=f}x.putImageData(im,0,0)}

const DR={prism:drawPrism,color:drawColor,laser:drawLaser,holo:drawHolo,pola:drawPola};
(function loop(t){DR[cur](t);requestAnimationFrame(loop)})(0);
show("prism");
