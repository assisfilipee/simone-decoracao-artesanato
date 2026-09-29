(() => {
  'use strict';
  const top = document.querySelector('.back-top');
  const hero = document.querySelector('.hero');
  const whatsapp = document.querySelector('.whatsapp-float');
  const bubble = document.querySelector('.contact-bubble');
  const updateTop = () => { top.hidden = window.scrollY < hero.offsetHeight * .8; };
  window.addEventListener('scroll', updateTop, { passive: true });
  window.addEventListener('resize', updateTop, { passive: true });
  updateTop();
  let automatic = false;
  let hovered = false;
  const render = () => bubble.classList.toggle('is-visible', automatic || hovered);
  let hideTimer;
  const showTimer = setTimeout(() => {
    automatic = true; render();
    hideTimer = setTimeout(() => { automatic = false; render(); }, 3000);
  }, 5000);
  whatsapp.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovered = true; render(); } });
  whatsapp.addEventListener('pointerleave', () => { hovered = false; render(); });
  window.addEventListener('pagehide', () => { clearTimeout(showTimer); clearTimeout(hideTimer); automatic = false; hovered = false; render(); });
})();
