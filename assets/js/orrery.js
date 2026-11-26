/* Neon Orbital orrery. Hand-built SVG, no libraries. */
(()=>{
const NS="http://www.w3.org/2000/svg",K=.6,E=.8,TAU=Math.PI*2,o=document.getElementById("orr-svg");if(!o)return;const $=i=>o.querySelector("#orr-"+i);
const M=$("mech"),PL=$("plate"),AR=$("arms"),B=$("back"),S=$("sun"),F=$("front");
const el=(t,a,p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);p&&p.appendChild(e);return e};
const P=(r,d)=>[r*Math.cos(d),r*K*Math.sin(d)],f=n=>n.toFixed(2),RM=matchMedia("(prefers-reduced-motion: reduce)");
const half=(r,front)=>`M${-r} 0A${r} ${r*K} 0 0 ${front?0:1} ${r} 0`,ell=r=>half(r,0)+`A${r} ${r*K} 0 0 1 ${-r} 0`;
/* wheelwork: three meshing spur gears in the vertical plane, seen from 37° above (vertical scale E) */
const G=[],gy=258,GM=3;
function gear(N,m,sp,cx,cy){const rp=m*N/2,ra=rp+m,rr=rp-1.25*m,w=TAU/N,g=el("g",{},M),th=el("g",{transform:"translate(1.4 3.2)"},g),r2=el("g",{},th),r=el("g",{},g);let d="";
 for(let i=0;i<N;i++){const c=i*w,pt=(R,a)=>`${f(R*Math.cos(a))} ${f(R*Math.sin(a))}`;d+=(i?"L":"M")+pt(rr,c-.3*w)+"L"+pt(ra,c-.13*w)+"A"+f(ra)+" "+f(ra)+" 0 0 1 "+pt(ra,c+.13*w)+"L"+pt(rr,c+.3*w)+"A"+f(rr)+" "+f(rr)+" 0 0 1 "+pt(rr,c+.7*w)}
 const ri=rr-m*1.6,hub=Math.max(4,rp*.2);d+="ZM"+ri+" 0A"+ri+" "+ri+" 0 1 0 "+(-ri)+" 0A"+ri+" "+ri+" 0 1 0 "+ri+" 0Z";
 el("path",{d,fill:"#7d5f30",stroke:"#2a241c","stroke-width":.5,"fill-rule":"evenodd"},r2);el("path",{d,class:"bm","fill-rule":"evenodd"},r);
 for(let i=0;i<sp;i++){const a=i*TAU/sp,c=Math.cos(a),s=Math.sin(a),h=Math.max(1.6,rp*.055),x1=hub*.8,x2=ri+.5;el("path",{d:`M${f(x1*c-h*s)} ${f(x1*s+h*c)}L${f(x2*c-h*1.5*s)} ${f(x2*s+h*1.5*c)}L${f(x2*c+h*1.5*s)} ${f(x2*s-h*1.5*c)}L${f(x1*c+h*s)} ${f(x1*s-h*c)}Z`,class:"bm"},r)}
 el("circle",{r:f(rp),class:"d"},r);el("circle",{r:f(hub),class:"bm"},r);el("circle",{r:1.6,fill:"#2a241c"},r);
 const o={N,rp,r,r2,cx,cy,a:0,g};g.setAttribute("transform",`translate(${f(cx)} ${f(cy)}) scale(1 ${E})`);G.push(o);return o}
el("path",{d:`M-178 ${gy+56}h356v8h-356z`,class:"bs"},M);el("path",{d:`M-178 ${gy+64}h356v6h-356z`,class:"hb"},M);
el("path",{d:`M-4 190V${gy}M4 190V${gy}`,class:"h"},M);el("path",{d:`M-4 190h8V${gy}h-8z`,class:"bs"},M);
el("path",{d:`M-146 ${gy-4}h266v8h-266z`,class:"bs"},M);el("path",{d:`M-142 ${gy+4}V${gy+56}h7V${gy+4}zM108 ${gy+4}V${gy+56}h7V${gy+4}z`,class:"bs"},M);
const g0=gear(40,GM,6,0,gy),phi1=0,phi2=Math.PI*.93,d1=GM*28,d2=GM*33;
const g1=gear(16,GM,4,d1*Math.cos(phi1),gy+d1*Math.sin(phi1)*E),g2=gear(26,GM,5,d2*Math.cos(phi2),gy+d2*Math.sin(phi2)*E);
g1.phi=phi1;g2.phi=phi2;
[0,1,2].forEach(i=>{const g=G[i];el("circle",{cx:f(g.cx),cy:f(g.cy),r:2.6,class:"bs"},M)});
el("path",{d:`M-178 ${gy+64}h356`,class:"h"},M);
/* plate: brass horizon ring with graduations, rim thickness, orbit tracks */
const RR=306,RI=288,T=8;
el("path",{d:`M${-RR} 0V${T}A${RR} ${RR*K} 0 0 0 ${RR} ${T}V0A${RR} ${RR*K} 0 0 1 ${-RR} 0Z`,class:"bs"},PL);
el("path",{d:`M${-RR} 0V${T}A${RR} ${RR*K} 0 0 0 ${RR} ${T}V0A${RR} ${RR*K} 0 0 1 ${-RR} 0Z`,class:"hb",opacity:.5},PL);
el("path",{d:ell(RR)+`M${RI} 0A${RI} ${RI*K} 0 0 0 ${-RI} 0A${RI} ${RI*K} 0 0 0 ${RI} 0Z`,class:"bs","fill-rule":"evenodd"},PL);
el("path",{d:ell(RI),class:"pp"},PL);el("path",{d:ell(RI-3),class:"f"},PL);
let tk="";for(let i=0;i<180;i++){const d=i*TAU/180,l=i%5?5:i%15?9:17,[x1,y1]=P(RI,d),[x2,y2]=P(RI+l,d);tk+=`M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`}
el("path",{d:tk,class:"f"},PL);
for(let a=0;a<360;a+=30){const d=a*Math.PI/180,[x,y]=P(275,d);el("text",{x:f(x),y:f(y+3.5),class:"nu","text-anchor":"middle"},PL).textContent=a+"°"}
for(let a=0;a<4;a++){const d=a*Math.PI/4,[x1,y1]=P(64,d),[x2,y2]=P(262,d),[x3,y3]=P(64,d+Math.PI),[x4,y4]=P(262,d+Math.PI);el("path",{d:`M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}M${f(x3)} ${f(y3)}L${f(x4)} ${f(y4)}`,class:"d"},PL)}
/* bodies: label, small-caps rest, count, orbit radius, size, moons, kind, accent, section */
const D=[["A","PPS","3",96,14,3,"m","#5f8173","#built-h"],["P","LANNERS","4",138,15,4,"m","#4b5b79","planners.html"],["S","INGLES","8",180,15.5,8,"m","#6e4a62","#music-h"],["E","TSY SHOP","301",222,15,0,"r","#a3645a","#gal-h"],["SHEEN","","",262,14,0,"c","#b08d52","#sheen-home-h"]];
D.forEach(d=>el("path",{d:ell(d[3]),class:"t"},PL));
/* sun on its column */
const SY=-22;el("path",{d:`M-3 0V${SY}M3 0V${SY}`,class:"h"},S);el("path",{d:`M-3 0h6V${SY}h-6z`,class:"bs"},S);
el("ellipse",{rx:12,ry:12*K,class:"bs"},S);
const sg=el("g",{transform:`translate(0 ${SY})`},S);
let rd="";for(let i=0;i<144;i++){const a=i*TAU/144,l=i%4==0?58:i%2?44:50;rd+=`M${f(36*Math.cos(a))} ${f(36*Math.sin(a))}L${f(l*Math.cos(a))} ${f(l*Math.sin(a))}`}el("path",{d:rd,class:"ry"},sg);el("circle",{r:41,class:"f",opacity:.5},sg);
el("circle",{r:35,class:"bs"},sg);el("circle",{r:30.5,class:"iv"},sg);el("circle",{r:28.5,class:"f"},sg);el("use",{href:"#orr-n",transform:"scale(.9)"},sg);
const R=[];
D.forEach((d,i)=>{
 const r=d[4],ac=d[7],g=el("g",{class:"b","data-i":i},F),stem=el("line",{class:"bl"},g),mb=el("g",{},g),bd=el("g",{},g),mf=el("g",{},g),ms=[];
 const cp=el("clipPath",{id:"orr-c"+i},o.querySelector("defs"));el("circle",{r},cp);
 if(d[6]=="r"){[2.05,1.65].forEach(k=>el("path",{d:`M${-r*k} 0A${r*k} ${r*k*K} 0 0 1 ${r*k} 0`,class:"h",stroke:ac},mb))}
 if(d[6]=="m"){el("ellipse",{rx:r+10,ry:(r+10)*K,class:"f",opacity:.7},mb);for(let j=0;j<d[5];j++)ms.push(el("circle",{r:2.3,class:"iv"},mb))}
 el("circle",{r,class:"iv"},bd);el("circle",{r,fill:ac,opacity:.22},bd);
 const sh=el("g",{"clip-path":`url(#orr-c${i})`},bd),ink={stroke:ac,"stroke-width":.6,fill:"none"};
 for(let j=1;j<6;j++)el("path",{d:`M0 ${-r}A${f(r*j/5.5)} ${r} 0 0 1 0 ${r}`,...ink},sh);
 for(let j=-r;j<=r;j+=1.6)el("path",{d:`M${f(r*.38)} ${f(j)}H${r}`,...ink,"stroke-width":.5},sh);
 for(let j=-r;j<=r*2;j+=2.2)el("path",{d:`M${f(r*.66)} ${f(j)}l${r} ${-r}`,...ink,"stroke-width":.45},sh);
 el("circle",{r,class:"h",fill:"none"},bd);
 if(d[6]=="c"){for(let j=0;j<48;j++){const a=j*TAU/48;el("line",{x1:f(r*Math.cos(a)),y1:f(r*Math.sin(a)),x2:f((r+2.4)*Math.cos(a)),y2:f((r+2.4)*Math.sin(a)),class:"f"},bd)}el("circle",{r:r*.62,class:"f"},bd)}
 if(d[6]=="r"){el("path",{d:`M${-r*2.05} 0A${r*2.05} ${r*2.05*K} 0 0 0 ${r*2.05} 0L${r*1.65} 0A${r*1.65} ${r*1.65*K} 0 0 1 ${-r*1.65} 0Z`,fill:ac,opacity:.28,stroke:"none"},mf);[2.05,1.65].forEach(k=>el("path",{d:`M${-r*k} 0A${r*k} ${r*k*K} 0 0 0 ${r*k} 0`,class:"h"},mf))}
 const rt=el("g",{class:"rt"},g);el("circle",{r:r+14,class:"h"},rt);[0,1,2,3].forEach(q=>{const a=q*Math.PI/2;el("line",{x1:f((r+10)*Math.cos(a)),y1:f((r+10)*Math.sin(a)),x2:f((r+19)*Math.cos(a)),y2:f((r+19)*Math.sin(a)),class:"h"},rt)});
 const t=el("g",{class:"lb"},g);["hl",""].forEach(c=>{const x=el("text",{class:c,"text-anchor":"middle"},t);x.append(d[0]);if(d[1])el("tspan",{class:"s"},x).textContent=d[1];if(d[2])el("tspan",{class:"cn",dx:4},x).textContent=d[2]});
 el("circle",{r:r+16,class:"hit"},g);
 R.push({g,stem,sh,ms,mb,mf,t,arm:el("line",{class:"bl"},AR),a:d[3],r,id:d[8],w:Math.pow(96/d[3],1.5),L:(d[0]+d[1]).length*.82+d[2].length*.62+(d[2]?.4:0),front:1});
});
const PH=[205,320,128,250,30].map(x=>x*Math.PI/180),ST=22;
function draw(p){
 const a0=p*TAU*.9;G.forEach((g,i)=>{g.a=i?-(40/g.N)*(a0-g.phi)+g.phi+Math.PI+Math.PI/g.N:a0;const rs=`rotate(${f(g.a*180/Math.PI)})`;g.r.setAttribute("transform",rs);g.r2.setAttribute("transform",rs)});
 R.forEach((b,i)=>{
 const th=PH[i]+p*TAU*1.25*b.w,[x,y]=P(b.a,th),by=y-ST-b.r;
 b.g.setAttribute("transform",`translate(${f(x)} ${f(by)})`);b.stem.setAttribute("y1",f(b.r));b.stem.setAttribute("y2",f(ST+b.r));
 const ax=Math.hypot(x,y/K)||1;b.arm.setAttribute("x1",f(x*14/ax));b.arm.setAttribute("y1",f(y*14/ax));b.arm.setAttribute("x2",f(x));b.arm.setAttribute("y2",f(y));
 b.sh.setAttribute("transform",`rotate(${f(Math.atan2(by-SY,x)*180/Math.PI)})`);
 const fr=y>0;if(fr!==b.front){(fr?F:B).appendChild(b.g);b.front=fr}
 b.ms.forEach((m,j)=>{const a=j*TAU/b.ms.length+th*2.5,mx=(b.r+10)*Math.cos(a),my=(b.r+10)*K*Math.sin(a);m.setAttribute("cx",f(mx));m.setAttribute("cy",f(my));const w=my>0?b.mf:b.mb;if(m.parentNode!==w)w.appendChild(m)});
 b.X=x;b.Y=by});
 const fs=parseFloat(getComputedStyle(R[0].t).fontSize)||17,boxes=[[-62,SY-62,62,SY+60]];
 R.forEach(b=>{const w=b.L*fs*.86,hh=fs,gap=b.r+(b.ms.length?16:13),c=[[0,-gap],[0,gap+hh*.8],[gap+w/2+4,hh*.35],[-gap-w/2-4,hh*.35]],cur=b.k||0;
  const order=[cur,...[0,1,2,3].filter(q=>q!=cur)];let best=cur,bs=1e9;
  for(const q of order){const[dx,dy]=c[q],l=b.X+dx-w/2,t=b.Y+dy-hh*.8,bx=[l,t,l+w,t+hh];let s=0;for(const z of boxes){const ox=Math.min(bx[2],z[2])-Math.max(bx[0],z[0]),oy=Math.min(bx[3],z[3])-Math.max(bx[1],z[1]);if(ox>0&&oy>0)s+=ox*oy}if(s<bs-40){bs=s;best=q}if(!s)break}
  b.k=best;const[dx,dy]=c[best],l=b.X+dx-w/2,t=b.Y+dy-hh*.8;boxes.push([l,t,l+w,t+hh]);b.t.style.transform=`translate(${f(dx)}px,${f(dy)}px)`})
}
const H=document.getElementById("orr-hero");let cur=0,tgt=0,last=0,raf=0;
const prog=()=>{const r=H.getBoundingClientRect(),span=H.offsetHeight-innerHeight;return Math.min(1,Math.max(0,-r.top/span))+Math.max(0,(-r.top-span)/innerHeight)*.25};
function tick(t){const dt=Math.min(.05,(t-last)/1000||.016);last=t;cur+=(tgt-cur)*(1-Math.exp(-dt*5));draw(cur);raf=Math.abs(tgt-cur)>1e-5?requestAnimationFrame(tick):0}
function onS(){if(window.__cap)return;tgt=RM.matches?0:prog();if(!raf){last=performance.now();raf=requestAnimationFrame(tick)}}
addEventListener("scroll",onS,{passive:true});RM.addEventListener("change",onS);
window.__render=p=>{cur=tgt=p;draw(p)};window.__prog=prog;draw(0);onS();
const L=[...document.querySelectorAll("#orr-idx a")],hl=(i,on)=>{R[i].g.classList.toggle("on",on);L[i].classList.toggle("on",on)};
R.forEach((b,i)=>{b.g.addEventListener("click",()=>{const h=b.id;if(h[0]=="#"){const t=document.querySelector(h);t&&t.scrollIntoView({behavior:RM.matches?"auto":"smooth"})}else location.href=h});b.g.addEventListener("pointerenter",()=>hl(i,1));b.g.addEventListener("pointerleave",()=>hl(i,0))});
L.forEach((a,i)=>{["focus","pointerenter"].forEach(e=>a.addEventListener(e,()=>hl(i,1)));["blur","pointerleave"].forEach(e=>a.addEventListener(e,()=>hl(i,0)))});
})();
