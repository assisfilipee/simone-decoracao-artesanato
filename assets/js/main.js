(() => {
  'use strict';
  const header = document.querySelector('.site-header');
  const menu = document.querySelector('#mobile-menu');
  const toggle = document.querySelector('.menu-toggle');
  const lightbox = document.querySelector('.lightbox');
  const gallery = [...document.querySelectorAll('[data-gallery]')];
  const syncScrollLock = () => document.body.classList.toggle('modal-open', Boolean(document.querySelector('dialog[open]')));
  function closeMenu() { if (menu.open) menu.close(); }
  toggle.addEventListener('click', () => {
    menu.showModal();
    toggle.setAttribute('aria-expanded', 'true');
    syncScrollLock();
  });
  menu.querySelector('.menu-close').addEventListener('click', closeMenu);
  menu.addEventListener('click', event => {
    const rect = menu.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.target.closest('a')) closeMenu();
  });
  menu.addEventListener('close', () => { toggle.setAttribute('aria-expanded', 'false'); syncScrollLock(); });
  matchMedia('(min-width:1025px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 25);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        document.querySelectorAll('.desktop-nav a').forEach(link => {
          const active = link.hash === '#' + entry.target.id;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-15% 0px -65% 0px' });
    document.querySelectorAll('main section[id]').forEach(section => navObserver.observe(section));
  }
  // Native details keeps the FAQ accessible even without JavaScript.
  document.querySelectorAll('.faq-list details').forEach(detail => detail.addEventListener('toggle', () => {
    if (detail.open) document.querySelectorAll('.faq-list details[open]').forEach(other => { if (other !== detail) other.open = false; });
  }));
  let currentImage = 0;
  const lightboxImage = lightbox.querySelector('img');
  const caption = lightbox.querySelector('figcaption');
  function showImage(index) {
    currentImage = (index + gallery.length) % gallery.length;
    const source = gallery[currentImage].querySelector('img');
    lightboxImage.src = source.src;
    lightboxImage.alt = source.alt;
    caption.textContent = `${currentImage + 1} / ${gallery.length} — ${source.alt}`;
  }
  gallery.forEach((item, index) => item.addEventListener('click', event => {
    event.preventDefault(); showImage(index); lightbox.showModal(); syncScrollLock();
  }));
  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showImage(currentImage - 1));
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => showImage(currentImage + 1));
  lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
  lightbox.addEventListener('close', syncScrollLock);
  lightbox.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); showImage(currentImage + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  let touchStart = null;
  lightbox.addEventListener('touchstart', event => {
    if (event.touches.length === 1) touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });
  lightbox.addEventListener('touchend', event => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) showImage(currentImage + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, { passive: true });
})();
