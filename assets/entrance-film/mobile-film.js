/* Mobile entrance: continuous windows; effects fade outside; imagery/headline move together. */
(() => {
 const base=new URL('.',document.currentScript.src),host=document.getElementById('en-host'),root=host&&host.shadowRoot;
 if(!root)return;
 const wrap=root.querySelector('.wrap'),media=matchMedia('(max-width:760px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const style=document.createElement('style');style.textContent=`
 .mobile-film,.mobile-film-control,.mobile-projects{display:none}
 @media(min-width:761px){.foot{align-items:center}.foot a{display:inline-flex;align-items:center;min-height:44px;font:500 16px/1.3 var(--jost);text-decoration:underline;text-decoration-color:#00c8d7;text-underline-offset:7px}.foot a:focus-visible{outline:2px solid #00c8d7;outline-offset:5px}}
 @media(max-width:760px){
 .wrap.mobile-film-opening .mobile-film,.wrap.mobile-film-opening .mobile-projects,.wrap.mobile-film-opening .mobile-film-control{visibility:hidden}
 .wrap.mobile-film-opening .who,.wrap.mobile-film-opening .line,.wrap.mobile-film-opening .caps,.wrap.mobile-film-opening .sub,.wrap.mobile-film-opening .pager,.wrap.mobile-film-opening .detail{display:none!important}
 .wrap.mobile-film-opening .s img{opacity:0!important}
 .wrap.mobile-film-opening .foot>span:first-child{display:none!important}
 .wrap.mobile-film-ready .line{display:none!important}
 .wrap.mobile-film-ready .who{opacity:var(--identity-visible,0)}
 }
 @media(max-width:760px){
 .wrap.mobile-film-ready{background:var(--film-ground,#08090d)}
 .wrap.mobile-film-ready .s,.wrap.mobile-film-ready .caps,.wrap.mobile-film-ready .sub,.wrap.mobile-film-ready .detail,.wrap.mobile-film-ready .pager,.wrap.mobile-film-ready #il,.wrap.mobile-film-ready #sv{display:none!important}
 .mobile-film,.mobile-projects{display:block;position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;object-fit:contain}
 .mobile-projects{z-index:1}
 .wrap.mobile-film-ready .who,.wrap.mobile-film-ready .line{z-index:2;pointer-events:none}
 .wrap.mobile-film-ready .who{left:24px!important;top:88px!important}
 .wrap.mobile-film-ready .who .name{font-size:30px!important;line-height:1.05;letter-spacing:-.025em;font-weight:500}
 .wrap.mobile-film-ready .who .title{font-size:12px!important;line-height:1.5;letter-spacing:.02em!important;margin-top:8px!important;max-width:290px;text-transform:none;color:#c4c4c4!important}
 .wrap.mobile-film-ready .line{left:22px!important;top:var(--headline-top,540px)!important;font-size:clamp(40px,12.6vw,56px)!important;line-height:.88!important;letter-spacing:-.055em!important;opacity:var(--film-headline,0)!important}
 .mobile-film,.mobile-projects{top:58px;height:calc(100% - 58px)}
 .headline-row{display:block;position:relative;perspective:700px}
 .headline-row strong{font-weight:600}
 .headline-row .slice{position:absolute;inset:0;display:block;transform-origin:50% 100%;will-change:transform,opacity}
 .headline-row .measure{visibility:hidden;display:block}
 .montage-index{position:absolute;left:24px;bottom:88px;font:10px var(--inter, sans-serif);letter-spacing:.12em;text-transform:uppercase;color:#a9a9a9;opacity:0;z-index:2}
 @media(max-height:720px){.wrap.mobile-film-ready .who{top:72px!important}.wrap.mobile-film-ready .line{top:var(--headline-top,420px)!important;font-size:40px!important}.mobile-film,.mobile-projects{top:68px;height:calc(100% - 68px)}}
 .film-headline{display:inline-block;will-change:transform,clip-path}
 .mobile-film-control{display:block;position:absolute;right:20px;bottom:24px;z-index:3;background:transparent;color:#fff;border:0;border-radius:0;padding:10px 14px;font:500 14px system-ui;cursor:pointer;min-height:44px}
 .wrap.mobile-film-ready .foot{left:24px;right:auto;bottom:24px;z-index:3;width:auto}.wrap.mobile-film-ready .foot>span:first-child{display:none}
 .wrap.mobile-film-ready .foot a{display:inline-flex;align-items:center;min-height:44px;font:500 18px/1.3 var(--jost);text-decoration:underline;text-decoration-color:#00c8d7;text-underline-offset:7px}
 .wrap.mobile-film-ready .foot a:focus-visible{outline:2px solid #00c8d7;outline-offset:5px}
 @media(max-width:359px){.wrap.mobile-film-ready .who .name{font-size:27px!important}.wrap.mobile-film-ready .who .title{max-width:260px;font-size:11px!important}.wrap.mobile-film-ready .foot a{font-size:16px}.mobile-film-control{right:12px;padding:10px 8px;font-size:13px}}
 .mobile-film-control:focus-visible{outline:2px solid white;outline-offset:4px}
 }`;root.append(style);
 let video,button,svg,groups=[],headline,started=false,elapsed=0,paused=false,raf=0,last=0,away=false;
 const paths=["M399.6406062961523 472 C348.4940847260008 472 303.8027050136028 505.8904003109211 289.8112553439565 555.0936649825106 L200 872 C251.14652157015158 872 295.915631558492 838.1873299650214 309.82935095219585 788.9063350174893 Z", "M546.6406062961523 472 C495.4940847260008 472 450.8027050136028 505.8904003109211 436.8112553439565 555.0936649825106 L347 872 C398.14652157015155 872 442.915631558492 838.1873299650214 456.82935095219585 788.9063350174893 Z", "M693.6406062961523 472 C642.4940847260008 472 597.8027050136028 505.8904003109211 583.8112553439564 555.0936649825106 L494 872 C545.1465215701515 872 589.915631558492 838.1873299650214 603.8293509521959 788.9063350174893 Z"];
 const sets=[["hero-zeiss", "hero-liwa", "hero-mazzika"], ["hero-cityscape", "aiaasc-alpha", "hero-alforsan"], ["hero-majid", "bullying-kv-notext", "lilly-clock"], ["unilever-world", "pyr-night", "liwa-s2-03b-bikes-airborne"], ["mazzika-117_5", "cityscape-105", "aiaasc-books"], ["grill-stage", "hero-dha", "liwa-s6c-drift-smoke-overhead"], ["door-2400", "mazzika-crowd", "pyr-invite"], ["liwa-festival-20", "bullying-stand-render", "dinner-2400"], ["liwa-s1f-quad-into-sun", "cityscape-44", "mazzika-cover"], ["hero-majid", "aiaasc-world", "hero-biggrill"]].map(set=>set.map(n=>n+".webp"));
 const ns='http://www.w3.org/2000/svg',clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)};
 function label(){if(!button)return;button.textContent=started&&elapsed<DURATION?(paused?'Play animation':'Pause animation'):video.ended?'Replay film':video.paused?'Play film':'Pause film';}
 const DURATION=5.4;
 const beats=[0,.22,.44,.66,.88,1.10,1.32,1.54,1.76,1.98];
 let slices=[],index,outro=[];
 function paint(){
  const t=reduced.matches?DURATION:elapsed;
  groups.forEach((group,j)=>group.forEach((g,i)=>{
   const begin=beats[j]+i*.025,end=j<beats.length-1?beats[j+1]+i*.025:99;
   const active=t>=begin&&t<end;g.style.opacity=active?ease(t/.18):0;
   // Fast diagonal shutter within each fixed window, followed by a still image.
   const p=clamp((t-begin)/.075),im=g.querySelector('image');
   im.setAttribute('transform',active?`translate(${(1-p)*24} ${(1-p)*-70})`:'');
  }));
  wrap.style.setProperty('--film-headline',0);wrap.style.setProperty('--identity-visible',ease((t-2.4)/.8));
  slices.forEach((el,i)=>{
   const row=Math.floor(i/3),part=i%3,delay=row*.32+part*.09;
   const p=clamp((t-delay)/.78),q=1-Math.pow(1-p,4);
   const settled=t>=1.5;el.style.visibility=settled?'hidden':'visible';el.parentElement.querySelector('.measure').style.visibility=settled?'visible':'hidden';
   // Three pieces arrive along the signal's slant and lock into one headline.
   const dir=part===1?-1:1;
   el.style.opacity=clamp(p*5);
   el.style.transform=`translate3d(${dir*(1-q)*78}px,${(1-q)*(row?90:50)}px,0) rotateX(${(1-q)*-65}deg) skewY(${dir*(1-q)*9}deg)`;
  });
  // Outro: the three project windows resolve into the three brand signals.
  outro.forEach((path,i)=>path.style.opacity=ease((t-3.0-i*.14)/.75));
  index.style.opacity=0;
 }
 function tick(now){const dt=last?(now-last)/1000:0;last=now;if(!paused&&!document.hidden&&!away&&media.matches)elapsed=Math.min(DURATION,elapsed+dt);paint();label();if(elapsed<DURATION)raf=requestAnimationFrame(tick);else raf=0;}
 function start(){if(started)return;started=true;elapsed=reduced.matches?DURATION:0;last=0;paint();label();if(elapsed<DURATION)raf=requestAnimationFrame(tick);}
 function reset(){wrap.style.setProperty('--identity-visible',0);cancelAnimationFrame(raf);raf=0;started=false;elapsed=0;paused=false;last=0;wrap.style.setProperty('--film-ground','#08090d');groups.flat().forEach(g=>g.style.opacity=0);wrap.style.setProperty('--film-headline',reduced.matches?1:0);headline.style.transform='';headline.style.clipPath='';slices.forEach(s=>{s.style.opacity=reduced.matches?1:0;s.style.transform='';s.style.visibility=reduced.matches?'hidden':'visible';s.parentElement.querySelector('.measure').style.visibility=reduced.matches?'visible':'hidden'});if(index)index.style.opacity=0;outro.forEach(p=>p.style.opacity=0);}
 function init(){
  if(!media.matches){if(video)video.pause();return;}if(video)return;
  const line=root.querySelector('.line');line.innerHTML='<span class="film-headline" aria-label="Big ideas, built."></span>';headline=line.firstElementChild;
  ['Big ideas,','<strong>built.</strong>'].forEach(word=>{const row=document.createElement('span');row.className='headline-row';row.setAttribute('aria-hidden','true');row.innerHTML='<span class="measure">'+word+'</span>';for(let i=0;i<3;i++){const piece=document.createElement('span');piece.className='slice';piece.innerHTML=word;piece.style.clipPath=['polygon(0 0,38% 0,24% 100%,0 100%)','polygon(38% 0,73% 0,59% 100%,24% 100%)','polygon(73% 0,100% 0,100% 100%,59% 100%)'][i];row.append(piece);slices.push(piece)}headline.append(row)});
  index=document.createElement('div');index.className='montage-index';index.setAttribute('aria-hidden','true');wrap.append(index);
  const pageStyle=document.createElement('style');pageStyle.textContent='@media(max-width:760px){body.en-top .hdr{padding:20px 24px!important}body.en-top .hdr .brand{width:32px!important;height:36px!important;min-width:32px!important;padding:0!important}body.en-top .hdr .brand svg{width:32px!important;height:36px!important}body.en-top .hdr .menu-btn{font-size:12px!important}body.en-top .hdr>.pill:not(.brand){font-size:12px!important;padding:10px 0!important;min-height:44px}}';document.head.append(pageStyle);
  video=document.createElement('video');video.className='mobile-film';video.muted=true;video.defaultMuted=true;video.playsInline=true;video.setAttribute('muted','');video.setAttribute('playsinline','');video.setAttribute('aria-hidden','true');video.preload='metadata';
  video.poster=new URL('./mobile-clean-17oct.jpg',base).href;video.src=new URL('./mobile-windows-17oct.mp4',base).href;
  svg=document.createElementNS(ns,'svg');svg.classList.add('mobile-projects');svg.setAttribute('viewBox','0 0 720 1280');svg.setAttribute('preserveAspectRatio','xMidYMid meet');svg.setAttribute('aria-hidden','true');
  const defs=document.createElementNS(ns,'defs');paths.forEach((d,i)=>{const clip=document.createElementNS(ns,'clipPath');clip.id='film-window-'+i;const path=document.createElementNS(ns,'path');path.setAttribute('d',d);clip.append(path);defs.append(clip)});svg.append(defs);
  groups=sets.map(set=>set.map((name,i)=>{const g=document.createElementNS(ns,'g');g.setAttribute('clip-path',`url(#film-window-${i})`);g.style.opacity=0;const im=document.createElementNS(ns,'image');im.setAttribute('x',200+i*147);im.setAttribute('y',472);im.setAttribute('width',200);im.setAttribute('height',400);im.setAttribute('preserveAspectRatio','xMidYMid slice');im.setAttribute('href',new URL('./montage/'+name,base).href);g.append(im);svg.append(g);return g}));
  outro=paths.map(d=>{const p=document.createElementNS(ns,'path');p.setAttribute('d',d);p.setAttribute('fill','#F7F5F1');p.style.opacity=0;svg.append(p);return p});
  button=document.createElement('button');button.type='button';button.className='mobile-film-control';
  button.addEventListener('click',()=>{if(started&&elapsed<DURATION){paused=!paused;label();return;}if(video.ended){reset();video.currentTime=0;video.play().catch(label);}else if(video.paused){video.play().catch(label);}else video.pause();});
  video.addEventListener('timeupdate',()=>{const shade=Math.round(8*(1-clamp((video.currentTime-8))));wrap.style.setProperty('--film-ground',`rgb(${shade},${shade},${shade})`);if(video.currentTime>=9)start();});video.addEventListener('ended',start);['play','pause','ended'].forEach(e=>video.addEventListener(e,label));
  video.addEventListener('error',()=>{wrap.classList.remove('mobile-film-ready');video.remove();svg.remove();button.remove();line.innerHTML='Big ideas,<br>built.';});
  wrap.prepend(video);wrap.append(svg,button);wrap.classList.add('mobile-film-opening');reset();label();
  function handoff(){
   wrap.classList.remove('mobile-film-opening');wrap.classList.add('mobile-film-ready');
   video.style.opacity=1;if(!reduced.matches)video.animate([{opacity:0},{opacity:1}],{duration:240});
   if(!reduced.matches&&!window.__enInstant)video.play().catch(label);else{wrap.style.setProperty('--identity-visible',1);label();}
  }
  root.addEventListener('entrance-landed',handoff,{once:true});
  if(reduced.matches||window.__enInstant||!wrap.classList.contains('intro'))handoff();
 }
 function layout(){
  if(!video)return;
  const h=wrap.clientHeight,w=wrap.clientWidth,top=h<=720?68:58;
  const scale=Math.min(w/720,(h-top)/1280),offset=(h-top-1280*scale)/2;
  window.__mobileFilmTarget={x:200*scale+(w-720*scale)/2,y:top+offset+472*scale,height:400*scale};
  wrap.style.setProperty('--headline-top',`${top+offset+872*scale+16}px`);
 }
 function scroll(){if(!video)return;const p=clamp(scrollY/(innerHeight*.85)),y=-ease(p)*innerHeight;away=p>=1;[video,svg,button,index].forEach(el=>el.style.transform=`translateY(${y}px)`);if(away)video.pause();}
 document.addEventListener('visibilitychange',()=>{last=0;if(video&&document.hidden)video.pause();});
 reduced.addEventListener('change',()=>{if(video&&reduced.matches){video.pause();if(started){elapsed=DURATION;paint();}else wrap.style.setProperty('--film-headline',1);}});
 media.addEventListener('change',()=>{init();layout()});addEventListener('resize',layout);addEventListener('scroll',scroll,{passive:true});init();layout();scroll();
})();
