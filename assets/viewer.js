/* antoniz.com E-VIEWER (21 Oct, viewer21.py): a picture or film file a link opens is shown here with Close. No fades. */
(function(){
var D=document,W=window,R=D.documentElement,MX=/\.(mp4|webm|mov|webp|jpe?g|png|gif)$/i,VX=/\.(mp4|webm|mov)$/i,
box,bar,x,st,cap,m,opener,y0=0,pr=null,pushed=0,skip=0;
function el(t,c){var e=D.createElement(t);e.className=c;return e}
function build(){
box=el('div','v21');box.id='v21';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.hidden=true;
bar=el('div','v21-bar');x=el('button','v21-x');x.type='button';x.innerHTML='Close<span aria-hidden="true">\u00d7</span>';
st=el('div','v21-s');cap=el('div','v21-c');bar.appendChild(x);st.appendChild(cap);box.appendChild(bar);box.appendChild(st);D.body.appendChild(box);
x.addEventListener('click',function(){close()});
box.addEventListener('click',function(e){var t=e.target;if(t===box||t===bar||t===st)close()});
}
function words(n){return(n&&n.textContent||'').replace(/[\u2197\u2192\u2193]/g,'').replace(/\s+/g,' ').trim()}
function caption(a){
var f=a.closest('figure'),fc=f&&f.querySelector('figcaption'),s='',i=a.querySelector('img');
if(fc){var c=fc.cloneNode(true),br=c.querySelector('br'),r;
if(br){r=D.createRange();r.setStartBefore(br);r.setEndAfter(c.lastChild);r.deleteContents()}
[].forEach.call(c.querySelectorAll('a'),function(n){n.parentNode.removeChild(n)});
s=words(c).replace(/^[\s\u00b7|,:\u2013-]+|[\s\u00b7|,:\u2013-]+$/g,'')}
return s||words(a)||a.getAttribute('aria-label')||(i&&i.alt)||''}
function size(w,h){m.style.setProperty('width',w,'important');m.style.setProperty('height',h,'important')}
function fit(){if(m&&m.tagName=='VIDEO'&&m.videoWidth){var k=Math.min(st.clientWidth/m.videoWidth,(st.clientHeight-cap.offsetHeight)/m.videoHeight);
size(Math.floor(m.videoWidth*k)+'px',Math.floor(m.videoHeight*k)+'px')}}
function open(a,src,film){
if(!box)build();if(!box.hidden)return;
opener=a;var s=caption(a),i=a.querySelector('img'),w=W.innerWidth-R.clientWidth,p;
m=el(film?'video':'img','v21-m');
if(film){m.controls=true;m.setAttribute('playsinline','');m.preload='auto';size('100%','100%');m.addEventListener('loadedmetadata',fit)}
else m.alt=(i&&i.alt)||s;
m.src=src;st.insertBefore(m,cap);cap.textContent=s;cap.hidden=!s;box.setAttribute('aria-label',s||(film?'Film':'Picture'));
y0=W.scrollY;R.classList.add('v21-open');pr=null;
if(w>0){pr=D.body.style.paddingRight;D.body.style.paddingRight=w+'px'}
box.hidden=false;st.style.setProperty('--vc',cap.offsetHeight+'px');x.focus({preventScroll:true});
try{history.pushState({v21:1},'');pushed=1}catch(e){pushed=0}
if(film){m.muted=false;p=m.play();if(p&&p.catch)p.catch(function(){})}
}
function close(fromPop){
if(!box||box.hidden)return;
if(m.tagName=='VIDEO'){m.pause();m.removeAttribute('src');m.load()}
st.removeChild(m);m=null;box.hidden=true;R.classList.remove('v21-open');if(pr!==null)D.body.style.paddingRight=pr;
if(opener&&opener.focus)opener.focus({preventScroll:true});opener=null;
if(pushed){pushed=0;if(!fromPop&&history.state&&history.state.v21){skip=1;history.back()}}
if(W.scrollY!==y0)W.scrollTo(W.scrollX,y0);
}
D.addEventListener('click',function(e){
if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
var a=e.target&&e.target.closest&&e.target.closest('a[href]'),u;
if(!a||a.hasAttribute('download')||(a.getAttribute('target')||'_self')!='_self')return;
try{u=new URL(a.getAttribute('href'),D.baseURI)}catch(_){return}
if(!/^https?:$/.test(u.protocol)||!MX.test(u.pathname))return;
e.preventDefault();open(a,u.href,VX.test(u.pathname));
});
D.addEventListener('keydown',function(e){
if(!box||box.hidden)return;
if(e.key=='Escape'){e.preventDefault();e.stopImmediatePropagation();close()}
else if(e.key=='Tab'){var f=m&&m.tagName=='VIDEO'?[x,m]:[x],n=f.indexOf(D.activeElement);e.preventDefault();f[(n+(e.shiftKey?f.length-1:1))%f.length].focus()}
},true);
W.addEventListener('popstate',function(){
if(skip){skip=0;if(W.scrollY!==y0)W.scrollTo(W.scrollX,y0);return}
if(box&&!box.hidden)close(1);
});
W.addEventListener('resize',fit);
})();
