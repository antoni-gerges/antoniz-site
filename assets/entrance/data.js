// Multi-project entrance. Real, verified work only. art:true = an artwork (key visual, poster, invitation):
// always shown whole (contain), never cropped. Photos (art:false) may be cropped.
// film = the loop used by the motion idea in the built version.
window.MP = [
  { n:'01', client:'ZEISS Vision Care', what:'Product launch', place:'Dubai', year:'2022', credit:'with Mission Control X',
    img:'a/dinner-2400.webp', pos:'50% 50%', film:'../zeiss2/a/c12-wall-720.mp4' },
  { n:'02', client:'Coca-Cola Arena', what:'Why Not! Mazzika Festival', place:'Dubai', year:'2019', credit:'with Mission Control X',
    img:'a/mazzika-cover.webp', pos:'75% 50%', posC:'100% 45%', film:'../../media/films/mazzika-720.mp4' },
  { n:'03', client:'Liwa International Festival', what:'Campaign, film and festival build', place:'Abu Dhabi', year:'2019–20',
    img:'a/liwa-s1f-quad-into-sun.webp', pos:'48% 58%', kv:'a/kv-2400.webp', kvTint:'#c4935f', film:'../liwa-film/a/s1f-quad-into-sun-720.mp4' },
  { n:'04', client:'Majid Al Futtaim', what:'Anniversary event at the Pyramids', place:'Giza', year:'2021',
    img:'a/pyr-invite.webp', art:true, tint:'#0d0b08', photo:'a/pyr-night.webp' },
  { n:'05', client:'Dubai Health Authority', what:'Brand identity and launch', place:'Dubai', year:'2008',
    img:'a/launch-ads-2400.webp', art:true, tint:'#d4e4ee' },
  { n:'06', client:'Cityscape Abu Dhabi', what:'Exhibition stand, 14 projects', place:'Abu Dhabi', year:'2017',
    img:'a/cityscape-44.webp', pos:'50% 40%' },
  { n:'07', client:'UAE Ministry of Education', what:'Bullying Prevention Week', place:'UAE', year:'2018',
    img:'a/door-2400.webp', art:true, tint:'#bacbb2' },
  { n:'08', client:'Unilever', what:'Around the World in 3 Days', place:'Istanbul', year:'2018', credit:'with Mission Control X',
    img:'a/unilever-world.webp', art:true, tint:'#90cfeb' },
  { n:'09', client:'AIAASC', what:'Rebrand of an accreditation body', place:'New York / Dubai', year:'2021',
    img:'a/aiaasc-alpha.webp', art:true, tint:'#000' },
  { n:'10', client:'Lilly Singh', what:'Live in Dubai, show campaign', place:'Dubai', year:'2017', credit:'with Mission Control X',
    img:'a/lilly-clock.webp', art:true, tint:'#c8202a' },
  { n:'11', client:'Al Forsan', what:'Sports resort campaign', place:'Abu Dhabi', year:'2009',
    img:'a/hoarding-2400.webp', pos:'50% 50%' },
  { n:'12', client:'Big Grill Festival', what:'Poster and festival system', place:'Abu Dhabi', year:'2018', credit:'with Mission Control X',
    img:'a/grill-stage.webp', pos:'50% 45%' },
];
window.LINE='Big ideas, built.';
window.SUB='Twenty-three years taking ideas all the way: the first drawing, the campaign, the pavilion, the festival, the stage. Abu Dhabi, Dubai, Cairo. Now Tampa.';
window.MARK = '<svg class="mark" viewBox="28 20 226 243" fill="currentColor" aria-label="Antoni Gerges"><path d="M 75.246094 115.625 C 68.671875 115.625 62.894531 119.992188 61.101562 126.320312 L 49.550781 167.089844 C 56.128906 167.089844 61.90625 162.726562 63.699219 156.394531 Z M 82.558594 156.394531 L 94.109375 115.625 C 87.53125 115.625 81.753906 119.992188 79.960938 126.320312 L 68.410156 167.089844 C 74.988281 167.089844 80.765625 162.726562 82.558594 156.394531 M 185.890625 116.859375 L 153.070312 116.707031 L 179.902344 21.996094 C 149.394531 21.996094 122.597656 42.253906 114.285156 71.609375 L 101.578125 116.464844 L 87.539062 166.011719 L 60.710938 260.722656 C 91.21875 260.722656 118.011719 240.460938 126.328125 211.109375 L 139.035156 166.253906 L 251.277344 166.777344 C 243.097656 137.386719 216.398438 117.003906 185.890625 116.859375 M 42.242188 126.320312 L 30.691406 167.089844 C 37.269531 167.089844 43.046875 162.726562 44.839844 156.394531 L 56.386719 115.625 C 49.8125 115.625 44.035156 119.992188 42.242188 126.320312 "/></svg>';
window.pic = (p, cls='') => p.art
  ? `<div class="pic fit ${cls}" style="--tint:${p.tint||'#111'}"><img src="${p.img}" alt="${p.client}, ${p.what}"></div>`
  : `<div class="pic ${cls}" style="--pos:${p.pos||'50% 50%'}"><img src="${p.img}" alt="${p.client}, ${p.what}"></div>`;
window.asKV = p => p.kv ? {...p, img:p.kv, art:true, tint:p.kvTint} : p;
