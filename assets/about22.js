(() => {
  for (const gallery of document.querySelectorAll('.tr-proof')) {
    const frames = [...gallery.querySelectorAll('.tr-frame')];
    const controls = document.createElement('div');
    controls.className = 'tr-controls';
    controls.setAttribute('role','group');
    controls.setAttribute('aria-label','Choose a view of '+gallery.dataset.project);
    const buttons = [];
    const select = index => {
      gallery.classList.toggle('compare',index === -1);
      frames.forEach((f,i) => {
        f.classList.toggle('is-active',i === index);
        f.inert = index !== -1 && i !== index;
      });
      buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(index === (i === frames.length ? -1 : i))));
    };
    frames.forEach((frame,index) => {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = frame.dataset.label;
      button.setAttribute('aria-controls',frame.id);
      button.addEventListener('click',()=>select(index));
      controls.append(button); buttons.push(button);
    });
    const compare = document.createElement('button');
    compare.type = 'button'; compare.textContent = 'Compare all';
    compare.addEventListener('click',()=>select(-1));
    controls.append(compare);buttons.push(compare);
    gallery.querySelector('.tr-frames').after(controls);
    gallery.classList.add('is-ready');
    select(Number(gallery.dataset.start || 0));
  }
})();
