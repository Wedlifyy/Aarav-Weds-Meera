/* ================================================================
   PHOTO GALLERY — 3D rotating carousel
   Clockwise auto-rotation with momentum-based drag (mouse + touch).
   - Rotation stops the instant the user touches/drags.
   - Releasing resumes auto-rotation after ~2.5s of inactivity.
   - Tapping a photo brings it to the centre, enlarges it, and pauses.
   - Photos themselves are rendered by content.js from
     WEDDING_CONFIG.gallery (see config.js) directly into #galTrack.
   Runs entirely self-contained; only needs the DOM elements below
   to already exist (#galStage / #galTrack / #galDots).
   ================================================================ */
/* ===== 3D photo carousel: instant grab, lag-free drag, delayed resume, tap-to-center ===== */
  (function(){
    const track=document.getElementById('galTrack'); if(!track)return;
    const items=[...track.querySelectorAll('.gal-item')];
    const dotsWrap=document.getElementById('galDots'); const n=items.length; const step=360/n;
    items.forEach(()=>dotsWrap.appendChild(document.createElement('i')));
    const dots=[...dotsWrap.children];

    const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const AUTO=REDUCED?0:0.235;   // clockwise cruise speed (~17.5% faster; eased ramp below keeps it smooth)
    const RESUME_MS=0;             // resume immediately on release (eased ramp below keeps it smooth)
    let angle=0, vel=0;
    let dragging=false, pointerId=null;
    let lastX=0, lastT=0, moved=0, downT=0, downTarget=null;
    let idleUntil=0, focusIdx=-1, focusK=0, focusTimer=null;

    // Opens the enlarged preview for card i, and automatically closes
    // it (resuming rotation) after 3 seconds with no user interaction
    // required — matches "tap -> pause -> preview -> auto-close after
    // 3s -> resume automatically".
    function openFocus(i){
      focusIdx=i; vel=0; idleUntil=Infinity;
      if(focusTimer) clearTimeout(focusTimer);
      focusTimer=setTimeout(closeFocus, 3000);
    }
    function closeFocus(){
      if(focusTimer){ clearTimeout(focusTimer); focusTimer=null; }
      focusIdx=-1;
      idleUntil=performance.now();          // resume immediately, smooth ease-back (see tick())
      needsDraw=true;
    }

    /* ---- render ---- */
    let needsDraw=true;
    function layout(){
      let bestI=0,best=1e9;
      for(let i=0;i<n;i++){
        const it=items[i];
        const a=i*step+angle, rad=a*Math.PI/180;
        const z=Math.cos(rad), x=Math.sin(rad);
        const depth=(z+1)/2;
        const focus=(i===focusIdx)?focusK:0;
        const sc=(0.64+0.36*depth*depth)*(1+0.16*focus);
        it.style.transform='translate3d('+(x*56)+'%,0,'+((z*72)+focus*40)+'px) scale('+sc+') rotateY('+(-x*17*(1-focus))+'deg)';
        it.style.zIndex=String(Math.round(depth*100)+(focus>0.5?200:0));
        it.style.opacity=String(Math.min(1,(0.26+0.74*depth)+focus*0.3));
        it.style.filter='brightness('+(0.76+0.24*depth+focus*0.12)+') saturate('+(0.9+0.12*depth)+')';
        const front=Math.abs((((a+180)%360)+360)%360-180);
        if(front<best){best=front;bestI=i;}
      }
      for(let i=0;i<n;i++) dots[i].classList.toggle('on', i===bestI);
    }

    let lastFrame=performance.now();
    let running=false;   // starts asleep — scene.js wakes it as the gallery approaches view
    function tick(now){
      if(!running) return;
      const dt=Math.min(2.5,(now-lastFrame)/16.667); lastFrame=now;
      if(!dragging){
        if(now>=idleUntil){
          // ease back to cruise, then hold it
          vel += (AUTO-vel)*0.045*dt;
        }else{
          vel *= Math.pow(0.90,dt);     // decay momentum while idle-waiting
        }
        if(Math.abs(vel)>0.0005){ angle += vel*dt; needsDraw=true; }
      }
      // focus (tap-to-center) easing
      if(focusIdx>=0){
        const targetAngle=-focusIdx*step;
        let d=((targetAngle-angle+540)%360)-180;
        if(Math.abs(d)>0.05){ angle += d*0.12*dt; needsDraw=true; }
        if(focusK<1){ focusK=Math.min(1,focusK+0.06*dt); needsDraw=true; }
      }else if(focusK>0){
        focusK=Math.max(0,focusK-0.06*dt); needsDraw=true;
      }
      if(needsDraw){ layout(); needsDraw=false; }
      requestAnimationFrame(tick);
    }
    layout();   // draw the initial resting layout once, then wait to be woken

    /* ---- unified pointer handling (mouse + touch), no page-scroll conflict ---- */
    const stage=document.getElementById('galStage');
    stage.style.cursor='grab';
    stage.style.touchAction='pan-y';       // vertical page scroll stays free

    function start(x,y,target){
      dragging=true; vel=0; moved=0;
      lastX=x; lastT=downT=performance.now();
      downTarget=target;
      idleUntil=Infinity;                  // stop auto-rotation IMMEDIATELY
      stage.style.cursor='grabbing';
    }
    function drag(x){
      if(!dragging)return;
      const now=performance.now(), dt=Math.max(6,now-lastT), dx=x-lastX;
      lastX=x; lastT=now; moved+=Math.abs(dx);
      if(focusIdx>=0 && moved>9) closeFocus();   // a real drag cancels an open preview
      angle += dx*0.42;                    // 1:1 with the finger, no smoothing = no lag
      vel = (dx*0.42)*(16.667/dt);
      needsDraw=true; layout();            // draw right away for zero perceived lag
    }
    function end(x){
      if(!dragging)return;
      dragging=false; stage.style.cursor='grab';
      vel=Math.max(-12,Math.min(12,vel));
      idleUntil=performance.now()+RESUME_MS;
      if(moved<9 && performance.now()-downT<450 && downTarget){
        const card=downTarget.closest?downTarget.closest('.gal-item'):null;
        if(card){
          const i=items.indexOf(card);
          if(focusIdx===i) closeFocus();       // tap the focused card again to dismiss early
          else openFocus(i);                    // tap any card -> preview, auto-closes after 3s
        }
      }
      needsDraw=true;
    }

    if(window.PointerEvent){
      stage.addEventListener('pointerdown',e=>{
        if(pointerId!==null)return;
        pointerId=e.pointerId;
        try{stage.setPointerCapture(e.pointerId);}catch(_){}
        start(e.clientX,e.clientY,e.target);
      });
      stage.addEventListener('pointermove',e=>{ if(e.pointerId===pointerId) drag(e.clientX); });
      const fin=e=>{ if(e.pointerId===pointerId){ end(e.clientX); pointerId=null; } };
      stage.addEventListener('pointerup',fin);
      stage.addEventListener('pointercancel',fin);
      window.addEventListener('pointerup',fin);          // release outside the stage
      window.addEventListener('blur',()=>{ if(pointerId!==null){ end(lastX); pointerId=null; } });
    }else{
      stage.addEventListener('mousedown',e=>{e.preventDefault();start(e.clientX,e.clientY,e.target);});
      window.addEventListener('mousemove',e=>drag(e.clientX));
      window.addEventListener('mouseup',e=>end(e.clientX));
      stage.addEventListener('touchstart',e=>{const t=e.touches[0];start(t.clientX,t.clientY,e.target);},{passive:true});
      stage.addEventListener('touchmove',e=>drag(e.touches[0].clientX),{passive:true});
      stage.addEventListener('touchend',e=>end(e.changedTouches[0].clientX));
      stage.addEventListener('touchcancel',()=>{dragging=false;pointerId=null;});
    }

    /* expose so the scroll driver can idle it when off-screen */
    window.__gal={
      wake(){ if(!running){ running=true; lastFrame=performance.now(); requestAnimationFrame(tick); } },
      sleep(){ running=false; },
      isAwake(){ return running; }
    };
  })();
