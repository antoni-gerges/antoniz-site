/* antoniz.com numbers (fixes20 E-NUMBERS, 21 Oct): figures count up once when their block is 40% in view; Home's six get line icons */
(function(){
var D=document,W=window,RM=W.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches,
/*ICONS*/I={
y:'M2.5 17h19|M6 17a6 6 0 0 1 12 0|M12 9V6.5|M6.34 11.34 4.58 9.58|M17.66 11.34l1.76-1.76',
b:'M2.5 19.5h19|M4.5 19.5v-5H8v5|M10.25 19.5v-10h3.5v10|M16 19.5v-15h3.5v15',
g:'M3 18.5h18|M6.5 18.5v-6|M12 18.5v-6|M17.5 18.5v-6|M5 12.5h14|M7.5 12.5a4.5 4.5 0 0 1 9 0',
c:'M2.5 19.5h19|M4 19.5V14h3V8h3.5v4h3V4.5H17V10h3v9.5',
r:'~M4 12a8 8 0 1 0 16 0a8 8 0 1 0-16 0z|M12 4a8 8 0 1 1-7.01 4.146',
d:'M4 12a8 8 0 1 0 16 0a8 8 0 1 0-16 0z|M12 7v5h3.5'
}/*END*/,
K=[['years','y'],['collectively','b'],['government','g'],['cities','c'],['reach','r'],['days','d']],
R=/^((?:US)?\$)?(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?([MK%+]{0,2})( [a-z]{1,12})?$/;
function svg(k){return'<svg class="nm-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+I[k].split('|').map(function(d){return d[0]=='~'?'<path class="nm-t" d="'+d.slice(1)+'"/>':'<path pathLength="1" d="'+d+'"/>'}).join('')+'</svg>'}
D.querySelectorAll('.h2-num>.cp').forEach(function(p){var t=p.textContent.trim().toLowerCase();K.some(function(k){if(t.indexOf(k[0])<0)return;p.insertAdjacentHTML('afterbegin',svg(k[1]));p.classList.add('nm-i');return 1})});
if(RM||!('IntersectionObserver'in W))return;
function fm(o,x){var s=x.toFixed(o.d);if(o.u&&s=='1'&&o.n!=1)s='0';if(o.g)s=s.replace(/\B(?=(\d{3})+(?!\d))/g,',');return o.p+s+o.s+o.u}
function draw(o,e){if(o.ic)o.ic.style.setProperty('--p',e)}
function end(o){o.x=1;o.f.textContent=o.t;o.f.style.minWidth='';o.f.classList.remove('nm-run');o.f.removeAttribute('aria-hidden');o.r.remove();if(o.ic){o.ic.classList.remove('nm-d');o.ic.style.removeProperty('--p')}}
function run(L){
 L.forEach(function(o){o.f.textContent=o.t});
 var w=L.map(function(o){return o.f.getBoundingClientRect().width}),t0=performance.now();
 L.forEach(function(o,i){o.f.style.minWidth=w[i]+'px';o.f.textContent=fm(o,0)});
 requestAnimationFrame(function tick(n){var on=0;L.forEach(function(o,i){if(o.x)return;var k=Math.min(1,Math.max(0,(n-t0-80*i)/900)),e=1-Math.pow(1-k,3),s=fm(o,o.n*e);if(s!=o.f.textContent)o.f.textContent=s;draw(o,e);k<1?on=1:end(o)});if(on)requestAnimationFrame(tick)})}
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&(e.intersectionRatio>=.4||e.intersectionRect.height>=innerHeight*.4)){io.unobserve(e.target);run(e.target._nm)}})},{threshold:[0,.1,.2,.3,.4]});
D.querySelectorAll('.h2-nums,dl.h2-nmore,.nums,.figs,.facts,.s-nums .nums').forEach(function(b){
 var L=[];[].forEach.call(b.children,function(c){var f=c.querySelector(':scope>b,:scope>dt'),t=f&&f.textContent,m=t&&!f.children.length&&R.exec(t.trim());
  if(!m||!m[1]&&!m[3]&&!m[4]&&!m[5]&&/^(19|20)\d\d$/.test(m[2]))return;
  L.push({f:f,t:t,p:m[1]||'',n:+(m[2].replace(/,/g,'')+(m[3]||'')),d:m[3]?m[3].length-1:0,g:m[2].indexOf(',')>0,s:m[4]||'',u:m[5]||'',ic:c.querySelector('.nm-ic')})});
 if(!L.length||!b.closest('details:not([open])')&&b.getBoundingClientRect().top<innerHeight)return;
 L.forEach(function(o){o.r=D.createElement('span');o.r.className='nm-sr';o.r.textContent=o.t;o.f.after(o.r);o.f.setAttribute('aria-hidden','true');o.f.textContent=fm(o,0);o.f.classList.add('nm-run');if(o.ic){o.ic.classList.add('nm-d');draw(o,0)}});
 b._nm=L;io.observe(b)});
})();
