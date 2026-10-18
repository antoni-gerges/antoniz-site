const button=document.querySelector('.menu-btn'),header=document.querySelector('.hdr');
function closeMenu(){header.classList.remove('open');button.setAttribute('aria-expanded','false');}
button.addEventListener('click',()=>{const open=header.classList.toggle('open');button.setAttribute('aria-expanded',String(open));});
header.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();button.focus();}});
