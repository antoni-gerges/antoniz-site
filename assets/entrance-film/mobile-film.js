/* Mobile entrance: continuous windows; effects fade outside; imagery/headline move together. */
(() => {
 const base=new URL('.',document.currentScript.src),host=document.getElementById('en-host'),root=host&&host.shadowRoot;
 if(!root)return;
 const wrap=root.querySelector('.wrap'),media=matchMedia('(max-width:760px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const style=document.createElement('style');style.textContent=`
 .mobile-film,.mobile-film-control,.mobile-projects{display:none}
 @media(max-width:760px){
 .wrap.mobile-film-ready{background:#000}
 .wrap.mobile-film-ready .s,.wrap.mobile-film-ready .caps,.wrap.mobile-film-ready .sub,.wrap.mobile-film-ready .detail,.wrap.mobile-film-ready .pager,.wrap.mobile-film-ready #il,.wrap.mobile-film-ready #sv{display:none!important}
 .mobile-film,.mobile-projects{display:block;position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;object-fit:contain}
 .mobile-projects{z-index:1}
 .wrap.mobile-film-ready .who,.wrap.mobile-film-ready .line{z-index:2;pointer-events:none}
 .wrap.mobile-film-ready .line{opacity:var(--film-headline,0)!important}
 .film-headline{display:inline-block;will-change:transform,clip-path}
 .mobile-film-control{display:block;position:absolute;right:16px;bottom:22px;z-index:3;background:transparent;color:#fff;border:1px solid #777;border-radius:0;padding:10px 14px;font:12px system-ui;cursor:pointer;min-height:44px}
 .wrap.mobile-film-ready .foot{left:16px;right:auto;bottom:22px;z-index:3;width:auto}.wrap.mobile-film-ready .foot>span:first-child{display:none}
 .mobile-film-control:focus-visible{outline:2px solid white;outline-offset:4px}
 }`;root.append(style);
 let video,button,svg,groups=[],headline,started=false,elapsed=0,paused=false,raf=0,last=0,away=false;
 const paths=["M399.6406062961523 472 C348.4940847260008 472 303.8027050136028 505.8904003109211 289.8112553439565 555.0936649825106 L200 872 C251.14652157015158 872 295.915631558492 838.1873299650214 309.82935095219585 788.9063350174893 Z", "M546.6406062961523 472 C495.4940847260008 472 450.8027050136028 505.8904003109211 436.8112553439565 555.0936649825106 L347 872 C398.14652157015155 872 442.915631558492 838.1873299650214 456.82935095219585 788.9063350174893 Z", "M693.6406062961523 472 C642.4940847260008 472 597.8027050136028 505.8904003109211 583.8112553439564 555.0936649825106 L494 872 C545.1465215701515 872 589.915631558492 838.1873299650214 603.8293509521959 788.9063350174893 Z"];
 const sets=[['hero-zeiss.webp','hero-liwa.webp','hero-mazzika.webp'],['hero-cityscape.webp','hero-majid.webp','hero-alforsan.webp']];
 const ns='http://www.w3.org/2000/svg',clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)};
 function label(){if(!button)return;button.textContent=started&&elapsed<6?(paused?'Play animation':'Pause animation'):video.ended?'Replay film':video.paused?'Play film':'Pause film';}
 function paint(){
  const t=reduced.matches?6:elapsed;
  groups.forEach((group,j)=>group.forEach((g,i)=>{
   const p=ease((t-(j?3:0)-i*.12)/1.05);g.style.opacity=p;
   const im=g.querySelector('image'),cx=300+i*147;
   im.setAttribute('transform',`translate(${cx} 672) scale(${1.045-.045*p}) translate(${-cx} -672)`);
  }));
  const p=ease(t/1.05);wrap.style.setProperty('--film-headline',p);
  headline.style.transform=`translateY(${20*(1-p)}px)`;headline.style.clipPath=`inset(0 0 ${100*(1-p)}% 0)`;
 }
 function tick(now){const dt=last?(now-last)/1000:0;last=now;if(!paused&&!document.hidden&&!away&&media.matches)elapsed=Math.min(6,elapsed+dt);paint();label();if(elapsed<6)raf=requestAnimationFrame(tick);else raf=0;}
 function start(){if(started)return;started=true;elapsed=reduced.matches?6:0;last=0;paint();label();if(elapsed<6)raf=requestAnimationFrame(tick);}
 function reset(){cancelAnimationFrame(raf);raf=0;started=false;elapsed=0;paused=false;last=0;groups.flat().forEach(g=>g.style.opacity=0);wrap.style.setProperty('--film-headline',reduced.matches?1:0);headline.style.transform='';headline.style.clipPath='';}
 function init(){
  if(!media.matches){if(video)video.pause();return;}if(video)return;
  const line=root.querySelector('.line');line.innerHTML='<span class="film-headline">Big ideas,<br>built.</span>';headline=line.firstElementChild;
  video=document.createElement('video');video.className='mobile-film';video.muted=true;video.defaultMuted=true;video.playsInline=true;video.setAttribute('muted','');video.setAttribute('playsinline','');video.setAttribute('aria-hidden','true');video.preload='metadata';
  video.poster=new URL('./mobile-clean-17oct.jpg',base).href;video.src=new URL('./mobile-windows-17oct.mp4',base).href;
  svg=document.createElementNS(ns,'svg');svg.classList.add('mobile-projects');svg.setAttribute('viewBox','0 0 720 1280');svg.setAttribute('preserveAspectRatio','xMidYMid meet');svg.setAttribute('aria-hidden','true');
  const defs=document.createElementNS(ns,'defs');paths.forEach((d,i)=>{const clip=document.createElementNS(ns,'clipPath');clip.id='film-window-'+i;const path=document.createElementNS(ns,'path');path.setAttribute('d',d);clip.append(path);defs.append(clip)});svg.append(defs);
  groups=sets.map(set=>set.map((name,i)=>{const g=document.createElementNS(ns,'g');g.setAttribute('clip-path',`url(#film-window-${i})`);g.style.opacity=0;const im=document.createElementNS(ns,'image');im.setAttribute('x',200+i*147);im.setAttribute('y',472);im.setAttribute('width',200);im.setAttribute('height',400);im.setAttribute('preserveAspectRatio','xMidYMid slice');im.setAttribute('href',new URL('../entrance/a/'+name,base).href);g.append(im);svg.append(g);return g}));
  button=document.createElement('button');button.type='button';button.className='mobile-film-control';
  button.addEventListener('click',()=>{if(started&&elapsed<6){paused=!paused;label();return;}if(video.ended){reset();video.currentTime=0;video.play().catch(label);}else if(video.paused){video.play().catch(label);}else video.pause();});
  video.addEventListener('timeupdate',()=>{if(video.currentTime>=9)start();});video.addEventListener('ended',start);['play','pause','ended'].forEach(e=>video.addEventListener(e,label));
  video.addEventListener('error',()=>{wrap.classList.remove('mobile-film-ready');video.remove();svg.remove();button.remove();line.innerHTML='Big ideas,<br>built.';});
  wrap.prepend(video);wrap.append(svg,button);wrap.classList.add('mobile-film-ready');reset();label();
  if(!reduced.matches&&!window.__enInstant)video.play().catch(label);else wrap.style.setProperty('--film-headline',1);
 }
 function scroll(){if(!video)return;const p=clamp(scrollY/(innerHeight*.85)),y=-ease(p)*innerHeight;away=p>=1;[video,svg,button].forEach(el=>el.style.transform=`translateY(${y}px)`);if(away)video.pause();}
 document.addEventListener('visibilitychange',()=>{last=0;if(video&&document.hidden)video.pause();});
 reduced.addEventListener('change',()=>{if(video&&reduced.matches){video.pause();if(started){elapsed=6;paint();}else wrap.style.setProperty('--film-headline',1);}});
 media.addEventListener('change',init);addEventListener('scroll',scroll,{passive:true});init();scroll();
})();
