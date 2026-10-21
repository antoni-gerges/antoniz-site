/* Mobile browsing refinements: retain all work, expose direct navigation. */
(()=>{
 const mq=matchMedia('(max-width:760px)'),pick=document.querySelector('.pj-sel .pj-pick');
 if(!pick)return;
 const panel=document.createElement('details');panel.className='mobile-sectors';
 const summary=document.createElement('summary');summary.textContent='Filter by sector · All';
 pick.before(panel);panel.append(summary,pick);
 function state(){panel.open=!mq.matches;}
 state();mq.addEventListener('change',state);
 pick.addEventListener('change',()=>{const active=pick.querySelector('input:checked');summary.textContent='Filter by sector · '+(active?.parentElement.querySelector('span')?.textContent||'All');if(mq.matches)panel.open=false;});
 const nav=document.createElement('div');nav.className='mobile-jump';
 const label=document.createElement('label');label.htmlFor='mobile-work-jump';label.textContent='Go straight to';
 const select=document.createElement('select');select.id='mobile-work-jump';select.name='work-section';
 select.add(new Option('Choose a project or chapter',''));
 const selected=document.createElement('optgroup');selected.label='Selected projects';
 document.querySelectorAll('.pj-sel article[id]').forEach(article=>{const title=article.querySelector('.pj-name');if(title)selected.append(new Option(title.textContent.trim(),article.id));});
 const archive=document.createElement('optgroup');archive.label='More work';
 document.querySelectorAll('.cnav a[href*="#"]').forEach(a=>{const id=a.hash.slice(1),here=a.getAttribute('href').charAt(0)==='#';if(here?document.getElementById(id):a.closest('[data-fix="E-ARCHIVE"]'))archive.append(new Option(a.textContent.trim().replace(/^\d+\s*/,''),here?id:a.href));});   /* E-ARCHIVE: the chapters on the archive page too */
 select.append(selected,archive);nav.append(label,select);panel.before(nav);
 select.addEventListener('change',()=>{const target=document.getElementById(select.value);if(!target){if(/^https?:/.test(select.value))location.href=select.value;return;}const all=document.getElementById('s-all');if(all){all.checked=true;all.dispatchEvent(new Event('change',{bubbles:true}));}target.setAttribute('tabindex','-1');history.replaceState(null,'','#'+target.id);target.scrollIntoView({behavior:'auto',block:'start'});target.focus({preventScroll:true});});
})();
