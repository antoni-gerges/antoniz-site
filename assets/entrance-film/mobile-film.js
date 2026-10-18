/* Tony approved 17 Oct 2026: footage only; logo and copy stay in HTML. */
(() => {
  const assetBase = new URL('.', document.currentScript.src);
  const host = document.getElementById('en-host');
  const root = host && host.shadowRoot;
  if (!root) return;
  const wrap = root.querySelector('.wrap');
  const media = matchMedia('(max-width:760px)');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const style = document.createElement('style');
  style.textContent = `
    .mobile-film,.mobile-film-control{display:none}
    @media(max-width:760px){
      .wrap.mobile-film-ready .s,.wrap.mobile-film-ready .caps,.wrap.mobile-film-ready .sub,
      .wrap.mobile-film-ready .detail,.wrap.mobile-film-ready .pager,
      .wrap.mobile-film-ready #il,.wrap.mobile-film-ready #sv{display:none!important}
      .mobile-film{display:block;position:absolute;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none;z-index:0}
      .wrap.mobile-film-ready .who,.wrap.mobile-film-ready .line{z-index:2;pointer-events:none}
      .mobile-film-control{display:block;position:absolute;right:16px;bottom:22px;z-index:3;background:transparent;color:#fff;border:1px solid #777;border-radius:0;padding:10px 14px;font:12px system-ui;cursor:pointer;min-height:44px}
      .wrap.mobile-film-ready .foot{left:16px;right:auto;bottom:22px;z-index:3;width:auto}.wrap.mobile-film-ready .foot>span:first-child{display:none}
      .mobile-film-control:focus-visible{outline:2px solid white;outline-offset:4px}
    }`;
  root.append(style);
  let video, button;
  function syncLabel() {
    button.textContent = video.ended ? 'Replay film' : video.paused ? 'Play film' : 'Pause film';
  }
  function init() {
    if (!media.matches) { if(video) video.pause(); return; }
    if (video) return;
    video = document.createElement('video');
    video.className = 'mobile-film';
    video.muted = true; video.defaultMuted = true; video.playsInline = true;
    video.setAttribute('muted',''); video.setAttribute('playsinline','');
    video.setAttribute('aria-hidden','true'); video.preload = 'metadata';
    video.poster = new URL('./mobile-clean-17oct.jpg', assetBase).href;
    video.src = new URL('./mobile-clean-17oct.mp4', assetBase).href;
    button = document.createElement('button'); button.type = 'button';
    button.className = 'mobile-film-control'; button.textContent = 'Play film';
    button.addEventListener('click', () => {
      if (video.paused || video.ended) {
        if(video.ended) video.currentTime = 0;
        video.play().catch(syncLabel);
      } else { video.pause(); }
    });
    ['play','pause','ended','error'].forEach(name => video.addEventListener(name,syncLabel));
    video.addEventListener('error', () => {wrap.classList.remove('mobile-film-ready');video.remove();button.remove();});
    wrap.prepend(video); wrap.append(button); wrap.classList.add('mobile-film-ready');
    if(!reduced.matches && !window.__enInstant) video.play().catch(syncLabel);
    syncLabel();
  }
  function onScroll() {
    if(!video) return;
    const p = Math.min(1,Math.max(0,scrollY/(innerHeight*.85)));
    const y = -p*p*(3-2*p)*innerHeight;
    video.style.transform = `translateY(${y}px)`;
    button.style.transform = `translateY(${y}px)`;
    if(p>=1) video.pause();
  }
  document.addEventListener('visibilitychange',()=>{if(video && document.hidden) video.pause();});
  reduced.addEventListener('change',()=>{if(video && reduced.matches) video.pause();});
  media.addEventListener('change',init);
  addEventListener('scroll',onScroll,{passive:true});
  init(); onScroll();
})();
