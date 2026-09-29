(() => {
  'use strict';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const elements = [...document.querySelectorAll('[data-reveal]')];
  let observer;
  function revealAll() { elements.forEach(element => element.classList.remove('is-pending')); observer?.disconnect(); }
  if (!motion.matches && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.remove('is-pending');
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.08 });
    elements.forEach(element => { element.classList.add('is-pending'); observer.observe(element); });
  }
  const hero = document.querySelector('.hero');
  const art = document.querySelector('.hero-art');
  const decoration = document.querySelector('.organic-line');
  const finePointer = matchMedia('(pointer: fine)');
  hero.addEventListener('pointermove', event => {
    if (motion.matches || !finePointer.matches) return;
    const rect = hero.getBoundingClientRect();
    art.style.setProperty('--mouse-x', `${(event.clientX / rect.width - .5) * 5}px`);
    art.style.setProperty('--mouse-y', `${((event.clientY - rect.top) / rect.height - .5) * 5}px`);
  }, { passive: true });
  hero.addEventListener('pointerleave', () => { art.style.setProperty('--mouse-x', '0px'); art.style.setProperty('--mouse-y', '0px'); });
  let scheduled = false;
  const parallax = () => {
    if (scheduled || motion.matches || window.scrollY > hero.offsetHeight) return;
    scheduled = true;
    requestAnimationFrame(() => { decoration.style.translate = `0 ${Math.min(window.scrollY * .025, 14)}px`; scheduled = false; });
  };
  window.addEventListener('scroll', parallax, { passive: true });
  motion.addEventListener('change', () => { if (motion.matches) { revealAll(); decoration.style.translate = ''; } });
})();
