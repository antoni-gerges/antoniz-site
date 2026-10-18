/* A visual index of the existing twelve stories. Original stories remain intact. */
(()=>{
 const root=document.querySelector('.pj-sel'),list=root?.querySelector('.plist'),head=root?.querySelector('.pj-head');if(!list||!head)return;
 const cards=[...list.querySelectorAll('article.pj')],pick=root.querySelector('.pj-pick');
 const tools=document.createElement('div');tools.className='work-tools';
 tools.innerHTML='<div class="work-view" role="group" aria-label="Work presentation"><button type="button" data-view="gallery" aria-pressed="true">Visual index</button><button type="button" data-view="stories" aria-pressed="false">Full stories</button></div><a class="work-archive" href="#archive">Explore the archive <span aria-hidden="true">↗</span></a>';
 head.append(tools);const filter=root.querySelector('.mobile-sectors');if(filter){filter.open=false;tools.insertBefore(filter,tools.lastElementChild);}
 const gallery=document.createElement('div');gallery.className='work-index wrap';gallery.id='work-visual-index';gallery.setAttribute('aria-label','Selected projects');
 cards.forEach((card,i)=>{
   const name=card.querySelector('.pj-name a'),src=card.querySelector('.pj-stage .pj-pic img')||card.querySelector('.pj-txt .pj-pic img')||card.querySelector('.sgw-in img');if(!name||!src)return;
   const item=document.createElement('article');item.className='work-tile';item.dataset.sectors=card.dataset.s;item.dataset.story=card.id;
   const link=document.createElement('a');link.href=name.getAttribute('href');link.className='work-tile-link';
   const media=document.createElement('div');media.className='work-tile-media';const img=src.cloneNode(false);img.removeAttribute('style');img.loading=i<2?'eager':'lazy';img.sizes='(max-width:760px) 92vw, 46vw';img.removeAttribute('fetchpriority');media.append(img);
   // Liwa's existing whole key visual, rather than the cropped window scene.
   if(card.id==='p-liwa'){img.src='../img/liwa/kv-1600.webp';img.srcset='../img/liwa/kv-800.webp 800w, ../img/liwa/kv-1600.webp 1600w, ../img/liwa/kv-2400.webp 2400w';img.alt='Liwa International Festival: the complete Ready? campaign artwork';img.width=1600;img.height=1145;}
   const meta=document.createElement('p');meta.className='work-tile-meta';const num=document.createElement('span');num.textContent=String(i+1).padStart(2,'0');const type=document.createElement('span');type.textContent=card.querySelector('.pj-k>span')?.textContent||'';meta.append(num,type);
   const title=document.createElement('h2');title.textContent=name.textContent;const arrow=document.createElement('span');arrow.className='work-tile-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';title.append(arrow);
   const desc=document.createElement('p');desc.className='work-tile-desc';desc.textContent=card.querySelector('.pj-line')?.textContent||'';
   link.append(media,meta,title,desc);item.append(link);gallery.append(item);
 });list.before(gallery);root.classList.add('work-index-ready');
 const status=document.createElement('p');status.className='work-count';status.setAttribute('role','status');tools.after(status);
 let mode='gallery';
 function apply(next,save=true){mode=next==='stories'?'stories':'gallery';root.dataset.view=mode;gallery.hidden=mode!=='gallery';list.hidden=mode==='gallery';tools.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===mode)));if(save){const url=new URL(location.href);url.searchParams.set('view',mode);history.replaceState(null,'',url);}}
 function filterCards(save=true){const active=pick?.querySelector('input:checked')?.value||'all';let count=0;gallery.querySelectorAll('.work-tile').forEach(tile=>{tile.hidden=active!=='all'&&!tile.dataset.sectors.split(' ').includes(active);if(!tile.hidden)count++;});status.textContent=String(count).padStart(2,'0')+' / 12 selected projects';if(save){const url=new URL(location.href);active==='all'?url.searchParams.delete('sector'):url.searchParams.set('sector',active);history.replaceState(null,'',url);}}
 function restore(){const url=new URL(location.href);const sector=document.getElementById(location.hash.slice(1))?.matches('article.pj')?'all':url.searchParams.get('sector')||'all';const input=[...pick.querySelectorAll('input')].find(i=>i.value===sector)||pick.querySelector('#s-all');input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));apply(document.getElementById(location.hash.slice(1))?.matches('article.pj')?'stories':url.searchParams.get('view'),false);filterCards(false);}
 tools.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>apply(b.dataset.view)));
 pick?.addEventListener('change',()=>{filterCards();if(filter){const hadFocus=filter.contains(document.activeElement);filter.open=false;if(hadFocus)filter.querySelector('summary').focus({preventScroll:true});}});
 document.addEventListener('click',e=>{if(filter&&!filter.contains(e.target))filter.open=false;});
 filter?.addEventListener('keydown',e=>{if(e.key==='Escape'){filter.open=false;filter.querySelector('summary').focus();}});
 // Run before the existing jump handler scrolls to its original story.
 root.querySelector('#mobile-work-jump')?.addEventListener('change',()=>apply('stories'),true);
 addEventListener('hashchange',()=>{if(document.getElementById(location.hash.slice(1))?.matches('article.pj'))apply('stories');});
 addEventListener('popstate',restore);restore();
})();
