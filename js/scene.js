/* ================================================================
   3D PALACE SCENE ENGINE
   ----------------------------------------------------------------
   This is the core of the site: the fixed 9:16 "stage" with four
   parallax depth layers (back / mid / front / near), the swinging
   bell ornaments, the gold-dust particles, and the scroll-driven
   camera that steps through 3 cinematic zooms — one per section
   change — while the foreground UI (Events / Gallery / Location)
   rises and fades in sync.

   This file is tightly-coupled by design (the camera position,
   parallax, and foreground reveal timing all share the same
   per-frame state) and is NOT meant to be edited by clients.
   Everything a client needs to customise lives in config.js and
   the assets/ folder — see README.md.
   ================================================================ */
(function(){

  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let galActive=false;
  const $=id=>document.getElementById(id);
  const stage=$('stage'),scene=$('scene'),
        Lback=$('Lback'),Lmid=$('Lmid'),Lfront=$('Lfront'),Lnear=$('Lnear'),
        bellL=$('bellL'),bellR=$('bellR'),glow=$('glow');

  let tx=0,ty=0,cx=0,cy=0,t0=performance.now(),lastX=null,lastT=0,impulse=0;
  // Cached once (and refreshed only on resize) to avoid forced synchronous
  // layout every animation frame — reading clientWidth right after a
  // style write forces the browser to recompute layout immediately
  // instead of batching it, which was the root cause of the jitter
  // during scroll (60 forced reflows/sec, on top of every other frame's
  // style writes).
  let cachedStageW=stage.clientWidth;
  function pointer(e){
    const r=stage.getBoundingClientRect();
    tx=Math.max(-.5,Math.min(.5,(e.clientX-r.left)/r.width-.5));
    ty=Math.max(-.5,Math.min(.5,(e.clientY-r.top)/r.height-.5));
    const now=performance.now();
    if(lastX!==null)impulse=Math.min(1,impulse+Math.abs(e.clientX-lastX)/Math.max(1,now-lastT)*0.25);
    lastX=e.clientX;lastT=now;
  }
  if(!reduce){
    let pmQueued=false,pmEvt=null;
    addEventListener('mousemove',e=>{
      pmEvt=e; if(pmQueued)return; pmQueued=true;
      requestAnimationFrame(()=>{pmQueued=false;if(pmEvt)pointer(pmEvt);});
    },{passive:true});
    addEventListener('touchmove',e=>pointer(e.touches[0]),{passive:true});
    addEventListener('deviceorientation',e=>{
      if(e.gamma==null)return;
      tx=Math.max(-.5,Math.min(.5,e.gamma/45));
      ty=Math.max(-.5,Math.min(.5,(e.beta-45)/45));
      impulse=Math.min(1,impulse+Math.abs(e.gamma)/400);
    },true);
  }

  let targetP=0,p=0;
  function readScroll(){
    const max=document.documentElement.scrollHeight-innerHeight;
    targetP=max>0?Math.min(1,Math.max(0,scrollY/max)):0;
  }
  /* Perf: coalesce scroll reads into one rAF tick (avoids layout thrash
     from dozens of scroll events per frame on iOS momentum scrolling). */
  let scrollQueued=false;
  function onScroll(){
    if(scrollQueued)return; scrollQueued=true;
    requestAnimationFrame(()=>{ scrollQueued=false; readScroll(); });
  }
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',()=>{readScroll(); cachedStageW=stage.clientWidth;},{passive:true});
  readScroll();

  const ease=x=>x*x*(3-2*x);
  const seg=(x,a,b)=>Math.min(1,Math.max(0,(x-a)/(b-a)));

  /* 3 stepped zoom-ins, one per section change.
     Each section rests at its own zoom level:
     S1 = 1.0 (hero) -> S2 = 1.6 -> S3 = 2.4 -> S4 = 3.2 */
  const STEPS=[[.06,.28],[.41,.63],[.74,.96]];   // transition windows in scroll progress
  const RATIO=[1.6, 1.5, 1.3334];                // per-step magnification

  let lastNow=performance.now();
  function frame(now){
    if(!running)return;
    const t=(now-t0)/1000;
    const dt=Math.min(0.05,(now-lastNow)/1000); lastNow=now;
    const ix=Math.sin(t*.35)*.06+Math.sin(t*.13)*.03;
    const iy=Math.cos(t*.28)*.05;
    cx+=((tx+ix)-cx)*.06; cy+=((ty+iy)-cy)*.06;
    // responsive glide, a touch slower than the original
    p+=(targetP-p)*(reduce?1:(1-Math.exp(-dt*1.35)));

    const e1=ease(seg(p,STEPS[0][0],STEPS[0][1]));
    const e2=ease(seg(p,STEPS[1][0],STEPS[1][1]));
    const e3=ease(seg(p,STEPS[2][0],STEPS[2][1]));
    const zoom=Math.pow(RATIO[0],e1)*Math.pow(RATIO[1],e2)*Math.pow(RATIO[2],e3);
    const depth=(e1+e2+e3)/3;   // 0..1 overall journey depth

    const tilt=1-0.55*depth;
    scene.style.transform=`rotateX(${-cy*8*tilt}deg) rotateY(${cx*10*tilt}deg)`;
    const pan=k=>({x:-cx*k*(1-0.5*depth), y:-cy*k*0.72*(1-0.5*depth)});
    const breathe=1+0.05*(0.5-0.5*Math.cos(t*2*Math.PI/22))*(1-depth);

    /* final-section centering: gently guide the archway to dead centre,
       with a slow living drift once arrived */
    const stageW=cachedStageW;
    const centerFix=e3*stageW*0.012;                  // slight shift right
    const drift=e3*Math.sin(t*0.32)*stageW*0.006;     // slow left-right sway at the end

    if(quiet && !dragScene){ driveFG(); requestAnimationFrame(frame); return; }
    // back: distant sky/mist, slower zoom for depth separation
    {const s=(1+ (zoom-1)*0.82 )*breathe,m=pan(14);
     Lback.style.transform=`translateZ(-260px) translate3d(${m.x+centerFix*0.8+drift*0.8}px,${m.y}px,0) scale(${1.16*s})`;}
    // mid: the main dolly into the archway
    {const s=zoom*breathe,m=pan(22);
     Lmid.style.transform=`translateZ(-120px) translate3d(${m.x+centerFix+drift}px,${m.y}px,0) scale(${1.09*s})`;}
    // front lace frame: flies past during the FIRST zoom step
    {const q=e1,s=1+2.2*q,m=pan(30);
     Lfront.style.opacity=1-q;
     Lfront.style.transform=`translateZ(-30px) translate3d(${m.x}px,${m.y}px,0) scale(${1.04*s})`;}
    // near clouds/flowers: sweep beneath during the first zoom step (a touch earlier)
    {const q=ease(seg(e1,0,.8)),s=1+2.6*q,m=pan(34),bob=Math.sin(t*.9)*4*(1-q);
     Lnear.style.opacity=1-q;
     Lnear.style.transform=`translateZ(70px) translate3d(${m.x}px,${m.y+bob+q*150}px,0) scale(${1.05*s})`;}
    // bells: swing in the hero, fly outward during the first zoom step
    {impulse*=0.985;
     const fly=ease(seg(e1,.1,.9)),amp=(2.2+impulse*7)*(1-fly);
     const aL=Math.sin(t*2.1)*amp,aR=Math.sin(t*1.7+1.3)*amp*0.9,m=pan(28),s=1+1.4*fly;
     bellL.style.opacity=1-fly;bellR.style.opacity=1-fly;
     bellL.style.transform=`translate3d(${m.x-fly*160}px,${m.y-fly*60}px,0) scale(${s}) rotate(${aL}deg)`;
     bellR.style.transform=`translate3d(${m.x+fly*160}px,${m.y-fly*60}px,0) scale(${s}) rotate(${aR}deg)`;}
    // invite glides away with the 3D camera as one piece (scrolls along with the scene)
    {const inv=document.getElementById('invite');
     if(inv){const q=e1;
       inv.style.opacity=String(1-q);
       inv.style.transform=`translateY(${-q*26}dvh) scale(${1+q*0.14})`;
       inv.style.visibility=q>0.995?'hidden':'visible';}}

    /* ===== foreground overlays revealed in sync with the camera =====
       windows over global progress p:
         Events   : rises 0.14-0.28, holds, fades 0.34-0.43
         Gallery  : rises 0.49-0.63, holds, fades 0.66-0.75
         Location : rises 0.80-0.93 (stays)                                */
    driveFG();
    // arrival glow blooms with the last zoom step
    glow.style.opacity=e3*.85;

    requestAnimationFrame(frame);
  }
  /* Perf: stop all animation work while the tab is hidden, and resync
     the clock on return so nothing "jumps" to catch up. */
  let running=true;
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){ running=false; }
    else if(!running){ running=true; t0=performance.now()-1; lastNow=performance.now(); requestAnimationFrame(frame); }
  });
  requestAnimationFrame(frame);



  /* ===== foreground reveal driver ===== */
  const fgEvents=$('fgEvents'),fgGallery=$('fgGallery'),fgLocation=$('fgLocation');
  // Cached once — these were being re-queried with querySelectorAll/querySelector
  // on every single animation frame while the Events section was revealing,
  // which is exactly the scroll region reported as janky. The event cards,
  // countdown title, and countdown boxes are static content (never added or
  // removed at runtime), so there's no need to re-find them each frame.
  const evCards=fgEvents?[...fgEvents.querySelectorAll('.ev-card')]:[];
  const evCdTitle=fgEvents?fgEvents.querySelector('.cd-title'):null;
  const evCdBoxes=fgEvents?[...fgEvents.querySelectorAll('.cd-box')]:[];
  const locItems=fgLocation?[...fgLocation.querySelectorAll('[data-lc]')]:[];
  const clamp=(v)=>Math.min(1,Math.max(0,v));
  const smooth=x=>x*x*(3-2*x);
  function showFG(el,inA,inB,outA,outB,rise){
    if(!el)return 0;
    const ins=smooth(clamp((p-inA)/(inB-inA)));
    const outs=outA!=null?smooth(clamp((p-outA)/(outB-outA))):0;
    const vis=ins*(1-outs);
    el.style.visibility=vis<0.003?'hidden':'visible';
    el.style.opacity=String(vis);
    const lift=(1-ins)*(rise||5) + outs*-(rise||5);
    const sc=0.96+0.04*ins - outs*0.05;
    el.style.transform=`translateY(${lift}dvh) scale(${sc})`;
    return ins*(1-outs);
  }
  function stagger(el,sel,active,startAt,step){
    const items=el.querySelectorAll(sel);
    items.forEach((it,i)=>{
      const q=smooth(clamp((active-(startAt+i*step))/0.14));
      it.style.opacity=String(q);
      it.style.transform=`translateY(${(1-q)*3.5}dvh)`;
    });
  }
  let quiet=false; const dragScene=false;
  function driveFG(){
    // once the Location section is essentially on screen, quiet the heavy background work
    const q = p>0.855;
    if(q!==quiet){ quiet=q; document.documentElement.classList.toggle('quiet',q); }
    // EVENTS
    const eA=showFG(fgEvents,0.14,0.28,0.34,0.43,6);
    if(eA>0){
      // heading first, then cards bottom->top, then countdown title, then boxes
      evCards.forEach((c,i)=>{
        const order=evCards.length-1-i;            // bottom to top
        const q=smooth(clamp((eA-(0.12+order*0.11))/0.16));
        c.style.opacity=String(q);c.style.transform=`translateY(${(1-q)*4}dvh)`;
      });
      const cq=smooth(clamp((eA-0.62)/0.16));
      if(evCdTitle){evCdTitle.style.opacity=String(cq);evCdTitle.style.transform=`translateY(${(1-cq)*3}dvh)`;}
      evCdBoxes.forEach((b,i)=>{
        const q=smooth(clamp((eA-(0.7+i*0.06))/0.14));
        b.style.opacity=String(q);b.style.transform=`translateY(${(1-q)*3}dvh)`;
      });
    }
    // GALLERY
    const gA=showFG(fgGallery,0.49,0.63,0.66,0.75,6);
    galActive=gA>0.5;
    if(window.__gal){
      if(p>0.44 && p<0.80) window.__gal.wake();
      else window.__gal.sleep();
    }
    // LOCATION (revealed together so the preview image and text arrive as one polished block)
    const lA=showFG(fgLocation,0.80,0.93,null,null,6);
    if(lA>0){
      const q=smooth(clamp((lA-0.03)/0.16));
      locItems.forEach((el)=>{
        el.style.opacity=String(q);
        el.style.transform=`translateY(${(1-q)*3}dvh)`;
      });
    }
  }



  const cv=$('dust'),ctx=cv.getContext('2d');
  /* Perf: cap the backing store at 1.5x DPR - the particles are soft
     blurs, so extra resolution costs fill-rate and buys nothing. */
  function size(){
    const dpr=Math.min(1.5,window.devicePixelRatio||1);
    cv.width=Math.round(stage.clientWidth*dpr);
    cv.height=Math.round(stage.clientHeight*dpr);
    cv.style.width=stage.clientWidth+'px';
    cv.style.height=stage.clientHeight+'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  size();addEventListener('resize',size);
  const NP=reduce?0:70,P=[];
  const CW=()=>stage.clientWidth, CH=()=>stage.clientHeight;
  for(let i=0;i<NP;i++)P.push({x:Math.random()*CW(),y:Math.random()*CH(),
    r:Math.random()*1.9+.5,vy:-(Math.random()*.3+.08),vx:(Math.random()-.5)*.18,
    a:Math.random()*6.28,o:Math.random()*.5+.2});
  let dustCleared=false;
  (function tick(){
    if(quiet){
      if(!dustCleared){ ctx.clearRect(0,0,CW(),CH()); dustCleared=true; }
      if(NP)requestAnimationFrame(tick);
      return;
    }
    dustCleared=false;
    ctx.clearRect(0,0,CW(),CH());
    ctx.shadowColor='rgba(240,204,126,.85)';ctx.shadowBlur=7;   // constant for every particle — set once/frame, not 70x
    const drift=1+p*2.2;
    for(const q of P){
      q.y+=q.vy*drift;q.x+=q.vx+Math.sin(q.a+=.012)*.09;
      if(q.y<-4){q.y=CH()+4;q.x=Math.random()*CW()}
      if(q.x<-4)q.x=CW()+4;if(q.x>CW()+4)q.x=-4;
      const tw=.6+.4*Math.sin(q.a*3);
      ctx.beginPath();ctx.arc(q.x,q.y,q.r*(1+p*.8),0,7);
      ctx.fillStyle=`rgba(224,186,110,${q.o*tw})`;
      ctx.fill();
    }
    if(NP)requestAnimationFrame(tick);
  })();

})();
