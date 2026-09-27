/* =========================================================
   SHINE Refresh — script.js
   No dependencies. ~80 lines.
   ========================================================= */

(function () {
  'use strict';

  /* --- Announcement bar dismiss ---------------------- */
  const STORAGE_KEY = 'shine_ann_dismissed';
  const bar = document.querySelector('.announcement-bar');
  if (bar) {
    if (localStorage.getItem(STORAGE_KEY) === '1') {
      document.body.classList.add('ann-hidden');
    }
    const closeBtn = bar.querySelector('.announcement-bar__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.body.classList.add('ann-hidden');
        try { localStorage.setItem(STORAGE_KEY, '1'); } catch (_) {}
      });
    }
  }

  /* --- Sticky nav background on scroll -------------- */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 80) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* --- Mobile nav toggle ---------------------------- */
  const navToggle = document.querySelector('.nav__toggle');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      document.body.classList.toggle('nav-open');
    });
  }

  /* --- Mobile sticky CTA via IntersectionObserver -- */
  const hero = document.querySelector('.hero');
  const mobileCta = document.querySelector('.mobile-cta');
  if (hero && mobileCta) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            mobileCta.classList.remove('visible');
            document.body.classList.remove('mobile-cta-visible');
          } else {
            mobileCta.classList.add('visible');
            document.body.classList.add('mobile-cta-visible');
          }
        });
      },
      { rootMargin: '-80px 0px 0px 0px', threshold: 0 }
    );
    io.observe(hero);
  }

  /* --- Video facade (click-to-play) ----------------- */
  const videoFacade = document.querySelector('.video__facade');
  if (videoFacade) {
    videoFacade.addEventListener('click', () => {
      if (videoFacade.dataset.loaded) return;
      const id = videoFacade.dataset.youtubeId || 'dQw4w9WgXcQ'; // placeholder
      const title = videoFacade.dataset.videoTitle || 'SHINE: A Musical Theatre Creation Intensive';
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
      iframe.title = title;
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
      videoFacade.innerHTML = '';
      videoFacade.appendChild(iframe);
      videoFacade.dataset.loaded = '1';
    });
  }

  /* --- Gallery lightbox ------------------------------ */
  const galleryItems = Array.from(document.querySelectorAll('.gallery__item'));
  const lightbox = document.querySelector('.lightbox');
  if (galleryItems.length && lightbox) {
    const lbImg = lightbox.querySelector('.lightbox__img');
    const btnPrev = lightbox.querySelector('.lightbox__btn--prev');
    const btnNext = lightbox.querySelector('.lightbox__btn--next');
    const btnClose = lightbox.querySelector('.lightbox__close');
    let idx = 0;

    const sources = galleryItems.map((el) => ({
      src: el.querySelector('img').getAttribute('data-full') || el.querySelector('img').src,
      alt: el.querySelector('img').alt,
    }));

    const open = (i) => {
      idx = i;
      lbImg.src = sources[i].src;
      lbImg.alt = sources[i].alt;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    };
    const prev = () => open((idx - 1 + sources.length) % sources.length);
    const next = () => open((idx + 1) % sources.length);

    galleryItems.forEach((el, i) => el.addEventListener('click', () => open(i)));
    btnPrev.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
    btnNext.addEventListener('click', (e) => { e.stopPropagation(); next(); });
    btnClose.addEventListener('click', close);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    });
  }

  /* --- Smooth scroll with sticky nav offset (fallback) - */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      document.body.classList.remove('nav-open');
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
