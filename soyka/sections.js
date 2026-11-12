// Анимации блоков ниже первого экрана (GSAP + ScrollTrigger)
gsap.registerPlugin(ScrollTrigger);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Первый экран: название ресторана плавно выезжает ---------- */
(function intro(){
  // объёмные слои букв (тень-толщина за надписью)
  const word=document.getElementById('word');
  const EX=innerWidth<720?6:10;
  // объём — плоский сдвиг слоёв вниз (без translateZ), чтобы буквы не меняли размер из-за перспективы
  for(let i=EX;i>=0;i--){const d=document.createElement('div'); d.className='l'+(i?' ex':''); d.style.transform=`translateY(${i*.7}px)`; word.appendChild(d);}
  // слоган — по словам
  const tl=document.getElementById('tagline');
  tl.innerHTML=tl.innerHTML.split(' ').map(w=>'<span>'+w+'</span>').join(' ');

  if(reduceMotion){ gsap.set('.tagline span, .top > *, .foot',{opacity:1}); return; }

  // название плавно выплывает снизу, без 3D-поворота: размер букв всё время один и тот же
  gsap.set('#word',{opacity:0, yPercent:35});
  gsap.set('#breve',{opacity:0, y:-40});
  gsap.set('#sub',{opacity:0, y:24});
  gsap.set('.tagline span',{opacity:0, y:22});
  // шапка только проявляется, без сдвига: при сдвиге тонкая рамка «Забронировать» мерцала на дробных пикселях
  gsap.set('.top > *, .foot',{opacity:0});

  gsap.timeline({defaults:{ease:'expo.out'}, delay:.25})
    .to('#word',{opacity:1, duration:.9, ease:'power2.out'},0)
    .to('#word',{yPercent:0, duration:2.2},0)
    .to('#breve',{opacity:1, y:0, duration:1.6},.7)
    .to('#sub',{opacity:1, y:0, duration:1.6},.9)
    .to('.tagline span',{opacity:1, y:0, duration:1.4, stagger:.05},1.1)
    .to('.top > *, .foot',{opacity:1, duration:1.2, stagger:.08, ease:'power1.out'},1.6);
})();

/* первый экран уходит вглубь при прокрутке */
gsap.set('#brand',{xPercent:-50, yPercent:-50, x:0, y:0});
gsap.to('#brand', {y:-90, scale:.94, opacity:0, ease:'none',
  scrollTrigger:{trigger:'#hero', start:'top top', end:'bottom top', scrub:true}});

/* ---------- Бургер-меню: открыть / закрыть ---------- */
(function burger(){
  const b=document.getElementById('burger'), d=document.getElementById('drawer');
  const set=open=>{
    d.classList.toggle('open',open); d.setAttribute('aria-hidden',!open);
    b.setAttribute('aria-expanded',open); document.body.classList.toggle('menu-open',open);
  };
  b.onclick=()=>set(true);
  d.querySelectorAll('[data-close], .drawer-nav a').forEach(el=>el.addEventListener('click',()=>set(false)));
  addEventListener('keydown',e=>{ if(e.key==='Escape') set(false); });
})();

/* ---------- Фото ресторана: стрелки листают ленту на одно фото ---------- */
(function gallery(){
  document.querySelectorAll('.gal-wrap').forEach(w=>{
    const t=w.querySelector('.gal-track');
    const step=()=>t.querySelector('img').offsetWidth+20;
    w.querySelector('.gal-btn.prev').onclick=()=>t.scrollBy({left:-step()});
    w.querySelector('.gal-btn.next-btn').onclick=()=>t.scrollBy({left:step()});
    if(!reduceMotion) gsap.from(t.querySelectorAll('img'),{y:60, opacity:0, duration:1.2, ease:'expo.out', stagger:.08, scrollTrigger:{trigger:t, start:'top 85%'}});
  });
  if(!reduceMotion){
    gsap.from('.signage',{y:30, opacity:0, duration:1.2, ease:'expo.out', scrollTrigger:{trigger:'#gallery', start:'top 85%'}});
    document.querySelectorAll('.menu-intro').forEach(s=>
      gsap.from(s.querySelectorAll('.sec-title, .sec-text, .btn-line'),{y:30, opacity:0, duration:1.2, ease:'expo.out', stagger:.1, scrollTrigger:{trigger:s, start:'top 80%'}}));
    gsap.from('.collab-box',{y:40, opacity:0, duration:1.3, ease:'expo.out', scrollTrigger:{trigger:'.collab', start:'top 75%'}});
  }
})();

/* ---------- Награды ---------- */
// цитата — просто белый текст, без анимации
if(!reduceMotion){
  gsap.fromTo('.quote .mark',{rotationY:-90, rotationX:30, opacity:0, scale:.6},
    {rotationY:0, rotationX:0, opacity:.9, scale:1, ease:'expo.out', duration:1.6,
     scrollTrigger:{trigger:'.quote', start:'top 80%'}});
  gsap.from('.awards .label',{x:-30, opacity:0, duration:1, ease:'expo.out', scrollTrigger:{trigger:'.awards', start:'top 80%'}});


  // карточки вылетают из глубины по очереди
  gsap.set('.award',{opacity:0, rotationX:-55, y:120, z:-260, transformOrigin:'50% 100%'});
  ScrollTrigger.batch('.award',{start:'top 88%', once:true, onEnter:els=>{
    gsap.to(els,{opacity:1, rotationX:0, y:0, z:0, duration:1.3, ease:'expo.out', stagger:.12});
    els.forEach((el,i)=>{
      // печать награды переворачивается, как монета
      gsap.fromTo(el.querySelector('.seal'),{rotationY:-180},{rotationY:0, duration:1.4, delay:.15+i*.12, ease:'back.out(1.4)'});
      // счётчик «ТОП-10»
      const n=el.querySelector('[data-count]');
      if(n){ const o={v:0}; gsap.to(o,{v:+n.dataset.count, duration:1.4, delay:.2+i*.12, ease:'power2.out',
        onUpdate:()=>n.textContent=Math.round(o.v)}); }
      // звёзды выпрыгивают
      gsap.from(el.querySelectorAll('.stars i'),{scale:0, rotation:-120, duration:.8, delay:.45+i*.12, stagger:.12, ease:'back.out(2.5)'});
    });
  }});
}
