/* A visual index of the existing twelve stories. Original stories remain intact. */
(()=>{
 const root=document.querySelector('.pj-sel'),list=root?.querySelector('.plist'),head=root?.querySelector('.pj-head');if(!list||!head)return;
 const cards=[...list.querySelectorAll('article.pj')],pick=root.querySelector('.pj-pick');
 const tools=document.createElement('div');tools.className='work-tools';
 tools.innerHTML='<div class="work-view" role="group" aria-label="Work presentation"><button type="button" data-view="gallery" aria-pressed="true">Visual index</button><button type="button" data-view="stories" aria-pressed="false">Full stories</button></div><a class="work-archive" href="#archive">Explore the archive <span aria-hidden="true">↗</span></a>';
 head.append(tools);
 const paths=head.querySelector('.work-paths');
 const guide=document.createElement('details');guide.className='work-guide';
 const guideTitle=document.createElement('summary');guideTitle.textContent='Collections & reading paths';guide.append(guideTitle);
 if(paths){paths.before(guide);guide.append(paths);}
 const introMore=head.querySelector('.pj-ledew>.rm');if(introMore)guide.append(introMore);
 const searchWrap=document.createElement('div');searchWrap.className='work-search';
 searchWrap.innerHTML='<label for="work-search-input">Find a project</label><div><input id="work-search-input" type="search" placeholder="Search projects…" autocomplete="off"><button type="button" aria-label="Clear project search" hidden>Clear</button></div>';
 tools.append(searchWrap);const search=searchWrap.querySelector('input'),clear=searchWrap.querySelector('button');
 tools.after(guide);
 const filter=root.querySelector('.mobile-sectors');if(filter){filter.open=false;tools.insertBefore(filter,tools.lastElementChild);}
 const gallery=document.createElement('div');gallery.className='work-index wrap';gallery.id='work-visual-index';gallery.setAttribute('aria-label','Selected projects');
 cards.forEach((card,i)=>{
   const name=card.querySelector('.pj-name a'),src=card.querySelector('.pj-stage .pj-pic img')||card.querySelector('.pj-txt .pj-pic img')||card.querySelector('.sgw-in img');if(!name||!src)return;
   const item=document.createElement('article');item.className='work-tile';item.dataset.sectors=card.dataset.s;item.dataset.story=card.id;item.dataset.search=card.textContent.toLowerCase();
   const link=document.createElement('a');link.href=name.getAttribute('href');link.className='work-tile-link';
   const media=document.createElement('div');media.className='work-tile-media';const img=src.cloneNode(false);img.removeAttribute('style');img.loading=i<2?'eager':'lazy';img.sizes='(max-width:760px) 92vw, 46vw';img.removeAttribute('fetchpriority');media.append(img);
   // Liwa's existing whole key visual, rather than the cropped window scene.
   if(card.id==='p-liwa'){img.src='../img/liwa/kv-1600.webp';img.srcset='../img/liwa/kv-800.webp 800w, ../img/liwa/kv-1600.webp 1600w, ../img/liwa/kv-2400.webp 2400w';img.alt='Liwa International Festival: the complete Ready? campaign artwork';img.width=1600;img.height=1145;}
   const meta=document.createElement('p');meta.className='work-tile-meta';const num=document.createElement('span');num.textContent=String(i+1).padStart(2,'0');const type=document.createElement('span');type.textContent=card.querySelector('.pj-k>span')?.textContent||'';meta.append(num,type);
   const title=document.createElement('h2');title.textContent=name.textContent;const arrow=document.createElement('span');arrow.className='work-tile-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent='↗';title.append(arrow);
   const desc=document.createElement('p');desc.className='work-tile-desc';desc.textContent=card.querySelector('.pj-line')?.textContent||'';
   const proof=document.createElement('p');proof.className='work-tile-proof';proof.textContent=card.querySelector('.pj-fact')?.textContent||'';
 link.append(media,meta,title,desc,proof);item.append(link);gallery.append(item);
 });list.before(gallery);root.classList.add('work-index-ready');
 const status=document.createElement('p');status.className='work-count';status.setAttribute('role','status');tools.after(status);
 let mode='gallery';
 const empty=document.createElement('div');empty.className='work-empty wrap';empty.hidden=true;empty.innerHTML='<h2>No matching projects.</h2><p>Try a different name or reset the filters.</p><button type="button">Show all projects</button>';gallery.after(empty);
 function reset(){search.value='';pick.querySelector('#s-all').checked=true;pick.querySelector('#s-all').dispatchEvent(new Event('change',{bubbles:true}));filterCards();search.focus();}
 empty.querySelector('button').addEventListener('click',reset);
 clear.addEventListener('click',()=>{search.value='';filterCards();search.focus()});
 search.addEventListener('input',()=>filterCards());
 
 function apply(next,save=true){mode=next==='stories'?'stories':'gallery';root.dataset.view=mode;gallery.hidden=mode!=='gallery';list.hidden=mode==='gallery';tools.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===mode)));if(save){const url=new URL(location.href);url.searchParams.set('view',mode);history.replaceState(null,'',url);}}
 function filterCards(save=true){const active=pick?.querySelector('input:checked')?.value||'all',query=search.value.trim().toLowerCase();let count=0;
 gallery.querySelectorAll('.work-tile').forEach(tile=>{const matches=(active==='all'||tile.dataset.sectors.split(' ').includes(active))&&(!query||tile.dataset.search.includes(query));tile.hidden=!matches;const card=cards.find(c=>c.id===tile.dataset.story);if(card)card.hidden=!matches;if(matches)count++;});
 if(filter)filter.querySelector('summary').textContent='Sector · '+(pick.querySelector('input:checked')?.parentElement.querySelector('span')?.textContent||'All');status.textContent=count+' of '+cards.length+' selected projects';empty.hidden=count!==0;clear.hidden=!query;
 if(save){const url=new URL(location.href);active==='all'?url.searchParams.delete('sector'):url.searchParams.set('sector',active);query?url.searchParams.set('q',search.value.trim()):url.searchParams.delete('q');history.replaceState(null,'',url);}}
 function restore(){const url=new URL(location.href);search.value=url.searchParams.get('q')||'';const sector=document.getElementById(location.hash.slice(1))?.matches('article.pj')?'all':url.searchParams.get('sector')||'all';const input=[...pick.querySelectorAll('input')].find(i=>i.value===sector)||pick.querySelector('#s-all');input.checked=true;if(document.getElementById(location.hash.slice(1))?.matches('article.pj'))search.value='';apply(document.getElementById(location.hash.slice(1))?.matches('article.pj')?'stories':url.searchParams.get('view'),false);filterCards(false);}
 tools.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>apply(b.dataset.view)));
 pick?.addEventListener('change',()=>{filterCards();if(filter){const hadFocus=filter.contains(document.activeElement);filter.open=false;if(hadFocus)filter.querySelector('summary').focus({preventScroll:true});}});
 document.addEventListener('click',e=>{if(filter&&!filter.contains(e.target))filter.open=false;});
 filter?.addEventListener('keydown',e=>{if(e.key==='Escape'){filter.open=false;filter.querySelector('summary').focus();}});
 // Run before the existing jump handler scrolls to its original story.
 root.querySelector('#mobile-work-jump')?.addEventListener('change',()=>apply('stories'),true);
 addEventListener('hashchange',()=>{if(document.getElementById(location.hash.slice(1))?.matches('article.pj')){search.value='';pick.querySelector('#s-all').checked=true;filterCards();apply('stories');}});
 addEventListener('popstate',restore);restore();
})();
